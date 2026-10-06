export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function isDemoMode() {
  return !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

export function localizedTitle(book, lng) {
  if (!book) return '';
  return lng === 'ar' ? book.title_ar || book.title_fr : book.title_fr || book.title_ar;
}

export function localizedDescription(book, lng) {
  if (!book) return '';
  return lng === 'ar' ? book.description_ar || book.description_fr : book.description_fr || book.description_ar;
}

export function localizedCategoryName(category, lng) {
  if (!category) return '';
  return lng === 'ar' ? category.name_ar || category.name_fr : category.name_fr || category.name_ar;
}

export function formatDate(value, lng) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(lng === 'ar' ? 'ar' : 'fr-FR', {
      dateStyle: 'medium',
    }).format(new Date(value));
  } catch {
    return String(value).slice(0, 10);
  }
}

export function slugifyFileName(name) {
  return String(name || 'image')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 80);
}
