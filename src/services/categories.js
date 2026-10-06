import { requireSupabase } from '../lib/supabase';

export async function fetchCategories() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .select('id, name_fr, name_ar, created_at')
    .order('name_fr', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory({ name_fr, name_ar }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .insert({ name_fr, name_ar })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, { name_fr, name_ar }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .update({ name_fr, name_ar })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const client = requireSupabase();
  const { error } = await client.from('categories').delete().eq('id', id);
  if (error) throw error;
}
