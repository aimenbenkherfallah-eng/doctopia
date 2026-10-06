import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageGallery from '../../components/ImageGallery';
import { EmptyState, ErrorState, Loader } from '../../components/Feedback';
import { fetchBookById } from '../../services/books';
import { formatDate, isDemoMode, localizedCategoryName, localizedDescription, localizedTitle } from '../../utils/constants';
import { DEMO_BOOKS } from '../../utils/demo';
import { useLanguage } from '../../hooks/useLanguage';
import { useSiteSettings } from '../../hooks/useSiteSettings';

function whatsappLink(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  const digits = v.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}`;
}

export default function BookDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { get } = useSiteSettings();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    async function load() {
      if (isDemoMode()) {
        const found = DEMO_BOOKS.find((b) => b.id === id) ?? null;
        if (alive) {
          setBook(found);
          setLoading(false);
          if (!found) setError('not-found');
        }
        return;
      }
      try {
        const data = await fetchBookById(id);
        if (alive) setBook(data);
      } catch {
        if (alive) setError(t('common.error'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id, t]);

  useEffect(() => {
    if (!orderOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setOrderOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [orderOpen]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 pt-28 sm:px-6"><Loader /></div>;
  }
  if (error === 'not-found' || !book) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 text-center sm:px-6">
        <EmptyState title={t('bookDetails.notFound')} hint={t('bookDetails.notFoundText')} action={
          <Link to="/books" className="mt-4 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
            {t('bookDetails.backToCatalog')}
          </Link>
        } />
      </div>
    );
  }
  if (error) {
    return <div className="mx-auto max-w-3xl px-4 pt-28"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  }

  const title = localizedTitle(book, lng);
  const description = localizedDescription(book, lng);
  const orderText = get(
    'order_text',
    lng,
    lng === 'ar'
      ? 'لطلب هذا الكتاب، تواصل مع المورّد عبر الهاتف أو واتساب أو البريد الإلكتروني مع ذكر عنوان الكتاب.'
      : 'Pour commander ce livre, contactez le fournisseur par téléphone, WhatsApp ou e-mail en précisant le titre du livre.'
  );
  const orderPhone = get('order_phone', lng, '');
  const orderWhatsappRaw = get('order_whatsapp', lng, '');
  const orderWhatsapp = whatsappLink(orderWhatsappRaw);
  const orderEmail = get('contact_email', lng, get('footer_email', lng, t('contact.emailValue'))) || t('contact.emailValue');
  const orderSubject = encodeURIComponent(`DOCTOPIA - ${t('bookDetails.order')} : ${title}`);

  const meta = [
    { label: t('bookDetails.author'), value: book.author },
    { label: t('bookDetails.publisher'), value: book.publisher },
    { label: t('bookDetails.year'), value: book.publication_year },
    { label: t('bookDetails.language'), value: book.language === 'fr' ? 'Français' : book.language === 'ar' ? 'العربية' : book.language },
    { label: t('bookDetails.category'), value: book.categories ? localizedCategoryName(book.categories, lng) : '' },
  ].filter((m) => m.value);

  return (
    <article className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <Link to="/books" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink">
        <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {t('bookDetails.backToCatalog')}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <ImageGallery images={book.book_images ?? []} title={title} />

        <div>
          {book.categories && (
            <span className="inline-block rounded-full bg-sage/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">
              {localizedCategoryName(book.categories, lng)}
            </span>
          )}
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {book.author && <p className="mt-2 text-lg text-ink/70">{book.author}</p>}

          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {meta.map((m) => (
              <div key={m.label} className="grid grid-cols-[104px_1fr] gap-2 py-2.5 text-sm sm:grid-cols-[180px_1fr] sm:gap-3">
                <dt className="font-semibold uppercase tracking-wide text-ink/50 text-xs pt-0.5">{m.label}</dt>
                <dd className="text-ink/90">{m.value}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setOrderOpen(true)}
            className="mt-6 w-full rounded-[4px] bg-ink px-6 py-3.5 text-base font-bold tracking-wide text-cream shadow-lg transition-colors hover:bg-mist hover:text-ink sm:w-auto sm:px-12"
          >
            {t('bookDetails.order')}
          </button>

          {description && (
            <section className="mt-6" aria-label={t('bookDetails.description')}>
              <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">{t('bookDetails.description')}</h2>
              <p className="drop-cap mt-3 whitespace-pre-line leading-relaxed text-ink/85">{description}</p>
            </section>
          )}

          {book.created_at && (
            <p className="mt-6 text-xs text-ink/45">{t('bookDetails.addedOn')} {formatDate(book.created_at, lng)}</p>
          )}
        </div>
      </div>

      {orderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('bookDetails.orderTitle')}
          onClick={() => setOrderOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-cream p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-3xl font-semibold">{t('bookDetails.orderTitle')}</h2>
            <p className="mt-1 truncate text-sm font-semibold text-ink/70">“{title}”</p>
            {orderText && <p className="mt-3 text-sm leading-relaxed text-ink/75">{orderText}</p>}
            <div className="mt-5 space-y-2.5">
              {orderPhone && (
                <a
                  href={`tel:${orderPhone.replace(/[\s-]/g, '')}`}
                  dir="ltr"
                  className="flex items-center justify-between rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-ink"
                >
                  <span>{t('bookDetails.orderPhone')}</span>
                  <span>{orderPhone}</span>
                </a>
              )}
              {orderWhatsapp && (
                <a
                  href={orderWhatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-ink"
                >
                  <span>{t('bookDetails.orderWhatsapp')}</span>
                  <span className="text-xs text-ink/55" dir="ltr">WhatsApp →</span>
                </a>
              )}
              <a
                href={`mailto:${orderEmail}?subject=${orderSubject}`}
                dir="ltr"
                className="flex items-center justify-between rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-ink"
              >
                <span>{t('bookDetails.orderEmail')}</span>
                <span className="max-w-[220px] truncate text-xs text-ink/60">{orderEmail}</span>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setOrderOpen(false)}
              autoFocus
              className="mt-5 w-full rounded-md border border-ink/20 px-4 py-2.5 text-sm font-semibold hover:bg-sand/40"
            >
              {t('bookDetails.orderClose')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
