-- =====================================================================
-- DOCTOPIA - Migration for databases created BEFORE site_settings / image_url
-- Run this in Supabase Dashboard → SQL Editor if you already ran the
-- first version of schema.sql (relation "book_images" already exists).
-- Safe to run multiple times.
-- =====================================================================

-- 1. Allow external image URLs (saves storage space)
alter table public.book_images add column if not exists image_url text;
alter table public.book_images alter column storage_path drop not null;

-- Add "at least one source" check (skip if it already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'book_images_source_check'
  ) then
    alter table public.book_images
      add constraint book_images_source_check
      check (storage_path is not null or image_url is not null);
  end if;
end $$;

-- 2. Site-wide editable texts (hero / about / footer)
create table if not exists public.site_settings (
  key text primary key,
  value_fr text,
  value_ar text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

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

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "messages_public_insert" on public.contact_messages;
create policy "messages_public_insert" on public.contact_messages
  for insert with check (true);

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
