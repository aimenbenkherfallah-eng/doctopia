import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BookCard from '../../components/BookCard';
import { EmptyState, Loader } from '../../components/Feedback';
import { fetchRecentBooks } from '../../services/books';
import { isDemoMode } from '../../utils/constants';
import { DEMO_BOOKS } from '../../utils/demo';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLanguage } from '../../hooks/useLanguage';
import heroBg from '../../assets/images/hero-background.jpg';

export default function Home() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { get } = useSiteSettings();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroEyebrow = get('hero_eyebrow', lng, t('hero.eyebrow'));
  const heroSubtitle = get('hero_subtitle', lng, t('hero.subtitle'));
  const homeAboutText = get('home_about_text', lng, t('home.aboutText'));

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        setBooks(DEMO_BOOKS.slice(0, 4));
        setLoading(false);
        return;
      }
      try {
        const data = await fetchRecentBooks(8);
        if (alive) setBooks(data.slice(0, 8));
      } catch {
        if (alive) setBooks([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      
      <section
        className="relative flex min-h-[100svh] flex-col bg-ink bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-label="DOCTOPIA"
      >
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pt-24 text-center text-cream">
          <p className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-sand sm:text-xs sm:tracking-[0.28em]">
            {heroEyebrow}
          </p>
          <h1 className="font-display mt-4 text-5xl font-bold tracking-[0.08em] sm:text-7xl sm:tracking-[0.12em] md:text-8xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-cream/90 sm:text-lg">
            {heroSubtitle}
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 px-2 sm:w-auto sm:flex-row sm:items-center sm:px-0">
            <a
              href="#livres"
              className="rounded-[4px] bg-ink px-7 py-3.5 text-center text-sm font-bold tracking-wide text-cream shadow-lg transition-colors hover:bg-mist hover:text-ink"
            >
              {t('hero.exploreBooks')}
            </a>
            <Link
              to="/books"
              className="rounded-[4px] border border-cream/50 px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              {t('hero.viewCatalog')}
            </Link>
          </div>
        </div>
        <a href="#livres" className="relative z-10 px-4 pb-8 pt-6 text-center text-[11px] uppercase tracking-[0.25em] text-cream/70 hover:text-cream">
          {t('hero.scrollHint')}
        </a>
      </section>

      
      <section id="livres" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage">{t('home.featuredEyebrow')}</p>
            <h2 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{t('home.featuredTitle')}</h2>
            <p className="mt-3 max-w-xl text-[15px] text-ink/65">{t('home.featuredSubtitle')}</p>
          </div>
          <Link to="/books" className="rounded-[4px] border border-ink/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream">
            {t('home.viewAll')}
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <Loader />
          ) : books.length === 0 ? (
            <EmptyState hint={t('common.emptyHint')} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {books.slice(0, 4).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      
      <section className="border-y border-ink/10 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage">{t('home.aboutEyebrow')}</p>
            <h2 className="font-display mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{t('home.aboutTitle')}</h2>
            <p className="mt-5 leading-relaxed text-ink/70">{homeAboutText}</p>
            <Link to="/about" className="mt-6 inline-block rounded-[4px] bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-mist hover:text-ink">
              {t('home.aboutCta')}
            </Link>
          </div>
          <div className="editorial-rule pt-6 md:border-s md:border-t-0 md:ps-10">
            <blockquote className="font-display text-2xl italic leading-relaxed text-ink/85 sm:text-3xl">
              “{heroSubtitle}”
            </blockquote>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-ink/50">- DOCTOPIA</p>
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-[8px] bg-ink px-6 py-12 text-center text-cream sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sand">{t('home.contactEyebrow')}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{t('home.contactTitle')}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream/75">{t('home.contactText')}</p>
          <Link to="/contact" className="mt-6 inline-block rounded-[4px] bg-cream px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-sand">
            {t('home.contactCta')}
          </Link>
        </div>
      </section>
    </div>
  );
}
