import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LOCALES, type Locale } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { SegmentedControl } from '@/ui/components/SegmentedControl/SegmentedControl';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { EvolutionSheet } from '@/ui/game/EvolutionSheet/EvolutionSheet';
import { LineIcon } from '@/ui/icons/LineIcon';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import type { MessageKey } from '@/i18n/translate';
import { onboardingPath } from '../steps';
import styles from './WelcomeStep.module.css';

const POINTS: { icon: IconName; text: MessageKey }[] = [
  { icon: 'stretch', text: 'onboarding.welcome.points.pauses' },
  { icon: 'walk', text: 'onboarding.welcome.points.main' },
  { icon: 'streak', text: 'onboarding.welcome.points.habit' },
];

/** The first phase is the starting point, not an onboarding reward. */
export function WelcomeStep() {
  const { t, locale } = useT();
  const setLocale = useAppStore((state) => state.setLocale);
  const navigate = useNavigate();
  const [phasesOpen, setPhasesOpen] = useState(false);

  return (
    <FlowLayout
      header={
        <>
          <header className={styles.header}>
            <Wordmark />
            <SegmentedControl<Locale>
              label={t('settings.language')}
              value={locale}
              onChange={setLocale}
              options={LOCALES.map((value) => ({
                value,
                label: value.toUpperCase(),
              }))}
            />
          </header>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{t('onboarding.design.stepByStep')}</p>
            <h1 className={styles.title}>{t('onboarding.welcome.title')}</h1>
            <p className={styles.subtitle}>{t('onboarding.welcome.subtitle')}</p>
          </div>
        </>
      }
      footer={
        <>
          <p className={styles.privacy}>{t('onboarding.welcome.points.private')}</p>
          <Button size="lg" fullWidth onClick={() => navigate(onboardingPath('schedule'))}>
            {t('onboarding.welcome.start')}
          </Button>
        </>
      }
    >
      <Card variant="tinted" className={styles.evolution}>
        <div className={styles.heroTexts}>
          <p className={styles.eyebrow}>{t('onboarding.design.firstPhase')}</p>
          <h2>{t('evolution.phases.p1')}</h2>
          <p className={styles.caption}>{t('onboarding.design.avatarHabit')}</p>
        </div>
        <Avatar phase={1} size="lg" framed={false} />
      </Card>
      <button className={styles.phases} onClick={() => setPhasesOpen(true)}>
        {t('onboarding.design.seePhases')}
        <LineIcon name="chevron-up" size={18} />
      </button>
      <ul className={styles.points}>
        {POINTS.map((point) => (
          <li key={point.text} className={styles.point}>
            <PixelIcon name={point.icon} size={24} />
            <div>
              <strong>{t(point.text)}</strong>
              <p className={styles.caption}>
                {t(`onboarding.design.benefits.${point.icon as 'stretch' | 'walk' | 'streak'}`)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {phasesOpen && <EvolutionSheet phase={1} onClose={() => setPhasesOpen(false)} />}
    </FlowLayout>
  );
}
