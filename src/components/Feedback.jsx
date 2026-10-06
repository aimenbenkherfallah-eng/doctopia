import { useTranslation } from 'react-i18next';

export function Loader({ label } = {}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-ink/60" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-hidden="true" />
      <span className="text-sm">{label || t('common.loading')}</span>
    </div>
  );
}

export function EmptyState({ title, hint, action = null }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center">
      <p className="font-display text-2xl text-ink">{title || t('common.empty')}</p>
      {hint && <p className="max-w-sm text-sm text-ink/60">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-red-900/20 bg-red-50/40 px-6 py-10 text-center">
      <p className="text-sm text-red-950">{message || t('common.error')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-ink/90"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
