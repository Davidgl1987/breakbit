import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toDateKey } from '@/domain/time';
import type { Intensity } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { Card } from '@/ui/components/Card/Card';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { MetricTile } from '@/ui/components/MetricTile/MetricTile';
import { useOnboardingDraft } from '../draftContext';
import { estimateDay } from '../estimate';
import styles from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

const INTENSITIES: Intensity[] = ['soft', 'normal', 'active'];

/** Step 5: pace. What it means for the user's own workday matters more than the label. */
export function IntensityStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();
  const estimate = useMemo(() => estimateDay(draft, toDateKey(clock.now())), [draft]);

  return (
    <OnboardingStep
      step="intensity"
      title={t('onboarding.intensity.title')}
      subtitle={t('onboarding.intensity.subtitle')}
      action={{ label: t('onboarding.next'), onClick: () => navigate(onboardingPath('summary')) }}
    >
      <ChipGroup
        label={t('intensity.label')}
        fill
        value={draft.intensity}
        onChange={(intensity) => update((current) => ({ ...current, intensity }))}
        options={INTENSITIES.map((value) => ({ value, label: t(`intensity.${value}`) }))}
      />
      <p className={styles.muted}>{t(`onboarding.intensity.descriptions.${draft.intensity}`)}</p>
      <Card variant="tinted" className={styles.section}>
        <h3 className={styles.heading}>
          {t('onboarding.intensity.withYourDay', {
            start: draft.schedule.workStart,
            end: draft.schedule.workEnd,
          })}
        </h3>
        <div className={styles.grid2}>
          <MetricTile
            layout="inline"
            icon="stretch"
            value={estimate.pauses}
            label={t('onboarding.intensity.pausesPerDay', { count: estimate.pauses })}
          />
          <MetricTile
            layout="inline"
            icon="clock"
            value={`~${t('common.minutes', { count: estimate.interruptionMin })}`}
            label={t('onboarding.intensity.interruption')}
          />
        </div>
        {estimate.mainMin > 0 && (
          <p className={styles.muted}>
            {t('onboarding.intensity.main', {
              minutes: t('common.minutes', { count: estimate.mainMin }),
            })}
          </p>
        )}
      </Card>
    </OnboardingStep>
  );
}
