import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { get } = useSiteSettings();

  const tagline = get('footer_tagline', lng, t('footer.tagline'));
  const email = get('footer_email', lng, t('contact.emailValue')) || t('contact.emailValue');
  const rights = get('footer_rights', lng, t('footer.rights'));

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold tracking-[0.18em]">DOCTOPIA</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/75">{tagline}</p>
        </div>
        
        <nav aria-label={t('footer.navigation')}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">{t('footer.navigation')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-cream/80 hover:text-cream" to="/">{t('nav.home')}</Link></li>
            <li><Link className="text-cream/80 hover:text-cream" to="/books">{t('nav.books')}</Link></li>
            <li><Link className="text-cream/80 hover:text-cream" to="/about">{t('nav.about')}</Link></li>
            <li><Link className="text-cream/80 hover:text-cream" to="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">{t('contact.emailLabel')}</p>
          <a href={`mailto:${email}`} className="mt-4 inline-block text-sm text-cream/85 underline decoration-mist/60 underline-offset-4 hover:text-cream" dir="ltr">
            {email}
          </a>
          <p className="mt-6 text-xs text-cream/50">© {new Date().getFullYear()} DOCTOPIA - {rights}</p>
        </div>
      </div>
    </footer>
  );
}
