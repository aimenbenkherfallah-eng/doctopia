import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ar from './ar/translation.json';
import fr from './fr/translation.json';

const SUPPORTED = ['fr', 'ar'];

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem('doctopia-lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  return 'fr';
}

const initial = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: initial,
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'doctopia-lang',
      caches: ['localStorage'],
    },
  });

export function setDocumentDirection(lng) {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  try {
    localStorage.setItem('doctopia-lang', lng);
  } catch {}
}

setDocumentDirection(initial);
i18n.on('languageChanged', (lng) => setDocumentDirection(lng));

export default i18n;
