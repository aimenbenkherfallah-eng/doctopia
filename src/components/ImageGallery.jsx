import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { imageSrc } from '../services/books';

export default function ImageGallery({ images = [], title = '' }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <section aria-label={t('bookDetails.gallery')}>
      <div className="overflow-hidden rounded-[6px] border border-ink/12 bg-white">
        <div className="relative aspect-[3/3.4] bg-sand/20 sm:aspect-[4/4.2]">
          <img
            key={current.id}
            src={imageSrc(current)}
            alt={`${title} - ${current.image_type === 'cover' ? t('bookDetails.cover') : `${t('bookDetails.gallery')} ${active + 1}`}`}
            className="h-full w-full object-contain"
            loading="eager"
          />
        </div>
      </div>
      {images.length > 1 && (
        <>
          <p className="mt-3 text-xs text-ink/55">{t('bookDetails.galleryHint')}</p>
          <div className="thin-scroll mt-2 flex gap-2.5 overflow-x-auto pb-1" role="list">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                role="listitem"
                onClick={() => setActive(i)}
                aria-label={`${t('bookDetails.gallery')} ${i + 1}`}
                aria-pressed={i === active}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[4px] border bg-white transition-all ${
                  i === active ? 'border-ink ring-1 ring-ink' : 'border-ink/15 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imageSrc(img)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {img.image_type === 'cover' && (
                  <span className="absolute bottom-0.5 start-0.5 rounded bg-ink/85 px-1 text-[9px] font-bold text-cream">
                    {t('admin.form.coverBadge')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
