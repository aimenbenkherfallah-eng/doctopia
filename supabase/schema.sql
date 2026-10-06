-- =====================================================================
-- DOCTOPIA - Supabase PostgreSQL schema + RLS + Storage policies
-- Run this in Supabase Dashboard → SQL Editor (paste in order).
-- Requires: Auth enabled (email/password). Creates tables, indexes,
-- RLS policies and the `book-images` storage bucket policies.
-- =====================================================================

-- ---------- 0. Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- 1. Tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_ar text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text not null,
  description_fr text,
  description_ar text,
  author text not null,
  publisher text,
  publication_year int check (publication_year is null or (publication_year between 0 and 2100)),
  language text not null default 'fr',
  category_id uuid references public.categories (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  storage_path text,
  image_url text,
  image_type text not null default 'gallery' check (image_type in ('cover', 'gallery')),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  check (storage_path is not null or image_url is not null)
);

create table if not exists public.site_settings (
  key text primary key,
  value_fr text,
  value_ar text,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 1b. Helper (APRES les tables : profiles doit exister) ----------
-- Returns the role ('admin' | 'editor' | null) of the requesting user.
create or replace function public.current_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
  before update on public.books
  for each row execute function public.touch_updated_at();

-- Auto-create a profile row when a new auth user signs up.
-- Default role = editor; promote the first/chosen users to admin via Dashboard.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 'editor')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. Indexes ----------
create index if not exists idx_books_category on public.books (category_id);
create index if not exists idx_books_created on public.books (created_at desc);
create index if not exists idx_books_author on public.books (author);
create index if not exists idx_books_title_fr on public.books (title_fr);
create index if not exists idx_books_title_ar on public.books (title_ar);
create index if not exists idx_images_book on public.book_images (book_id, display_order);

-- ---------- 3. Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.book_images enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- ----- profiles -----
-- Users can read their own profile; admins can read all.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (
    auth.uid() = id or public.current_role() = 'admin'
  );

-- Users may update their own name only (role changes are admin-only, see below).
drop policy if exists "profiles_update_own_name" on public.profiles;
create policy "profiles_update_own_name" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (incl. role).
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- No public insert: rows are created by the handle_new_user trigger (security definer).

-- ----- categories -----
-- Public read (catalog filters).
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

-- Admin-only write.
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert" on public.categories
  for insert with check (public.current_role() = 'admin');

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update" on public.categories
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete" on public.categories
  for delete using (public.current_role() = 'admin');

-- ----- books -----
-- Public read (catalog is open, no login required).
drop policy if exists "books_public_read" on public.books;
create policy "books_public_read" on public.books
  for select using (true);

-- Editors + admins can insert.
drop policy if exists "books_editor_insert" on public.books;
create policy "books_editor_insert" on public.books
  for insert with check (public.current_role() in ('editor', 'admin'));

-- Editors + admins can update.
drop policy if exists "books_editor_update" on public.books;
create policy "books_editor_update" on public.books
  for update using (public.current_role() in ('editor', 'admin'))
  with check (public.current_role() in ('editor', 'admin'));

-- Admin-only delete (editors cannot delete).
drop policy if exists "books_admin_delete" on public.books;
create policy "books_admin_delete" on public.books
  for delete using (public.current_role() = 'admin');

-- ----- book_images -----
drop policy if exists "images_public_read" on public.book_images;
create policy "images_public_read" on public.book_images
  for select using (true);

drop policy if exists "images_editor_insert" on public.book_images;
create policy "images_editor_insert" on public.book_images
  for insert with check (public.current_role() in ('editor', 'admin'));

drop policy if exists "images_editor_update" on public.book_images;
create policy "images_editor_update" on public.book_images
  for update using (public.current_role() in ('editor', 'admin'))
  with check (public.current_role() in ('editor', 'admin'));

drop policy if exists "images_editor_delete" on public.book_images;
create policy "images_editor_delete" on public.book_images
  for delete using (public.current_role() in ('editor', 'admin'));

-- ----- site_settings -----
-- Public read (hero / about / footer texts are shown to visitors).
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

-- Admin-only write (site texts are NOT editable by editors).
drop policy if exists "settings_admin_insert" on public.site_settings;
create policy "settings_admin_insert" on public.site_settings
  for insert with check (public.current_role() = 'admin');

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

drop policy if exists "settings_admin_delete" on public.site_settings;
create policy "settings_admin_delete" on public.site_settings
  for delete using (public.current_role() = 'admin');

