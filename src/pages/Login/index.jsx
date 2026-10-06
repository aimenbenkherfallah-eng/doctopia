import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoMode } from '../../utils/constants';

export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = location.state?.from || '/admin';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('auth.required'));
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch {
      setError(t('auth.invalid'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 pt-24 sm:px-6">
      <p className="text-center font-display text-xl font-bold tracking-[0.2em]">DOCTOPIA</p>
      <h1 className="font-display mt-2 text-center text-3xl font-semibold">{t('auth.loginTitle')}</h1>
      <p className="mt-2 text-center text-sm text-ink/60">{t('auth.loginSubtitle')}</p>

      {isDemoMode() && (
        <p className="mt-4 rounded-md border border-sand bg-sand/30 px-3 py-2 text-center text-xs text-ink/70">
          Supabase non configuré - connectez VITE_SUPABASE_URL / KEY pour activer la connexion (voir README).
        </p>
      )}

      <form onSubmit={submit} className="mt-6 rounded-[6px] border border-ink/12 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          {t('auth.email')}
          <input
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink/15 bg-cream px-3 py-2.5 text-sm"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          {t('auth.password')}
          <input
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink/15 bg-cream px-3 py-2.5 text-sm"
          />
        </label>
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-[4px] bg-ink px-4 py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? t('common.loading') : t('auth.submit')}
        </button>
      </form>
      <Link to="/" className="mt-4 text-center text-sm text-ink/60 hover:text-ink">{t('common.backHome')}</Link>
    </div>
  );
}
