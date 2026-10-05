import { useMemo } from 'react';
import { toDateKey } from '@/domain/time';
import type { Intensity, UserSettings } from '@/domain/types';
import { estimateDay } from '@/features/onboarding/estimate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { Card } from '@/ui/components/Card/Card';
import { ChipGroup } from '@/ui/components/ChipGroup/ChipGroup';
import { MetricTile } from '@/ui/components/MetricTile/MetricTile';
import { INTENSITIES, PACE_ICONS } from './pace';
import styles from './profile.module.css';

/** Pace: what it means for the user's own workday matters more than the label. */
export function IntensityFields({
  settings,
  onChange,
}: {
  /** The settings being edited (the estimate uses their hours). */
  settings: UserSettings;
  onChange: (intensity: Intensity) => void;
}) {
  const { t } = useT();
  const estimate = useMemo(() => estimateDay(settings, toDateKey(clock.now())), [settings]);
  return (
    <>
      <ChipGroup
        label={t('intensity.label')}
        fill
        value={settings.intensity}
        onChange={onChange}
        options={INTENSITIES.map((value) => ({
          value,
          label: t(`intensity.${value}`),
          icon: PACE_ICONS[value],
        }))}
      />
      <p className={styles.muted}>{t(`onboarding.intensity.descriptions.${settings.intensity}`)}</p>
      <Card variant="tinted" className={styles.section}>
        <h3 className={styles.heading}>
          {t('onboarding.intensity.withYourDay', {
            start: settings.schedule.workStart,
            end: settings.schedule.workEnd,
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
    </>
  );
}
