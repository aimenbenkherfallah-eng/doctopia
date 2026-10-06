import { requireSupabase } from '../lib/supabase';

export const SETTING_KEYS = [
  'hero_eyebrow',
  'hero_subtitle',
  'home_about_text',
  'about_subtitle',
  'about_p1',
  'about_p2',
  'about_p3',
  'about_principles_title',
  'about_principle1_title',
  'about_principle1_text',
  'about_principle2_title',
  'about_principle2_text',
  'about_principle3_title',
  'about_principle3_text',
  'footer_tagline',
  'footer_email',
  'footer_rights',
  'contact_subtitle',
  'contact_email',
  'contact_social_text',
  'order_text',
  'order_phone',
  'order_whatsapp',
];

export const SINGLE_VALUE_KEYS = ['footer_email', 'contact_email', 'order_phone', 'order_whatsapp'];

export async function fetchSettings() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('site_settings')
    .select('key, value_fr, value_ar');
  if (error) throw error;
  const map = {};
  for (const row of data ?? []) map[row.key] = row;
  return map;
}

export async function upsertSetting(key, { value_fr, value_ar }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('site_settings')
    .upsert({ key, value_fr, value_ar }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function pickSetting(map, key, lng, fallback = '') {
  const row = map?.[key];
  if (!row) return fallback;
  if (lng === 'ar') return row.value_ar || row.value_fr || fallback;
  return row.value_fr || row.value_ar || fallback;
}
