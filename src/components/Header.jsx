import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ transparentOverHero = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!transparentOverHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOverHero]);

  const solid = !transparentOverHero || scrolled || open;
  const dark = solid;

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/books', label: t('nav.books') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-cream/95 shadow-[0_1px_0_rgba(23,42,70,0.12)] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        
        <div className="flex min-w-0 items-center gap-8">
          <Link
            to="/"
            className={`shrink-0 font-display text-2xl font-bold tracking-[0.18em] ${
              dark ? 'text-ink' : 'text-cream'
            }`}
            aria-label="DOCTOPIA - home"
          >
            DOCTOPIA
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${
                    isActive
                      ? dark
                        ? 'text-ink underline decoration-sage decoration-2 underline-offset-8'
                        : 'text-cream underline decoration-sand decoration-2 underline-offset-8'
                      : dark
                        ? 'text-ink/70 hover:text-ink'
                        : 'text-cream/85 hover:text-cream'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/admin"
                className={`text-sm font-medium tracking-wide ${dark ? 'text-ink/70 hover:text-ink' : 'text-cream/85 hover:text-cream'}`}
              >
                {t('nav.dashboard')}
              </NavLink>
            )}
          </nav>
        </div>

        
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden ${
              dark ? 'text-ink' : 'text-cream'
            }`}
            aria-expanded={open}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-cream px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-[15px] font-medium ${isActive ? 'bg-sand/50 text-ink' : 'text-ink/75 hover:bg-sand/30'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/admin" className="rounded-md px-3 py-2.5 text-[15px] font-medium text-ink/75 hover:bg-sand/30">
                {t('nav.dashboard')}
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink to="/login" className="rounded-md px-3 py-2.5 text-[15px] font-medium text-ink/75 hover:bg-sand/30">
                {t('nav.login')}
              </NavLink>
            )}
          </nav>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-ink/50">{t('common.language')}</span>
            <LanguageSwitcher compact />
          </div>
        </div>
      )}
    </header>
  );
}
