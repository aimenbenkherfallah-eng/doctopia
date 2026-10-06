import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Feedback';
import { fetchBooks } from '../../services/books';
import { fetchCategories } from '../../services/categories';
import { isDemoMode, localizedTitle } from '../../utils/constants';
import { DEMO_BOOKS, DEMO_CATEGORIES } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';

export default function AdminHome() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const [stats, setStats] = useState({ books: 0, categories: 0, images: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        setStats({ books: DEMO_BOOKS.length, categories: DEMO_CATEGORIES.length, images: 5 });
        setRecent(DEMO_BOOKS.slice(0, 5));
        setLoading(false);
        return;
      }
      try {
        const [books, cats] = await Promise.all([fetchBooks({}), fetchCategories()]);
        if (!alive) return;
        setStats({
          books: books.length,
          categories: cats.length,
          images: books.reduce((n, b) => n + (b.book_images?.length ?? 0), 0),
        });
        setRecent(books.slice(0, 5));
      } catch {} finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: t('admin.statsTotal'), value: stats.books },
    { label: t('admin.statsCategories'), value: stats.categories },
    { label: t('admin.statsImages'), value: stats.images },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t('admin.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('admin.subtitle')}</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[6px] border border-ink/12 bg-white p-4 text-center sm:p-5">
            <p className="font-display text-3xl font-bold sm:text-4xl">{c.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink/55">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">{t('admin.recentBooks')}</h2>
        <Link to="/admin/books" className="text-sm font-semibold text-ink underline decoration-sage decoration-2 underline-offset-4">
          {t('admin.manageBooks')}
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-ink/10 rounded-[6px] border border-ink/12 bg-white">
        {recent.length === 0 && <li className="px-4 py-6 text-sm text-ink/55">{t('admin.noBooks')}</li>}
        {recent.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{localizedTitle(b, lng)}</p>
              <p className="text-xs text-ink/55">{b.author}</p>
            </div>
            <Link to={`/admin/books/${b.id}/edit`} className="shrink-0 rounded-md border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream">
              {t('admin.edit')}
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/admin/books/new" className="mt-5 inline-block rounded-[4px] bg-ink px-5 py-3 text-sm font-bold text-cream hover:opacity-90">
        + {t('admin.addBook')}
      </Link>
    </div>
  );
}
