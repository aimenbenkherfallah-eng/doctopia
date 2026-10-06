import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Feedback';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../services/categories';
import { isDemoMode, localizedCategoryName } from '../../utils/constants';
import { DEMO_CATEGORIES } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';

export default function CategoriesAdmin() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    if (isDemoMode()) {
      setCategories(DEMO_CATEGORIES);
      setLoading(false);
      return;
    }
    try {
      setCategories(await fetchCategories());
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setNameFr('');
    setNameAr('');
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!nameFr.trim() || !nameAr.trim()) {
      setError(t('validation.generic'));
      return;
    }
    try {
      if (isDemoMode()) {
        if (editing) {
          setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, name_fr: nameFr.trim(), name_ar: nameAr.trim() } : c)));
          setNotice(t('admin.categories.updated'));
        } else {
          setCategories((prev) => [...prev, { id: `demo-${Date.now()}`, name_fr: nameFr.trim(), name_ar: nameAr.trim() }]);
          setNotice(t('admin.categories.created'));
        }
        reset();
        return;
      }
      if (editing) {
        const updated = await updateCategory(editing.id, { name_fr: nameFr.trim(), name_ar: nameAr.trim() });
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        setNotice(t('admin.categories.updated'));
      } else {
        const created = await createCategory({ name_fr: nameFr.trim(), name_ar: nameAr.trim() });
        setCategories((prev) => [...prev, created]);
        setNotice(t('admin.categories.created'));
      }
      reset();
    } catch {
      setError(t('common.error'));
    }
  };

  const remove = async (cat) => {
    setError('');
    setNotice('');
    try {
      if (!isDemoMode()) await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setNotice(t('admin.categories.deleted'));
    } catch {
      setError(t('admin.categories.inUse'));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{t('admin.categories.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('admin.categories.subtitle')}</p>

      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}

      <form onSubmit={submit} className="mt-5 grid gap-3 rounded-[6px] border border-ink/12 bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-medium">
          {t('admin.categories.nameFr')}
          <input value={nameFr} onChange={(e) => setNameFr(e.target.value)} className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2.5 text-sm" dir="ltr" />
        </label>
        <label className="text-sm font-medium">
          {t('admin.categories.nameAr')}
          <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2.5 text-sm" dir="rtl" />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-cream hover:opacity-90">
            {editing ? t('admin.categories.update') : t('admin.categories.create')}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="rounded-md border border-ink/20 px-4 py-2.5 text-sm font-semibold">
              {t('admin.categories.cancel')}
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-ink/20 px-4 py-8 text-center text-sm text-ink/60">{t('admin.categories.empty')}</p>
      ) : (
        <ul className="mt-5 divide-y divide-ink/10 rounded-[6px] border border-ink/12 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{localizedCategoryName(c, lng)}</p>
                <p className="text-xs text-ink/50" dir="auto">{c.name_fr} · {c.name_ar}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setEditing(c); setNameFr(c.name_fr); setNameAr(c.name_ar); }}
                  className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                >
                  {t('admin.categories.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="rounded-md border border-red-900/25 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50"
                >
                  {t('admin.categories.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
