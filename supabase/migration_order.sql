-- =====================================================================
-- DOCTOPIA - Migration: order button settings (supplier contact info)
-- Run this in Supabase Dashboard → SQL Editor if your database already
-- exists (created before the "Commander" button). Safe to run multiple
-- times. Fresh installs using schema.sql do NOT need this file.
-- =====================================================================

insert into public.site_settings (key, value_fr, value_ar) values
  ('order_text', 'Pour commander ce livre, contactez le fournisseur par téléphone, WhatsApp ou e-mail en précisant le titre du livre.', 'لطلب هذا الكتاب، تواصل مع المورّد عبر الهاتف أو واتساب أو البريد الإلكتروني مع ذكر عنوان الكتاب.'),
  ('order_phone', '', ''),
  ('order_whatsapp', '', '')
on conflict (key) do nothing;
