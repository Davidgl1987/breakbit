import { useMemo } from 'react';
import { toDateKey } from '@/domain/time';
import type { Intensity, UserSettings } from '@/domain/types';
import { estimateDay } from '@/features/onboarding/estimate';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { Card } from '@/ui/components/Card/Card';
import { useRadioGroup } from '@/ui/components/radioGroup';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { INTENSITIES, PACE_ICONS } from './pace';
import styles from './profile.module.css';

/** The same pace choices and real planner estimate in onboarding and Settings. */
export function IntensityFields({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: (intensity: Intensity) => void;
}) {
  const { t } = useT();
  const options = INTENSITIES.map((value) => ({
    value,
    label: t(`intensity.${value}`),
  }));
  const { itemProps } = useRadioGroup(options, settings.intensity, onChange);
  const estimate = useMemo(
    () =>
      scheduleIssueMessages(settings.schedule).length === 0
        ? estimateDay(settings, toDateKey(clock.now()))
        : undefined,
    [settings],
  );
  return (
    <>
      <div className={styles.paceOptions} role="radiogroup" aria-label={t('intensity.label')}>
        {options.map((option, index) => (
          <button
            key={option.value}
            {...itemProps(option, index)}
            aria-label={option.label}
            className={styles.paceOption}
          >
            <PixelIcon name={PACE_ICONS[option.value]} size={32} />
            <span>
              <strong>{option.label}</strong>
              <span className={styles.optionHint}>
                {t(`onboarding.intensity.descriptions.${option.value}`)}
              </span>
            </span>
            <span className={styles.radioMark} aria-hidden="true" />
          </button>
        ))}
      </div>
      <Card className={styles.section} aria-live="polite">
        <h3 className={styles.estimateTitle}>
          {t('onboarding.intensity.withYourDay', {
            start: settings.schedule.workStart,
            end: settings.schedule.workEnd,
          })}
        </h3>
        {estimate ? (
          <>
            <dl className={styles.estimateRows}>
              <div>
                <dt>{t('onboarding.design.shortBreaks')}</dt>
                <dd>{t('common.pausesPlanned', { count: estimate.pauses })}</dd>
              </div>
              <div>
                <dt>{t('onboarding.design.breakTime')}</dt>
                <dd>~{t('common.minutes', { count: estimate.interruptionMin })}</dd>
              </div>
              {estimate.mainMin > 0 && (
                <div>
                  <dt>{t('onboarding.design.mainActivity')}</dt>
                  <dd>~{t('common.minutes', { count: estimate.mainMin })}</dd>
                </div>
              )}
            </dl>
            {estimate.mainMin > 0 && (
              <p className={styles.optionHint}>{t('onboarding.design.mainHint')}</p>
            )}
          </>
        ) : (
          <p className={styles.muted}>{t('schedule.issues.invalid')}</p>
        )}
      </Card>
    </>
  );
}
