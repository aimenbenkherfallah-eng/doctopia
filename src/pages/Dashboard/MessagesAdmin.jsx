import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, Loader } from '../../components/Feedback';
import {
  deleteContactMessage, fetchContactMessages, markMessageRead,
} from '../../services/contact';
import { formatDate, isDemoMode } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';

export default function MessagesAdmin() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode()) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      setMessages(await fetchContactMessages());
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (m) => {
    try {
      await markMessageRead(m.id, !m.is_read);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: !x.is_read } : x)));
    } catch {
      setError(t('common.error'));
    }
  };

  const remove = async (m) => {
    try {
      await deleteContactMessage(m.id);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      setNotice(t('admin.messages.deleted'));
    } catch {
      setError(t('common.error'));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{t('admin.messages.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('admin.messages.subtitle')}</p>

      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}
      {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

      {messages.length === 0 ? (
        <div className="mt-5"><EmptyState title={t('admin.messages.empty')} /></div>
      ) : (
        <ul className="mt-5 space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-[6px] border bg-white p-4 ${m.is_read ? 'border-ink/12' : 'border-ink ring-1 ring-ink'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-xs text-ink/50">{formatDate(m.created_at, lng)}</p>
              </div>
              <a href={`mailto:${m.email}`} dir="ltr" className="mt-1 inline-block text-xs text-ink/65 underline underline-offset-2">{m.email}</a>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/85">{m.message}</p>
              <div className="mt-3 flex gap-2">
                {!m.is_read && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-cream">{t('admin.messages.unread')}</span>}
                <button type="button" onClick={() => toggleRead(m)} className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream">
                  {m.is_read ? t('admin.messages.markUnread') : t('admin.messages.markRead')}
                </button>
                <button type="button" onClick={() => remove(m)} className="rounded-md border border-red-900/25 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50">
                  {t('admin.messages.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
