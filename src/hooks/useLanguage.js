import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();
  const lng = i18n.language?.startsWith('ar') ? 'ar' : 'fr';
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  const change = useCallback((next) => i18n.changeLanguage(next), [i18n]);
  return { lng, dir, change, isRTL: lng === 'ar' };
}
