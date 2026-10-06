import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLanguage } from '../../hooks/useLanguage';

export default function About() {
  const { t } = useTranslation();
  const { lng } = useLanguage();
  const { get } = useSiteSettings();

  const subtitle = get('about_subtitle', lng, t('about.subtitle'));
  const p1 = get('about_p1', lng, t('about.p1'));
  const p2 = get('about_p2', lng, t('about.p2'));
  const p3 = get('about_p3', lng, t('about.p3'));
  const principlesTitle = get('about_principles_title', lng, t('about.principlesTitle'));

  const principles = [
    {
      title: get('about_principle1_title', lng, t('about.principle1Title')),
      text: get('about_principle1_text', lng, t('about.principle1Text')),
    },
    {
      title: get('about_principle2_title', lng, t('about.principle2Title')),
      text: get('about_principle2_text', lng, t('about.principle2Text')),
    },
    {
      title: get('about_principle3_title', lng, t('about.principle3Title')),
      text: get('about_principle3_text', lng, t('about.principle3Text')),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage">DOCTOPIA</p>
      <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{t('about.title')}</h1>
      <p className="mt-3 text-ink/60">{subtitle}</p>
      <div className="prose-doctopia mt-8 space-y-5 leading-relaxed text-ink/80">
        <p className="drop-cap">{p1}</p>
        <p>{p2}</p>
        <p className="rounded-md border-s-4 border-sage bg-white/60 p-4">{p3}</p>
      </div>
      <h2 className="font-display mt-12 text-3xl font-semibold">{principlesTitle}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {principles.map((p) => (
          <div key={p.title} className="rounded-[6px] border border-ink/12 bg-white p-5">
            <h3 className="font-display text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
