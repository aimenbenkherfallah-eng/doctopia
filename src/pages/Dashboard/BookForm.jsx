import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Feedback';
import {
  addBookImageUrls, createBook, deleteBookImage, fetchBookById, imageSrc,
  isExternalImage, isValidImageUrl, setCoverImage,
  updateBook, updateImageOrder, uploadBookImages,
} from '../../services/books';
import { fetchCategories } from '../../services/categories';
import { isDemoMode, localizedCategoryName } from '../../utils/constants';
import { DEMO_BOOKS, DEMO_CATEGORIES } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';
import { validateImageFile } from '../../utils/image';

const emptyForm = {
  title_fr: '', title_ar: '', description_fr: '', description_ar: '',
  author: '', publisher: '', publication_year: '', language: 'fr', category_id: '',
};

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newUrls, setNewUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [coverId, setCoverId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        setCategories(DEMO_CATEGORIES);
        if (isEdit) {
          const found = DEMO_BOOKS.find((b) => b.id === id);
          if (found && alive) {
            setForm({
              title_fr: found.title_fr, title_ar: found.title_ar,
              description_fr: found.description_fr, description_ar: found.description_ar,
              author: found.author, publisher: found.publisher,
              publication_year: found.publication_year?.toString() ?? '',
              language: found.language, category_id: found.category_id,
            });
            setExistingImages(found.book_images ?? []);
          }
        }
        setLoading(false);
        return;
      }
      try {
        const cats = await fetchCategories().catch(() => []);
        if (!alive) return;
        setCategories(cats);
        if (isEdit) {
          const book = await fetchBookById(id);
          if (!alive) return;
          setForm({
            title_fr: book.title_fr ?? '', title_ar: book.title_ar ?? '',
            description_fr: book.description_fr ?? '', description_ar: book.description_ar ?? '',
            author: book.author ?? '', publisher: book.publisher ?? '',
            publication_year: book.publication_year?.toString() ?? '',
            language: book.language ?? 'fr', category_id: book.category_id ?? '',
          });
          const imgs = [...(book.book_images ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
          setExistingImages(imgs);
          setCoverId(imgs.find((i) => i.image_type === 'cover')?.id ?? imgs[0]?.id ?? null);
        }
      } catch {
        if (alive) setErrors([t('common.error')]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id, isEdit, t]);

  useEffect(() => () => {
    newFiles.forEach((f) => { try { URL.revokeObjectURL(f.preview); } catch {} });
  }, [newFiles]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((file) => {
      const errKey = validateImageFile(file);
      return { file, preview: URL.createObjectURL(file), error: errKey };
    });
    setNewFiles((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removeNew = (idx) => {
    setNewFiles((prev) => {
      const copy = [...prev];
      try { URL.revokeObjectURL(copy[idx].preview); } catch {}
      copy.splice(idx, 1);
      return copy;
    });
  };

  const moveNew = (idx, dir) => {
    setNewFiles((prev) => {
      const copy = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= copy.length) return prev;
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  };

  const addUrl = () => {
    const v = urlInput.trim();
    if (!v) return;
    if (!isValidImageUrl(v)) {
      setErrors([t('validation.badUrl')]);
      return;
    }
    setErrors([]);
    setNewUrls((prev) => [...prev, v]);
    setUrlInput('');
  };

  const removeUrl = (idx) => setNewUrls((prev) => prev.filter((_, i) => i !== idx));

  const removeExisting = async (img) => {
    if (isDemoMode()) {
      setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
      return;
    }
    try {
      await deleteBookImage(img);
      setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch {
      setErrors([t('common.error')]);
    }
  };

  const moveExisting = (idx, dir) => {
    setExistingImages((prev) => {
      const copy = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= copy.length) return prev;
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      const ordered = copy.map((r, k) => ({ ...r, display_order: k }));
      if (!isDemoMode()) {
        updateImageOrder(ordered.map((r) => ({ id: r.id, display_order: r.display_order, image_type: r.image_type }))).catch(() => {});
      }
      return ordered;
    });
  };

  const validationErrors = useMemo(() => {
    const list = [];
    if (!form.title_fr.trim()) list.push(t('validation.titleFrRequired'));
    if (!form.title_ar.trim()) list.push(t('validation.titleArRequired'));
    if (!form.author.trim()) list.push(t('validation.authorRequired'));
    return list;
  }, [form, t]);

  const submit = async (e) => {
    e.preventDefault();
    setNotice('');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    const badNew = newFiles.filter((f) => f.error);
    if (badNew.length > 0) {
      setErrors([t(`validation.${badNew[0].error}`)]);
      return;
    }
    const badUrls = newUrls.filter((u) => !isValidImageUrl(u));
    if (badUrls.length > 0) {
      setErrors([t('validation.badUrl')]);
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      const year = form.publication_year ? parseInt(form.publication_year, 10) : null;
      const payload = {
        title_fr: form.title_fr.trim(),
        title_ar: form.title_ar.trim(),
        description_fr: form.description_fr.trim() || null,
        description_ar: form.description_ar.trim() || null,
        author: form.author.trim(),
        publisher: form.publisher.trim() || null,
        publication_year: Number.isFinite(year) ? year : null,
        language: form.language || 'fr',
        category_id: form.category_id || null,
      };

      if (isDemoMode()) {
        setNotice(t('admin.saved'));
        setTimeout(() => navigate('/admin/books'), 600);
        return;
      }

      if (!isEdit) {
        const files = newFiles.map((f) => f.file);
        const bookId = await createBook(payload, files, newUrls);
        setNotice(t('admin.saved'));
        navigate(`/books/${bookId}`);
      } else {
        await updateBook(id, payload);
        let order = existingImages.reduce((m, i) => Math.max(m, i.display_order ?? 0), -1) + 1;
        if (order < 0) order = 0;
        if (newFiles.length > 0) {
          await uploadBookImages(id, newFiles.map((f) => f.file), { startOrder: order });
          order += newFiles.length;
        }
        if (newUrls.length > 0) {
          await addBookImageUrls(id, newUrls, { startOrder: order });
        }
        if (coverId && coverId !== 'new-0') {
          const isExistingCover = existingImages.some((i) => i.id === coverId);
          if (isExistingCover) await setCoverImage(id, coverId);
        }
        setNotice(t('admin.saved'));
        navigate('/admin/books');
      }
    } catch {
      setErrors([t('common.error')]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const inputCls = 'mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-ink';

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{isEdit ? t('admin.editBook') : t('admin.addBook')}</h1>

      {errors.length > 0 && (
        <div className="mt-4 rounded-md border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-950" role="alert">
          <ul className="list-disc ps-5">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
        </div>
      )}
      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}

      <form onSubmit={submit} className="mt-5 space-y-6 rounded-[6px] border border-ink/12 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            {t('admin.form.titleFr')} *
            <input value={form.title_fr} onChange={set('title_fr')} className={inputCls} dir="ltr" />
          </label>
          <label className="text-sm font-medium">
            {t('admin.form.titleAr')} *
            <input value={form.title_ar} onChange={set('title_ar')} className={inputCls} dir="rtl" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            {t('admin.form.descFr')}
            <textarea rows={4} value={form.description_fr} onChange={set('description_fr')} className={inputCls} dir="ltr" />
          </label>
          <label className="text-sm font-medium">
            {t('admin.form.descAr')}
            <textarea rows={4} value={form.description_ar} onChange={set('description_ar')} className={inputCls} dir="rtl" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            {t('admin.form.author')} *
            <input value={form.author} onChange={set('author')} className={inputCls} />
          </label>
          <label className="text-sm font-medium">
            {t('admin.form.publisher')}
            <input value={form.publisher} onChange={set('publisher')} className={inputCls} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            {t('admin.form.year')}
            <input type="number" min="0" max={new Date().getFullYear() + 1} value={form.publication_year} onChange={set('publication_year')} className={inputCls} dir="ltr" />
          </label>
          <label className="text-sm font-medium">
            {t('admin.form.language')}
            <select value={form.language} onChange={set('language')} className={inputCls}>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="other">Other / أخرى</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            {t('admin.form.category')}
            <select value={form.category_id} onChange={set('category_id')} className={inputCls}>
              <option value="">{t('admin.form.noCategory')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{localizedCategoryName(c, lng)}</option>
              ))}
            </select>
          </label>
        </div>

        {isEdit && existingImages.length > 0 && (
          <fieldset>
            <legend className="text-sm font-semibold">{t('admin.form.existingImages')} ({existingImages.length})</legend>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {existingImages.map((img, idx) => (
                <div key={img.id} className={`relative overflow-hidden rounded-md border bg-cream ${coverId === img.id ? 'border-ink ring-1 ring-ink' : 'border-ink/15'}`}>
                  <img src={imageSrc(img)} alt="" loading="lazy" className="h-36 w-full object-cover" />
                  <div className="absolute start-1 top-1 flex gap-1">
                    {coverId === img.id && <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-cream">{t('admin.form.coverBadge')}</span>}
                    {isExternalImage(img) && <span className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-bold text-ink">{t('admin.form.externalBadge')}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 p-1.5">
                    <button type="button" onClick={() => setCoverId(img.id)} className="rounded border border-ink/15 px-1.5 py-0.5 text-[11px] font-semibold hover:bg-sand/50">{t('admin.form.setCover')}</button>
                    <button type="button" onClick={() => moveExisting(idx, -1)} className="rounded border border-ink/15 px-1.5 py-0.5 text-[11px]" aria-label="←">←</button>
                    <button type="button" onClick={() => moveExisting(idx, 1)} className="rounded border border-ink/15 px-1.5 py-0.5 text-[11px]" aria-label="→">→</button>
                    <button type="button" onClick={() => removeExisting(img)} className="rounded border border-red-900/25 px-1.5 py-0.5 text-[11px] font-semibold text-red-900">{t('admin.form.remove')}</button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-sm font-semibold">{isEdit ? t('admin.form.newImages') : t('admin.form.images')}</legend>
          <p className="mt-1 text-xs font-semibold text-ink/70">{t('admin.form.imageSource')}</p>

          
          <div className="mt-2 rounded-md border border-ink/12 bg-cream/50 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/55">{t('admin.form.uploadTab')}</p>
            <p className="mt-1 text-xs text-ink/55">{t('admin.form.uploadHint')}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPickFiles}
              className="mt-2 block w-full text-sm file:me-3 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:text-cream hover:file:opacity-90"
            />
            {newFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {newFiles.map((f, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-md border border-ink/15 bg-cream">
                    <img src={f.preview} alt="" className="h-36 w-full object-cover" />
                    {idx === 0 && newUrls.length === 0 && !isEdit && <span className="absolute start-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-cream">{t('admin.form.coverBadge')}</span>}
                    {f.error && <p className="px-2 py-1 text-[11px] text-red-900">{t(`validation.${f.error}`)}</p>}
                    <div className="flex gap-1 p-1.5">
                      <button type="button" onClick={() => moveNew(idx, -1)} className="rounded border border-ink/15 px-1.5 py-0.5 text-[11px]" aria-label="←">←</button>
                      <button type="button" onClick={() => moveNew(idx, 1)} className="rounded border border-ink/15 px-1.5 py-0.5 text-[11px]" aria-label="→">→</button>
                      <button type="button" onClick={() => removeNew(idx)} className="rounded border border-red-900/25 px-1.5 py-0.5 text-[11px] font-semibold text-red-900">{t('admin.form.remove')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="mt-3 rounded-md border border-ink/12 bg-cream/50 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/55">{t('admin.form.urlTab')}</p>
            <p className="mt-1 text-xs text-ink/55">{t('admin.form.urlHint')}</p>
            <div className="mt-2 flex gap-2">
              <input
                dir="ltr"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                placeholder={t('admin.form.imageUrlPlaceholder')}
                className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
              />
              <button type="button" onClick={addUrl} className="shrink-0 rounded-md bg-ink px-4 py-2 text-xs font-bold text-cream hover:opacity-90">
                {t('admin.form.addUrl')}
              </button>
            </div>
            {newUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {newUrls.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative overflow-hidden rounded-md border border-ink/15 bg-white">
                    <img src={url} alt="" loading="lazy" className="h-36 w-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
                    <span className="absolute start-1 top-1 rounded bg-mist px-1.5 py-0.5 text-[10px] font-bold text-ink">{t('admin.form.externalBadge')}</span>
                    <p className="truncate px-2 pt-1 text-[10px] text-ink/50" dir="ltr">{url}</p>
                    <div className="p-1.5">
                      <button type="button" onClick={() => removeUrl(idx)} className="rounded border border-red-900/25 px-1.5 py-0.5 text-[11px] font-semibold text-red-900">{t('admin.form.remove')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-[4px] bg-ink px-4 py-3.5 text-sm font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {saving ? t('admin.form.saving') : (isEdit ? t('admin.form.save') : t('admin.form.publish'))}
        </button>
      </form>
    </div>
  );
}
