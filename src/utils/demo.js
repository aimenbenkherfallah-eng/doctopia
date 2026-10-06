export const DEMO_CATEGORIES = [
  { id: 'demo-roman', name_fr: 'Roman', name_ar: 'رواية' },
  { id: 'demo-poesie', name_fr: 'Poésie', name_ar: 'شعر' },
  { id: 'demo-histoire', name_fr: 'Histoire', name_ar: 'تاريخ' },
  { id: 'demo-pensee', name_fr: 'Pensée', name_ar: 'فكر' },
];

const img = (seed, w = 600, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const DEMO_BOOKS = [
  {
    id: 'demo-1',
    title_fr: 'L’Étranger - édition d’archive',
    title_ar: 'الغريب - طبعة أرشيفية',
    description_fr: 'Notice de démonstration. Configurez Supabase pour afficher vos vrais livres.',
    description_ar: 'بطاقة تجريبية. اضبط Supabase لعرض كتبك الحقيقية.',
    author: 'Albert Camus',
    publisher: 'Gallimard',
    publication_year: 1942,
    language: 'fr',
    category_id: 'demo-roman',
    created_at: new Date().toISOString(),
    categories: DEMO_CATEGORIES[0],
    book_images: [
      { id: 'd1-1', storage_path: '', image_type: 'cover', display_order: 0, _demoUrl: img('doctopia-cover-1') },
      { id: 'd1-2', storage_path: '', image_type: 'gallery', display_order: 1, _demoUrl: img('doctopia-back-1', 800, 600) },
    ],
  },
  {
    id: 'demo-2',
    title_fr: 'Cahiers de poésie',
    title_ar: 'دفاتر شعرية',
    description_fr: 'Notice de démonstration.',
    description_ar: 'بطاقة تجريبية.',
    author: 'Andrée Chedid',
    publisher: 'Flammarion',
    publication_year: 1985,
    language: 'fr',
    category_id: 'demo-poesie',
    created_at: new Date().toISOString(),
    categories: DEMO_CATEGORIES[1],
    book_images: [{ id: 'd2-1', storage_path: '', image_type: 'cover', display_order: 0, _demoUrl: img('doctopia-cover-2') }],
  },
  {
    id: 'demo-3',
    title_fr: 'Histoire d’Alger',
    title_ar: 'تاريخ الجزائر',
    description_fr: 'Notice de démonstration.',
    description_ar: 'بطاقة تجريبية.',
    author: 'Collectif',
    publisher: 'Casbah',
    publication_year: 2001,
    language: 'ar',
    category_id: 'demo-histoire',
    created_at: new Date().toISOString(),
    categories: DEMO_CATEGORIES[2],
    book_images: [{ id: 'd3-1', storage_path: '', image_type: 'cover', display_order: 0, _demoUrl: img('doctopia-cover-3') }],
  },
  {
    id: 'demo-4',
    title_fr: 'Essais sur la lecture',
    title_ar: 'مقالات عن القراءة',
    description_fr: 'Notice de démonstration.',
    description_ar: 'بطاقة تجريبية.',
    author: 'Montaigne',
    publisher: 'PUF',
    publication_year: 1592,
    language: 'fr',
    category_id: 'demo-pensee',
    created_at: new Date().toISOString(),
    categories: DEMO_CATEGORIES[3],
    book_images: [{ id: 'd4-1', storage_path: '', image_type: 'cover', display_order: 0, _demoUrl: img('doctopia-cover-4') }],
  },
];

export function demoCoverOf(book) {
  const images = [...(book?.book_images ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const cover = images.find((i) => i.image_type === 'cover') ?? images[0];
  return cover?._demoUrl ?? '';
}
