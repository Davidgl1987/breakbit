import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { feedbackHref } from '@/app/site';
import type { EvolutionPhase } from '@/domain/types';
import { LOCALES, type Locale, type MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { trackEvent } from '@/services/analytics';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import type { IconName } from '@/ui/icons/iconNames';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { onboardingPath } from '../steps';
import styles from './IntroStep.module.css';

const STEPS: { id: 'plan' | 'pauses' | 'main' | 'avatar'; icon: IconName }[] = [
  { id: 'plan', icon: 'calendar' },
  { id: 'pauses', icon: 'stretch' },
  { id: 'main', icon: 'walk' },
  { id: 'avatar', icon: 'level_up' },
];

const PERKS: { text: MessageKey; icon: IconName }[] = [
  { text: 'landing.perks.free', icon: 'reward' },
  { text: 'landing.perks.noAccount', icon: 'shield' },
  { text: 'landing.perks.private', icon: 'home_place' },
  { text: 'landing.perks.offline', icon: 'completed' },
  { text: 'landing.perks.install', icon: 'laptop' },
];

const PHASES: EvolutionPhase[] = [1, 2, 3, 4, 5];

/**
 * The landing for new visitors: the brand on the first screen, then what Breakbit does,
 * so a shared link explains itself. Returning users go straight to Today.
 */
export function IntroStep() {
  const { t, locale } = useT();
  const setLocale = useAppStore((state) => state.setLocale);
  const navigate = useNavigate();
  const feedback = feedbackHref('Breakbit', locale);
  const start = (from: string) => {
    trackEvent(`landing-start-${from}`);
    navigate(onboardingPath('welcome'));
  };

  return (
    <div className={styles.page}>
      <section className={styles.screen}>
        <header className={styles.header}>
          <Wordmark />
          <SegmentedControl<Locale>
            label={t('settings.language')}
            value={locale}
            onChange={setLocale}
            options={LOCALES.map((value) => ({ value, label: value.toUpperCase() }))}
          />
        </header>
        <div className={styles.identity}>
          <img
            src={`${import.meta.env.BASE_URL}brand/symbol-dark.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`${styles.symbol} ${styles.darkSymbol}`}
          />
          <img
            src={`${import.meta.env.BASE_URL}brand/symbol-light.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`${styles.symbol} ${styles.lightSymbol}`}
          />
          <h1 className={styles.slogan}>
            <span>{t('onboarding.brand.pause')}</span>{' '}
            <span className={styles.accent}>{t('onboarding.brand.move')}</span>{' '}
            <span>{t('onboarding.brand.continue')}</span>
          </h1>
          <p className={styles.subtitle}>{t('onboarding.brand.subtitle')}</p>
        </div>
        <footer className={styles.footer}>
          <Button size="lg" fullWidth onClick={() => start('top')}>
            {t('onboarding.brand.start')}
            <LineIcon name="chevron-right" size={18} />
          </Button>
          <p>{t('onboarding.welcome.points.private')}</p>
          <a className={styles.more} href="#how">
            {t('landing.how')}
            <LineIcon name="chevron-down" size={18} />
          </a>
        </footer>
      </section>

      <section id="how" className={styles.section} aria-labelledby="how-title">
        <h2 id="how-title" className={styles.sectionTitle}>
          {t('landing.how')}
        </h2>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.id} className={styles.step}>
              <PixelIcon name={step.icon} size={32} />
              <div>
                <h3>{t(`landing.steps.${step.id}.title`)}</h3>
                <p>{t(`landing.steps.${step.id}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <ul className={styles.phases} aria-label={t('evolution.title')}>
          {PHASES.map((phase) => (
            <li key={phase}>
              <Avatar
                phase={phase}
                size="fluid"
                framed={false}
                label={t('evolution.phaseLabel', {
                  phase,
                  name: t(`evolution.phases.p${phase}`),
                })}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="perks-title">
        <h2 id="perks-title" className={styles.sectionTitle}>
          {t('landing.perksTitle')}
        </h2>
        <ul className={styles.perks}>
          {PERKS.map((perk) => (
            <li key={perk.text}>
              <PixelIcon name={perk.icon} size={24} />
              {t(perk.text)}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <h2 id="closing-title" className={styles.sectionTitle}>
          {t('landing.finalTitle')}
        </h2>
        <Button size="lg" fullWidth onClick={() => start('bottom')}>
          {t('onboarding.welcome.start')}
          <LineIcon name="chevron-right" size={18} />
        </Button>
        <p className={styles.disclaimer}>{t('settings.about.notMedical')}</p>
        <nav className={styles.links} aria-label="Breakbit">
          <Link to={ROUTES.privacy}>{t('landing.privacy')}</Link>
          {feedback && (
            <a href={feedback} target="_blank" rel="noopener noreferrer">
              {t('landing.feedback')}
            </a>
          )}
        </nav>
      </section>
    </div>
  );
}
