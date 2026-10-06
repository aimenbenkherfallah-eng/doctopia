import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLanguage } from '../../hooks/useLanguage';
import { submitContactMessage } from '../../services/contact';
import { isDemoMode } from '../../utils/constants';

export default function Contact() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { get } = useSiteSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const subtitle = get('contact_subtitle', lng, t('contact.subtitle'));
  const contactEmail = get('contact_email', lng, get('footer_email', lng, t('contact.emailValue'))) || t('contact.emailValue');
  const socialText = get('contact_social_text', lng, t('contact.socialHint'));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(t('auth.required'));
      return;
    }
    setSending(true);
    try {
      if (isDemoMode()) {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
        return;
      }
      await submitContactMessage({ name, email, message });
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError(t('common.error'));
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-ink';

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage">DOCTOPIA</p>
      <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{t('contact.title')}</h1>
      <p className="mt-3 text-ink/60">{subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[6px] border border-ink/12 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/50">{t('contact.emailLabel')}</p>
          <a className="mt-2 inline-block font-medium text-ink underline decoration-mist decoration-2 underline-offset-4" dir="ltr" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
        </div>
        <div className="rounded-[6px] border border-ink/12 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/50">{t('contact.socialLabel')}</p>
          <p className="mt-2 text-sm text-ink/65">{socialText}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 rounded-[6px] border border-ink/12 bg-white p-6">
        <h2 className="font-display text-2xl font-semibold">{t('contact.formTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            {t('contact.name')}
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
          </label>
          <label className="text-sm font-medium">
            {t('contact.email')}
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" dir="ltr" />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium">
          {t('contact.message')}
          <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} />
        </label>
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}
        <button type="submit" disabled={sending} className="mt-4 rounded-[4px] bg-ink px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-mist hover:text-ink disabled:opacity-60">
          {sending ? t('common.loading') : t('contact.send')}
        </button>
        {sent && <p className="mt-3 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{t('contact.sent')}</p>}
      </form>
    </div>
  );
}
