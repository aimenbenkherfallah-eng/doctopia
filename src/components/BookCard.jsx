import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { coverOf, publicImageUrl } from '../services/books';
import { localizedCategoryName, localizedTitle } from '../utils/constants';
import { useLanguage } from '../hooks/useLanguage';

export default function BookCard({ book }) {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const cover = coverOf(book);

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-[4px] border border-ink/12 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_-16px_rgba(23,42,70,0.35)] focus-visible:outline-2"
      aria-label={localizedTitle(book, lng)}
    >
      <div className="book-cover-frame relative aspect-[3/4] overflow-hidden bg-sand/25">
        {cover ? (
          <img
            src={cover}
            alt={localizedTitle(book, lng)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-sand/40 p-6 text-center">
            <span className="font-display text-xl text-ink/60">{localizedTitle(book, lng)}</span>
          </div>
        )}
        {book?.categories && (
          <span className="absolute start-3 top-3 rounded-full bg-sage/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink">
            {localizedCategoryName(book.categories, lng)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink line-clamp-2">
          {localizedTitle(book, lng)}
        </h3>
        {book.author && (
          <p className="text-[13px] text-ink/60">
            {t('books.by')} <span className="font-medium text-ink/80">{book.author}</span>
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-semibold text-ink">
          {t('books.viewDetails')}
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </Link>
  );
}

export function bookThumb(book) {
  return coverOf(book) || (book?.book_images?.[0] ? publicImageUrl(book.book_images[0].storage_path) : '');
}
