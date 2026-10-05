import { workEnd } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DayPlan, Instant } from '@/domain/types';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { PixelIcon } from '@/ui/icons/PixelIcon';
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
  const label = before ? t('today.clock.startsAt') : t('today.clock.left');
  const value = before ? plan.schedule.workStart : formatDuration(minutesLeft);
  const sentence = before
    ? t('today.startsAt', { time: plan.schedule.workStart })
    : t('today.timeLeft', { time: formatDuration(minutesLeft) });
  return (
    <p className={styles.clock}>
      <PixelIcon name="clock" size={24} />
      <span className={styles.clockTexts} aria-hidden="true">
        <span className={styles.clockLabel}>{label}</span>
        <span className={styles.clockValue}>{value}</span>
      </span>
      {/* Read as one sentence. */}
      <span className="visually-hidden">{sentence}</span>
    </p>
  );
}
