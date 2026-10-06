import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('ar') ? 'ar' : 'fr';

  const switchTo = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-ink/15 bg-cream/80 px-1 py-1 text-xs font-semibold tracking-wide"
      role="group"
      aria-label="Language / اللغة"
    >
      {[
        { code: 'fr', label: 'FR' },
        { code: 'ar', label: 'العربية' },
      ].map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={current === code}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            current === code
              ? 'bg-ink text-cream'
              : 'text-ink/70 hover:bg-sand/60 hover:text-ink'
          } ${compact ? 'text-[11px]' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
