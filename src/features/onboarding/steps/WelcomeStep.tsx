import { useNavigate } from 'react-router';
import { LOCALES, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { EvolutionStrip } from '@/ui/game/EvolutionStrip/EvolutionStrip';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import type { MessageKey } from '@/i18n/translate';
import stepStyles from '../OnboardingStep.module.css';
import { onboardingPath } from '../steps';
import styles from './WelcomeStep.module.css';

const POINTS: { icon: IconName; text: MessageKey }[] = [
  { icon: 'stretch', text: 'onboarding.welcome.points.pauses' },
  { icon: 'walk', text: 'onboarding.welcome.points.main' },
  { icon: 'streak', text: 'onboarding.welcome.points.habit' },
  { icon: 'home_place', text: 'onboarding.welcome.points.private' },
];

/** Step 1: what Breakbit is, with the whole avatar evolution. */
export function WelcomeStep() {
  const { t, locale } = useT();
  const setLocale = useAppStore((state) => state.setLocale);
  const navigate = useNavigate();

  return (
    <div className={stepStyles.step}>
      <header className={styles.header}>
        <Wordmark />
        <SegmentedControl<Locale>
          label={t('settings.language')}
          value={locale}
          onChange={setLocale}
          options={LOCALES.map((value) => ({ value, label: value.toUpperCase() }))}
        />
      </header>

      <div className={styles.intro}>
        <h1 className={styles.title}>{t('onboarding.welcome.title')}</h1>
        <p className={styles.subtitle}>{t('onboarding.welcome.subtitle')}</p>
      </div>

      <div className={stepStyles.body}>
        <Card className={styles.evolution}>
          <EvolutionStrip />
          <p className={styles.caption}>{t('evolution.caption')}</p>
        </Card>
        <ul className={styles.points}>
          {POINTS.map((point) => (
            <li key={point.text} className={styles.point}>
              <PixelIcon name={point.icon} size={24} />
              {t(point.text)}
            </li>
          ))}
        </ul>
      </div>

      <div className={stepStyles.footer}>
        <Button size="lg" fullWidth onClick={() => navigate(onboardingPath('schedule'))}>
          {t('onboarding.welcome.start')}
        </Button>
      </div>
    </div>
  );
}
