import { useMemo, type ReactNode } from 'react';
import { equipmentIn } from '@/content/catalog';
import { toDateKey } from '@/domain/time';
import type { UserSettings } from '@/domain/types';
import { areaName, priorityAreas } from '@/features/day/catalogDisplay';
import { estimateDay } from '@/features/onboarding/estimate';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { rangeFromBlock } from '@/features/schedule/timeRange';
import { weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import styles from './ProfileSummary.module.css';

interface SummaryProps {
  title: string;
  onEdit: () => void;
}

function Section({ title, onEdit, children }: SummaryProps & { children: ReactNode }) {
  const { t } = useT();
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <button
          type="button"
          className={styles.edit}
          aria-label={t('common.editSection', { section: title })}
          onClick={onEdit}
        >
          {t('common.edit')}
        </button>
      </div>
      <div className={styles.lines}>{children}</div>
    </section>
  );
}

export function WorkdaySummary({
  title,
  onEdit,
  workDays,
  schedule,
}: SummaryProps & Pick<UserSettings, 'workDays' | 'schedule'>) {
  const { t, locale } = useT();
  return (
    <Section title={title} onEdit={onEdit}>
      <p className={styles.days}>
        {workDays.map((day) => weekdayName(locale, day, 'short')).join(' · ')}
      </p>
      <p>
        {schedule.workStart}–{schedule.workEnd}
      </p>
      {schedule.breaks.map((block, index) => (
        <p key={index}>{t('onboarding.summary.breakRange', { ...rangeFromBlock(block) })}</p>
      ))}
      {schedule.lunch && (
        <p>
          {t('onboarding.summary.lunchRange', {
            ...rangeFromBlock(schedule.lunch),
          })}
        </p>
      )}
    </Section>
  );
}
export function PrioritiesSummary({
  title,
  onEdit,
  discomfort,
}: SummaryProps & Pick<UserSettings, 'discomfort'>) {
  const { t, locale } = useT();
  const areas = priorityAreas(discomfort);
  return (
    <Section title={title} onEdit={onEdit}>
      {areas.length ? (
        <ul>
          {areas.map(({ area, level }) => (
            <li key={area}>
              {areaName(area, locale)} · <span aria-hidden="true">{level}/5</span>
              <span className="visually-hidden">
                {t('onboarding.summary.level', { value: level })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('onboarding.summary.noPriorities')}</p>
      )}
    </Section>
  );
}
export function EquipmentSummary({
  title,
  onEdit,
  equipment,
}: SummaryProps & Pick<UserSettings, 'equipment'>) {
  const { t, locale } = useT();
  const items = equipmentIn(equipment);
  return (
    <Section title={title} onEdit={onEdit}>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.name[locale]}</li>
          ))}
        </ul>
      ) : (
        <p>{t('onboarding.summary.noEquipment')}</p>
      )}
    </Section>
  );
}
export function PaceSummary({
  title,
  onEdit,
  settings,
}: SummaryProps & { settings: UserSettings }) {
  const { t } = useT();
  const estimate = useMemo(
    () =>
      scheduleIssueMessages(settings.schedule).length === 0
        ? estimateDay(settings, toDateKey(clock.now()))
        : undefined,
    [settings],
  );
  return (
    <Section title={title} onEdit={onEdit}>
      <p>{t(`intensity.${settings.intensity}`)}</p>
      <p>
        {estimate
          ? t('onboarding.design.paceDaily', {
              pauses: t('common.pausesPlanned', { count: estimate.pauses }),
              minutes: t('common.minutes', { count: estimate.interruptionMin }),
            })
          : t('schedule.issues.invalid')}
      </p>
    </Section>
  );
}
