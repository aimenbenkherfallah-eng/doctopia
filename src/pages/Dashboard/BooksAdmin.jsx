import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, Loader } from '../../components/Feedback';
import { coverOf, deleteBook, fetchBooks } from '../../services/books';
import { formatDate, isDemoMode, localizedCategoryName, localizedTitle } from '../../utils/constants';
import { DEMO_BOOKS } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';

export default function BooksAdmin() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode()) {
      setBooks(DEMO_BOOKS);
      setLoading(false);
      return;
    }
    try {
      setBooks(await fetchBooks({}));
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      if (!isDemoMode()) await deleteBook(deleting.id);
      setBooks((prev) => prev.filter((b) => b.id !== deleting.id));
      setNotice(t('admin.deleted'));
    } catch {
      setError(t('common.error'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t('admin.manageBooks')}</h1>
          <p className="mt-1 text-sm text-ink/60">{books.length} - {t('search.results')}</p>
        </div>
        <Link to="/admin/books/new" className="rounded-[4px] bg-ink px-4 py-2.5 text-sm font-bold text-cream hover:opacity-90">
          + {t('admin.addBook')}
        </Link>
      </div>

      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}
      {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

      {books.length === 0 ? (
        <div className="mt-5">
          <EmptyState title={t('admin.noBooks')} hint={t('admin.noBooksHint')} action={
            <Link to="/admin/books/new" className="mt-3 inline-block rounded-md bg-ink px-4 py-2 text-sm font-bold text-cream">{t('admin.addBook')}</Link>
          } />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-[6px] border border-ink/12 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-cream/60 text-start text-xs uppercase tracking-widest text-ink/55">
                <th className="px-4 py-3 text-start font-semibold">{t('admin.cover')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('admin.bookTitle')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('admin.author')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('admin.category')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('admin.createdAt')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-cream/50">
                  <td className="px-4 py-2.5">
                    {coverOf(b) ? (
                      <img src={coverOf(b)} alt="" loading="lazy" className="h-14 w-11 rounded-[3px] border border-ink/15 object-cover" />
                    ) : (
                      <span className="block h-14 w-11 rounded-[3px] bg-sand/40" />
                    )}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 font-semibold">{localizedTitle(b, lng)}</td>
                  <td className="px-4 py-2.5 text-ink/70">{b.author}</td>
                  <td className="px-4 py-2.5 text-ink/70">{b.categories ? localizedCategoryName(b.categories, lng) : '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink/55">{formatDate(b.created_at, lng)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <Link to={`/books/${b.id}`} className="rounded-md border border-ink/15 px-2.5 py-1 text-xs font-semibold hover:bg-cream">{t('admin.view')}</Link>
                      <Link to={`/admin/books/${b.id}/edit`} className="rounded-md border border-ink/15 px-2.5 py-1 text-xs font-semibold hover:bg-cream">{t('admin.edit')}</Link>
                      {isAdmin && (
                        <button type="button" onClick={() => setDeleting(b)} className="rounded-md border border-red-900/25 px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-50">
                          {t('admin.deleteBook')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label={t('admin.confirmDeleteTitle')}>
          <div className="w-full max-w-sm rounded-lg bg-cream p-6 shadow-xl">
            <h2 className="font-display text-2xl font-semibold">{t('admin.confirmDeleteTitle')}</h2>
            <p className="mt-2 text-sm text-ink/65">{t('admin.confirmDeleteText')}</p>
            <p className="mt-2 truncate text-sm font-bold">“{localizedTitle(deleting, lng)}”</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} className="rounded-md border border-ink/20 px-4 py-2 text-sm font-semibold">{t('admin.cancel')}</button>
              <button type="button" onClick={confirmDelete} className="rounded-md bg-red-900 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">{t('admin.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
