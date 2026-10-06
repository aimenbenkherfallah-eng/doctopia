import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { profile, role, signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/admin', end: true, label: t('admin.navDashboard') },
    { to: '/admin/books', label: t('admin.navBooks') },
    { to: '/admin/books/new', label: t('admin.navAdd') },
    { to: '/admin/categories', label: t('admin.navCategories') },
    ...(role === 'admin'
      ? [
          { to: '/admin/users', label: t('admin.navUsers') },
          { to: '/admin/messages', label: t('admin.navMessages') },
          { to: '/admin/settings', label: t('admin.navSettings') },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-cream text-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-ink/10 bg-ink text-cream lg:flex">
        <div className="px-6 pb-6 pt-8">
          <Link to="/" className="font-display text-xl font-bold tracking-[0.18em]">DOCTOPIA</Link>
          <p className="mt-1 text-xs text-cream/60">{t('admin.title')}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4" aria-label="Admin">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-cream text-ink' : 'text-cream/75 hover:bg-cream/10 hover:text-cream'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3 px-4 pb-6">
          <Link to="/" className="block rounded-md border border-cream/20 px-3 py-2 text-center text-sm text-cream/85 hover:bg-cream/10">
            {t('admin.navViewSite')}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-md bg-cream px-3 py-2 text-sm font-semibold text-ink hover:bg-sand"
          >
            {t('admin.navLogout')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <Link to="/admin" className="font-display text-lg font-bold tracking-[0.14em] lg:hidden">DOCTOPIA</Link>
              <p className="hidden truncate text-sm font-semibold lg:block">
                {profile?.name || user?.email} <span className="ms-2 rounded-full bg-sage/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">{role}</span>
              </p>
              <p className="truncate text-xs text-ink/55 lg:hidden">
                {profile?.name || user?.email} · {role}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher compact />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden"
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
            <div className="border-t border-ink/10 bg-cream px-4 pb-5 pt-3 lg:hidden">
              <nav className="flex flex-col gap-1" aria-label="Admin mobile">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2.5 text-[15px] font-medium ${isActive ? 'bg-ink text-cream' : 'text-ink/75 hover:bg-sand/30'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/" className="rounded-md border border-ink/20 px-3 py-2.5 text-center text-sm font-semibold">
                  {t('admin.navViewSite')}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-md bg-ink px-3 py-2.5 text-sm font-bold text-cream"
                >
                  {t('admin.navLogout')}
                </button>
              </div>
            </div>
          )}
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
