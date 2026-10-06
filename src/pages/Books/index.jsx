import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BookCard from '../../components/BookCard';
import SearchBar from '../../components/SearchBar';
import { EmptyState, ErrorState, Loader } from '../../components/Feedback';
import { fetchBooks } from '../../services/books';
import { fetchCategories } from '../../services/categories';
import { isDemoMode, localizedTitle } from '../../utils/constants';
import { DEMO_BOOKS, DEMO_CATEGORIES } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';

function applyDemoFilters(books, { search, categoryId, language, sort }) {
  let out = [...books];
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    out = out.filter((b) =>
      [b.title_fr, b.title_ar, b.author].filter(Boolean).some((v) => v.toLowerCase().includes(s))
    );
  }
  if (categoryId) out = out.filter((b) => b.category_id === categoryId);
  if (language) out = out.filter((b) => b.language === language);
  if (sort === 'title') out.sort((a, b) => (a.title_fr || '').localeCompare(b.title_fr || ''));
  else if (sort === 'year') out.sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
  return out;
}

export default function Books() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (isDemoMode()) {
      setCategories(DEMO_CATEGORIES);
      setBooks(applyDemoFilters(DEMO_BOOKS, { search: debounced, categoryId, language, sort }));
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([
      fetchCategories().catch(() => []),
      fetchBooks({ search: debounced, categoryId, language, orderBy: sort }).catch((e) => { throw e; }),
    ])
      .then(([cats, data]) => {
        if (!alive) return;
        setCategories(cats);
        let sorted = data;
        if (sort === 'title') {
          sorted = [...data].sort((a, b) =>
            (lng === 'ar' ? localizedTitle(a, 'ar') : localizedTitle(a, 'fr')).localeCompare(
              lng === 'ar' ? localizedTitle(b, 'ar') : localizedTitle(b, 'fr')
            )
          );
        }
        setBooks(sorted);
      })
      .catch(() => alive && setError(t('common.error')))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [debounced, categoryId, language, sort, lng, t]);

  const countLabel = useMemo(() => {
    const n = books.length;
    return t('books.count_other', { count: n });
  }, [books.length, t]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage">DOCTOPIA</p>
      <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{t('books.title')}</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink/65">{t('books.subtitle')}</p>

      <div className="mt-6">
        <SearchBar
          search={search} onSearch={setSearch}
          categoryId={categoryId} onCategory={setCategoryId} categories={categories}
          language={language} onLanguage={setLanguage}
          sort={sort} onSort={setSort}
          onClear={() => { setSearch(''); setCategoryId(''); setLanguage(''); setSort('recent'); }}
        />
      </div>

      <p className="mt-5 text-sm text-ink/55" aria-live="polite">{countLabel} - {t('search.results')}</p>

      <div className="mt-4">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setDebounced(search)} />
        ) : books.length === 0 ? (
          <EmptyState hint={t('common.emptyHint')} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
