import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Feedback';
import { fetchProfiles, updateProfileRole } from '../../services/profiles';
import { formatDate, isDemoMode } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';

const DEMO_USERS = [
  { id: 'u-admin', name: 'Admin Doctopia', role: 'admin', created_at: new Date().toISOString() },
  { id: 'u-editor', name: 'Éditeur invité', role: 'editor', created_at: new Date().toISOString() },
];

export default function UsersAdmin() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        setUsers(DEMO_USERS);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchProfiles();
        if (alive) setUsers(data);
      } catch {
        if (alive) setError(t('common.error'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [t]);

  const changeRole = async (u, role) => {
    setError('');
    setNotice('');
    try {
      if (!isDemoMode()) await updateProfileRole(u.id, role);
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role } : p)));
      setNotice(t('admin.users.updated'));
    } catch {
      setError(t('common.error'));
    }
  };

  if (loading) return <Loader />;
  if (!isAdmin && !isDemoMode()) {
    return <p className="rounded-md bg-sand/40 px-4 py-6 text-center text-sm" role="alert">{t('admin.users.adminOnly')}</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{t('admin.users.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('admin.users.subtitle')}</p>
      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}

      <div className="mt-5 overflow-x-auto rounded-[6px] border border-ink/12 bg-white">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-cream/60 text-xs uppercase tracking-widest text-ink/55">
              <th className="px-4 py-3 text-start font-semibold">{t('admin.users.name')}</th>
              <th className="px-4 py-3 text-start font-semibold">{t('admin.users.role')}</th>
              <th className="px-4 py-3 text-start font-semibold">{t('admin.users.createdAt')}</th>
              <th className="px-4 py-3 text-start font-semibold">{t('admin.users.changeRole')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{u.name || u.id.slice(0, 8)}</p>
                  <p className="font-mono text-[11px] text-ink/45" dir="ltr">{u.id}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${u.role === 'admin' ? 'bg-ink text-cream' : 'bg-sage/30 text-ink'}`}>
                    {u.role === 'admin' ? t('admin.users.admin') : t('admin.users.editor')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-ink/55">{formatDate(u.created_at, lng)}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    className="rounded-md border border-ink/15 bg-cream px-2 py-1.5 text-xs font-semibold"
                    aria-label={`${t('admin.users.changeRole')} - ${u.name || u.id}`}
                  >
                    <option value="editor">{t('admin.users.editor')}</option>
                    <option value="admin">{t('admin.users.admin')}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
