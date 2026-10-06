import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Feedback';
import { SETTING_KEYS, SINGLE_VALUE_KEYS, fetchSettings, upsertSetting } from '../../services/settings';
import { isDemoMode } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const GROUPS = [
  { titleKey: 'admin.settings.groupHero', keys: ['hero_eyebrow', 'hero_subtitle'] },
  { titleKey: 'admin.settings.groupHome', keys: ['home_about_text'] },
  { titleKey: 'admin.settings.groupAbout', keys: ['about_subtitle', 'about_p1', 'about_p2', 'about_p3'] },
  {
    titleKey: 'admin.settings.groupPrinciples',
    keys: [
      'about_principles_title',
      'about_principle1_title', 'about_principle1_text',
      'about_principle2_title', 'about_principle2_text',
      'about_principle3_title', 'about_principle3_text',
    ],
  },
  { titleKey: 'admin.settings.groupFooter', keys: ['footer_tagline', 'footer_email', 'footer_rights'] },
  { titleKey: 'admin.settings.groupContact', keys: ['contact_subtitle', 'contact_email', 'contact_social_text'] },
  { titleKey: 'admin.settings.groupOrder', keys: ['order_text', 'order_phone', 'order_whatsapp'] },
];

function singleInputType(key) {
  if (key.includes('email')) return 'email';
  if (key.includes('phone')) return 'tel';
  return 'text';
}

function keyLabel(key, t) {
  const pretty = key.replace(/_/g, ' ');
  return t(`admin.settings.field_${key}`, { defaultValue: pretty });
}

export default function SettingsAdmin() {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const map = await fetchSettings();
        if (!alive) return;
        const next = {};
        for (const k of SETTING_KEYS) {
          next[k] = {
            value_fr: map[k]?.value_fr ?? '',
            value_ar: map[k]?.value_ar ?? '',
          };
        }
        setValues(next);
      } catch {
        if (alive) setError(t('common.error'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [t]);

  const set = (key, lang) => (e) =>
    setValues((v) => {
      if (SINGLE_VALUE_KEYS.includes(key)) {
        return { ...v, [key]: { value_fr: e.target.value, value_ar: e.target.value } };
      }
      return { ...v, [key]: { ...v[key], [lang]: e.target.value } };
    });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      for (const k of SETTING_KEYS) {
        const row = values[k];
        if (!row) continue;
        await upsertSetting(k, {
          value_fr: row.value_fr?.trim() || null,
          value_ar: row.value_ar?.trim() || null,
        });
      }
      setNotice(t('admin.settings.saved'));
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (isDemoMode()) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">{t('admin.settings.title')}</h1>
        <p className="mt-3 rounded-md border border-sand bg-sand/30 px-4 py-3 text-sm" role="alert">
          {t('admin.settings.demoHint')}
        </p>
      </div>
    );
  }
  if (!isAdmin) {
    return <p className="max-w-3xl rounded-md bg-sand/40 px-4 py-6 text-center text-sm" role="alert">{t('admin.settings.adminOnly')}</p>;
  }

  const inputCls = 'mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-ink';

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">{t('admin.settings.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('admin.settings.subtitle')}</p>

      {notice && <p className="mt-4 rounded-md bg-sage/25 px-3 py-2 text-sm" role="status">{notice}</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}

      <form onSubmit={save} className="mt-5 space-y-6">
        {GROUPS.map((g) => (
          <fieldset key={g.titleKey} className="rounded-[6px] border border-ink/12 bg-white p-5">
            <legend className="px-2 font-display text-xl font-semibold">{t(g.titleKey)}</legend>
            <div className="space-y-4">
              {g.keys.map((key) =>
                SINGLE_VALUE_KEYS.includes(key) ? (
                  <label key={key} className="block text-sm font-medium">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                      {keyLabel(key, t)}
                    </span>
                    <input
                      dir="ltr"
                      type={singleInputType(key)}
                      value={values[key]?.value_fr ?? ''}
                      onChange={set(key, 'value_fr')}
                      placeholder={key.includes('email') ? 'contact@doctopia.example' : key.includes('whatsapp') ? '213555123456' : '+213 555 12 34 56'}
                      className={inputCls}
                    />
                  </label>
                ) : (
                <div key={key} className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                      {keyLabel(key, t)} - {t('admin.settings.valueFr')}
                    </span>
                    <textarea
                      dir={i18n.language?.startsWith('ar') ? undefined : 'ltr'}
                      rows={key.includes('subtitle') || key.includes('about_text') || key.includes('tagline') || key.includes('social') ? 3 : 2}
                      value={values[key]?.value_fr ?? ''}
                      onChange={set(key, 'value_fr')}
                      className={inputCls}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                      {keyLabel(key, t)} - {t('admin.settings.valueAr')}
                    </span>
                    <textarea
                      dir="rtl"
                      rows={key.includes('subtitle') || key.includes('about_text') || key.includes('tagline') || key.includes('social') ? 3 : 2}
                      value={values[key]?.value_ar ?? ''}
                      onChange={set(key, 'value_ar')}
                      className={inputCls}
                    />
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="rounded-[4px] bg-ink px-8 py-3.5 text-sm font-bold text-cream hover:opacity-90 disabled:opacity-60"
        >
          {saving ? t('admin.settings.saving') : t('admin.settings.save')}
        </button>
      </form>
    </div>
  );
}
