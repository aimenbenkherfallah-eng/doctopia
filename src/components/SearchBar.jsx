import { useTranslation } from 'react-i18next';
import { localizedCategoryName } from '../utils/constants';
import { useLanguage } from '../hooks/useLanguage';

export default function SearchBar({
  search, onSearch,
  categoryId, onCategory, categories = [],
  language, onLanguage,
  sort, onSort,
  onClear,
}) {
  const { t } = useTranslation();
  const { lng } = useLanguage();

  return (
    <div className="rounded-[6px] border border-ink/12 bg-white p-4 shadow-[0_2px_12px_-8px_rgba(23,42,70,0.25)]">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="flex flex-col gap-1">
          <span className="sr-only">{t('search.label')}</span>
          <div className="relative">
            <svg className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full rounded-md border border-ink/15 bg-cream py-2.5 pe-3 ps-9 text-sm text-ink placeholder:text-ink/40 focus:border-ink"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
          {t('search.category')}
          <select
            value={categoryId}
            onChange={(e) => onCategory(e.target.value)}
            className="rounded-md border border-ink/15 bg-cream px-2.5 py-2.5 text-sm text-ink"
          >
            <option value="">{t('search.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{localizedCategoryName(c, lng)}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
          {t('search.language')}
          <select
            value={language}
            onChange={(e) => onLanguage(e.target.value)}
            className="rounded-md border border-ink/15 bg-cream px-2.5 py-2.5 text-sm text-ink"
          >
            <option value="">{t('search.allLanguages')}</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="other">Other / أخرى</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
          <span aria-hidden="true">↕</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="rounded-md border border-ink/15 bg-cream px-2.5 py-2.5 text-sm text-ink"
            aria-label="Sort"
          >
            <option value="recent">{t('search.sortRecent')}</option>
            <option value="title">{t('search.sortTitle')}</option>
            <option value="year">{t('search.sortYear')}</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-ink/15 px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
          >
            {t('search.clear')}
          </button>
        </div>
      </div>
    </div>
  );
}
