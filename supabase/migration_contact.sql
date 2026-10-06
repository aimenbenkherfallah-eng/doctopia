-- =====================================================================
-- DOCTOPIA - Migration: contact section (messages + settings keys)
-- Run this in Supabase Dashboard → SQL Editor if you already ran
-- migration_settings_imageurl.sql. Safe to run multiple times.
-- Fresh installs using schema.sql do NOT need this file.
-- =====================================================================

insert into public.site_settings (key, value_fr, value_ar) values
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
