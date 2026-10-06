import { requireSupabase } from '../lib/supabase';

export async function submitContactMessage({ name, email, message }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('contact_messages')
    .insert({
      name: String(name || '').trim().slice(0, 120),
      email: String(email || '').trim().slice(0, 160),
      message: String(message || '').trim().slice(0, 5000),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchContactMessages() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('contact_messages')
    .select('id, name, email, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function markMessageRead(id, isRead = true) {
  const client = requireSupabase();
  const { error } = await client
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteContactMessage(id) {
  const client = requireSupabase();
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}
