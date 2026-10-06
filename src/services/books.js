import { BUCKET, requireSupabase } from '../lib/supabase';
import { slugifyFileName } from '../utils/constants';
import { optimizeImage } from '../utils/image';

const BOOK_SELECT = `
  id, title_fr, title_ar, description_fr, description_ar,
  author, publisher, publication_year, language,
  category_id, created_by, created_at, updated_at,
  categories ( id, name_fr, name_ar ),
  book_images ( id, book_id, storage_path, image_url, image_type, display_order, created_at )
`;

function sortImages(images = []) {
  return [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export function publicImageUrl(storagePath) {
  if (!storagePath) return '';
  try {
    const client = requireSupabase();
    const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath);
    return data?.publicUrl ?? '';
  } catch {
    return '';
  }
}

export function coverOf(book) {
  const images = sortImages(book?.book_images ?? []);
  const cover = images.find((i) => i.image_type === 'cover') ?? images[0];
  if (!cover) return '';
  if (cover._demoUrl) return cover._demoUrl;
  return imageSrc(cover);
}

export function imageSrc(img) {
  if (!img) return '';
  if (img._demoUrl) return img._demoUrl;
  if (img.image_url) return img.image_url;
  return publicImageUrl(img.storage_path);
}

export function isExternalImage(img) {
  return Boolean(img?.image_url) && !img?.storage_path;
}

export function isValidImageUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function fetchBooks({ search = '', categoryId = '', language = '', orderBy = 'recent' } = {}) {
  const client = requireSupabase();
  let query = client.from('books').select(BOOK_SELECT);

  if (search.trim()) {
    const s = search.trim().replace(/[%_]/g, '');
    query = query.or(`title_fr.ilike.%${s}%,title_ar.ilike.%${s}%,author.ilike.%${s}%`);
  }
  if (categoryId) query = query.eq('category_id', categoryId);
  if (language) query = query.eq('language', language);

  if (orderBy === 'title') query = query.order('title_fr', { ascending: true });
  else if (orderBy === 'year') query = query.order('publication_year', { ascending: false, nullsFirst: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query.limit(200);
  if (error) throw error;
  return (data ?? []).map((b) => ({ ...b, book_images: sortImages(b.book_images) }));
}

export async function fetchBookById(id) {
  const client = requireSupabase();
  const { data, error } = await client.from('books').select(BOOK_SELECT).eq('id', id).single();
  if (error) throw error;
  return { ...data, book_images: sortImages(data.book_images) };
}

export async function fetchRecentBooks(limit = 8) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('books')
    .select(BOOK_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((b) => ({ ...b, book_images: sortImages(b.book_images) }));
}

export async function uploadBookImages(bookId, files, { startOrder = 0 } = {}) {
  const client = requireSupabase();
  const uploaded = [];
  try {
    let order = startOrder;
    for (const file of files) {
      const optimized = await optimizeImage(file);
      const safe = slugifyFileName(optimized.name || `image-${Date.now()}.webp`);
      const path = `book-${bookId}/${Date.now()}-${order}-${safe}`;
      const { error: upErr } = await client.storage
        .from(BUCKET)
        .upload(path, optimized, { contentType: optimized.type || 'image/webp', upsert: false });
      if (upErr) throw upErr;
      uploaded.push(path);
      const { data, error: dbErr } = await client
        .from('book_images')
        .insert({
          book_id: bookId,
          storage_path: path,
          image_type: order === 0 && startOrder === 0 ? 'cover' : 'gallery',
          display_order: order,
        })
        .select()
        .single();
      if (dbErr) throw dbErr;
      order += 1;
      void data;
    }
    return uploaded;
  } catch (e) {
    for (const path of uploaded) {
      try {
        await client.storage.from(BUCKET).remove([path]);
      } catch {}
    }
    throw e;
  }
}

export async function addBookImageUrls(bookId, urls, { startOrder = 0 } = {}) {
  const clean = (urls ?? []).map((u) => String(u || '').trim()).filter((u) => u.length > 0);
  if (clean.length === 0) return [];
  const client = requireSupabase();
  const rows = clean.map((url, i) => ({
    book_id: bookId,
    storage_path: null,
    image_url: url,
    image_type: startOrder === 0 && i === 0 ? 'cover' : 'gallery',
    display_order: startOrder + i,
  }));
  const { data, error } = await client.from('book_images').insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

export async function createBook(payload, files = [], imageUrls = []) {
  const client = requireSupabase();
  const { data: { user } } = await client.auth.getUser();
  const { data, error } = await client
    .from('books')
    .insert({ ...payload, created_by: user?.id ?? null })
    .select('id')
    .single();
  if (error) throw error;
  const bookId = data.id;
  if (files.length > 0) {
    await uploadBookImages(bookId, files, { startOrder: 0 });
  }
  const nextOrder = files.length;
  if (imageUrls.length > 0) {
    await addBookImageUrls(bookId, imageUrls, { startOrder: nextOrder });
  }
  return bookId;
}

export async function updateBook(id, payload) {
  const client = requireSupabase();
  const { data, error } = await client.from('books').update(payload).eq('id', id).select('id').single();
  if (error) throw error;
  return data;
}

export async function deleteBook(id) {
  const client = requireSupabase();
  const { data: images } = await client.from('book_images').select('storage_path').eq('book_id', id);
  const paths = (images ?? []).map((i) => i.storage_path).filter(Boolean);
  const { error } = await client.from('books').delete().eq('id', id);
  if (error) throw error;
  if (paths.length > 0) {
    try {
      await client.storage.from(BUCKET).remove(paths);
    } catch {}
  }
}

export async function deleteBookImage(imageRow) {
  const client = requireSupabase();
  const { error } = await client.from('book_images').delete().eq('id', imageRow.id);
  if (error) throw error;
  if (imageRow.storage_path) {
    try {
      await client.storage.from(BUCKET).remove([imageRow.storage_path]);
    } catch {}
  }
}

export async function updateImageOrder(rows) {
  const client = requireSupabase();
  for (const row of rows) {
    const { error } = await client
      .from('book_images')
      .update({ display_order: row.display_order, image_type: row.image_type })
      .eq('id', row.id);
    if (error) throw error;
  }
}

export async function setCoverImage(bookId, imageId) {
  const client = requireSupabase();
  const { data: images, error: fetchErr } = await client
    .from('book_images')
    .select('id')
    .eq('book_id', bookId);
  if (fetchErr) throw fetchErr;
  for (const img of images ?? []) {
    const { error } = await client
      .from('book_images')
      .update({ image_type: img.id === imageId ? 'cover' : 'gallery' })
      .eq('id', img.id);
    if (error) throw error;
  }
}
