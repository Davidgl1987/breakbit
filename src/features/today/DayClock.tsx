import { workEnd } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DayPlan, Instant } from '@/domain/types';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import styles from './TodayScreen.module.css';

/**
 * Next to the greeting: how much of the workday is left, or when it starts. Nothing once
 * the hours are over (the card to close the day says so).
 */
export function DayClock({ plan, now }: { plan: DayPlan; now: Instant }) {
  const { t } = useT();
  const start = atTime(plan.date, plan.schedule.workStart);
  const minutesLeft = Math.ceil((workEnd(plan) - now) / 60_000);
  if (minutesLeft <= 0) return null;
  const before = now < start;
  return (
    <span className={styles.clock}>
      {before
        ? t('today.startsAt', { time: plan.schedule.workStart })
        : t('redesign.remaining', { time: formatDuration(minutesLeft) })}
    </span>
  );
}
