import { requireSupabase } from '../lib/supabase';

export async function fetchProfiles() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, name, role, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateProfileRole(id, role) {
  if (!['admin', 'editor'].includes(role)) throw new Error('Invalid role');
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