-- Default site texts (FR + AR). Upsert so re-running never duplicates.
insert into public.site_settings (key, value_fr, value_ar) values
  ('hero_eyebrow', 'Bibliothèque personnelle · Catalogue éditorial · Archive numérique', 'مكتبة شخصية · فهرس تحريري · أرشيف رقمي'),
  ('hero_subtitle', 'Une bibliothèque personnelle réunie avec soin - des livres choisis, photographiés et archivés comme une collection vivante.', 'مكتبة شخصية جُمعت بعناية - كتب مختارة، موثّقة بالصور ومحفوظة كأرشيف حيّ.'),
  ('home_about_text', 'DOCTOPIA rassemble des livres qui comptent : littérature, pensée, histoire et poésie. Chaque livre est présenté avec sa couverture, ses photographies et sa notice, pour garder la mémoire des éditions et des lectures.', 'دُكتوبيا تجمع الكتب التي تهمّنا: أدب وفكر وتاريخ وشعر. كل كتاب يُعرض بغلافه وصوره وبطاقته، حفظًا لذاكرة الطبعات والقراءات.'),
  ('about_subtitle', 'Bibliothèque personnelle · Catalogue éditorial · Archive numérique', 'مكتبة شخصية · فهرس تحريري · أرشيف رقمي'),
  ('about_p1', 'DOCTOPIA est une bibliothèque personnelle devenue catalogue : chaque livre est choisi, lu, photographié puis archivé avec sa notice.', 'دُكتوبيا مكتبة شخصية تحوّلت إلى فهرس: كل كتاب يُختار ويُقرأ ويُصوَّر ثم يُحفظ ببطاقته الخاصة.'),
  ('about_p2', 'L''objectif est simple - garder une trace fidèle des éditions, des couvertures et des lectures, et partager cette collection avec clarté et sobriété.', 'الهدف بسيط - حفظ أثر دقيق للطبعات والأغلفة والقراءات، ومشاركة هذه المجموعة بوضوح ورصانة.'),
  ('about_p3', 'Le site est un catalogue, pas une boutique : il n''y a ni panier, ni commande, ni paiement. Seulement des livres et leurs images.', 'الموقع فهرس وليس متجرًا: لا سلّة ولا طلبات ولا دفع. فقط كتب وصور.'),
  ('about_principles_title', 'Principes', 'المبادئ'),
  ('about_principle1_title', 'Les livres d''abord', 'الكتب أولًا'),
  ('about_principle1_text', 'La couverture et la photographie restent au centre. L''interface s''efface.', 'الغلاف والصورة في المركز، والواجهة تتراجع إلى الخلف.'),
  ('about_principle2_title', 'Sobriété éditoriale', 'رصانة تحريرية'),
  ('about_principle2_text', 'Typographie soignée, blancs généreux, palette restreinte.', 'خط أنيق ومساحات رحبة ولوحة ألوان محدودة.'),
  ('about_principle3_title', 'Archive durable', 'أرشيف دائم'),
  ('about_principle3_text', 'Notices bilingues, images ordonnées, mémoire des éditions.', 'بطاقات ثنائية اللغة وصور مرتّبة وذاكرة للطبعات.'),
  ('footer_tagline', 'Bibliothèque personnelle · Catalogue éditorial · Archive numérique.', 'مكتبة شخصية · فهرس تحريري · أرشيف رقمي.'),
  ('footer_email', 'contact@doctopia.example', 'contact@doctopia.example'),
  ('footer_rights', 'Tous droits réservés.', 'جميع الحقوق محفوظة.'),
  ('contact_subtitle', 'Écrivez à propos de la collection, d''une édition ou d''une suggestion.', 'راسلنا حول المجموعة أو طبعة ما أو اقتراح جديد.'),
  ('contact_email', 'contact@doctopia.example', 'contact@doctopia.example'),
  ('contact_social_text', 'Instagram, X, Facebook - ajoutez vos liens ici depuis les paramètres.', 'إنستغرام، إكس، فيسبوك - أضف روابطك هنا من الإعدادات.'),
  ('order_text', 'Pour commander ce livre, contactez le fournisseur par téléphone, WhatsApp ou e-mail en précisant le titre du livre.', 'لطلب هذا الكتاب، تواصل مع المورّد عبر الهاتف أو واتساب أو البريد الإلكتروني مع ذكر عنوان الكتاب.'),
  ('order_phone', '', ''),
  ('order_whatsapp', '', '')
on conflict (key) do nothing;

-- ----- contact_messages -----
-- Visitors can send a message without login. No public read.
drop policy if exists "messages_public_insert" on public.contact_messages;
create policy "messages_public_insert" on public.contact_messages
  for insert with check (true);

-- Admins read / update (mark read) / delete.
drop policy if exists "messages_admin_select" on public.contact_messages;
create policy "messages_admin_select" on public.contact_messages
  for select using (public.current_role() = 'admin');

drop policy if exists "messages_admin_update" on public.contact_messages;
create policy "messages_admin_update" on public.contact_messages
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

drop policy if exists "messages_admin_delete" on public.contact_messages;
create policy "messages_admin_delete" on public.contact_messages
  for delete using (public.current_role() = 'admin');

-- ---------- 4. Storage: bucket `book-images` ----------
insert into storage.buckets (id, name, public)
values ('book-images', 'book-images', true)
on conflict (id) do nothing;

-- Public read of all objects in the bucket (covers are shown to visitors).
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects
  for select using (bucket_id = 'book-images');

-- Editors + admins can upload.
drop policy if exists "storage_editor_insert" on storage.objects;
create policy "storage_editor_insert" on storage.objects
  for insert with check (
    bucket_id = 'book-images'
    and public.current_role() in ('editor', 'admin')
  );

-- Editors + admins can update/replace.
drop policy if exists "storage_editor_update" on storage.objects;
create policy "storage_editor_update" on storage.objects
  for update using (
    bucket_id = 'book-images'
    and public.current_role() in ('editor', 'admin')
  )
  with check (
    bucket_id = 'book-images'
    and public.current_role() in ('editor', 'admin')
  );

-- Editors + admins can delete.
drop policy if exists "storage_editor_delete" on storage.objects;
create policy "storage_editor_delete" on storage.objects
  for delete using (
    bucket_id = 'book-images'
    and public.current_role() in ('editor', 'admin')
  );

-- ---------- 5. Promote your first admin (run after creating the user in Auth) ----------
-- Replace the email, then run:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
