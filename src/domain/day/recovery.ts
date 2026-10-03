import { GOALS } from '../config';
import type { Catalog, DayRecord, Instant, ScheduledActivity } from '../types';
import { dayProgress } from './progress';

/**
 * The pause the end of the day can still save: the latest missed planned one, and only
 * one per day. Doing several in a row can't rescue a whole day.
 */
export function recoverablePause(record: DayRecord): ScheduledActivity | undefined {
  if (record.status !== 'active' || !record.plan) return undefined;
  if (record.recoveryUsed || GOALS.maxRecoveriesPerDay < 1) return undefined;
  return record.plan.activities
    .filter((item) => item.kind === 'micro' && item.origin === 'plan' && item.status === 'missed')
    .sort((a, b) => b.currentScheduledAt - a.currentScheduledAt)[0];
}

/**
 * Starts recovering a missed pause: it opens again, started now, as "recovery". It keeps
 * why it was missed, counts for the day's goal and earns its base XP, never the
 * "a la primera" bonus.
 */
export function recoverPause(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (item.kind !== 'micro' || item.status !== 'missed') return item;
  return {
    ...item,
    origin: 'recovery',
    status: 'pending',
    currentScheduledAt: now,
    startedAt: now,
    firstPrompt: false,
  };
}

/** Whether one more pause done would turn the day good. */
export function recoveryMakesGood(record: DayRecord, catalog: Catalog): boolean {
  if (!record.plan) return false;
  const progress = dayProgress(record.plan, catalog);
  if (progress.isGood || !(progress.mainCompleted || !progress.hasMain)) return false;
  const minPercent = Math.round(GOALS.goodDayMinRatio * 100);
  return (progress.completed + 1) * 100 >= progress.planned * minPercent;
}
