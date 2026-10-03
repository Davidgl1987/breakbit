import { XP } from '../config';
import { isOpen } from '../pause/window';
import { withAwards } from '../progress/awards';
import { addDays, compareDateKeys } from '../time';
import type {
  Catalog,
  DailySummary,
  DateKey,
  DayPlan,
  DayRecord,
  Instant,
  ScheduledActivity,
  XpEntry,
} from '../types';
import { dayProgress, type DayProgress } from './progress';

/** Ends a day's plan: whatever was still open (or half done) is missed, "day_closed". */
export function closePlan(plan: DayPlan): DayPlan {
  if (!plan.activities.some(isOpen)) return plan;
  return {
    ...plan,
    activities: plan.activities.map((item) =>
      isOpen(item)
        ? { ...item, status: 'missed', missReason: 'day_closed', runningSince: undefined }
        : item,
    ),
  };
}

/** XP for how the day went: +200 for a good day and +100 more for a perfect one. Never multiplied. */
export function dayGoalXp(
  date: DateKey,
  progress: Pick<DayProgress, 'isGood' | 'isPerfect'>,
  now: Instant,
): XpEntry[] {
  const entries: XpEntry[] = [];
  if (progress.isGood) {
    entries.push({ key: `good:${date}`, amount: XP.goodDay, at: now, date, reason: 'good_day' });
  }
  if (progress.isGood && progress.isPerfect) {
    entries.push({
      key: `perfect:${date}`,
      amount: XP.perfectDay,
      at: now,
      date,
      reason: 'perfect_day',
    });
  }
  return entries;
}

/** The day in numbers, kept when it closes so history stays put if rules or content change. */
export function summarizeDay(plan: DayPlan, catalog: Catalog, xp: number): DailySummary {
  const progress = dayProgress(plan, catalog);
  const planned = plan.activities.filter((item) => item.kind === 'micro' && item.origin !== 'gap');
  const count = (test: (item: ScheduledActivity) => boolean) => planned.filter(test).length;
  return {
    planned: progress.planned,
    completed: progress.completed,
    firstPrompt: count((item) => item.status === 'completed' && item.firstPrompt === true),
    postponed: count((item) => item.postponeCount > 0),
    ignored: count((item) => item.remindersSent > 0),
    skipped: count((item) => item.status === 'skipped'),
    missed: count((item) => item.status === 'missed'),
    extras: progress.extras,
    mainCompleted: progress.mainCompleted,
    microSec: plan.activities
      .filter((item) => item.kind === 'micro' && item.status === 'completed')
      .reduce((total, item) => total + (item.elapsedSec ?? item.durationSec), 0),
    movementSec: progress.movementSec,
    interruptionSec: progress.interruptionSec,
    xp,
    isGood: progress.isGood,
    isPerfect: progress.isPerfect,
  };
}

/**
 * Closes a day under way: the plan ends, the good/perfect day XP is earned and the
 * summary (with the day's whole XP) is kept. A day that isn't under way is left alone.
 */
export function closeRecord(
  record: DayRecord,
  now: Instant,
  catalog: Catalog,
  ledger: readonly XpEntry[],
): { record: DayRecord; awards: XpEntry[] } {
  if (record.status !== 'active' || !record.plan) return { record, awards: [] };
  const plan = closePlan(record.plan);
  const awards = dayGoalXp(record.date, dayProgress(plan, catalog), now);
  const xp = withAwards(ledger, awards)
    .filter((entry) => entry.date === record.date)
    .reduce((total, entry) => total + entry.amount, 0);
  return {
    record: {
      ...record,
      status: 'closed',
      plan,
      closedAt: now,
      summary: summarizeDay(plan, catalog, xp),
    },
    awards,
  };
}

export interface PastDaysInput {
  today: DateKey;
  /** The onboarding day: nothing before it counts, and it is never "absent". */
  since: DateKey;
  days: Partial<Record<DateKey, DayRecord>>;
  isWorkday: (date: DateKey) => boolean;
}

/**
 * What the past still owes, closed lazily the next time the app opens: days left under
 * way get closed, and planned workdays nobody started become "absent" (not good).
 */
export function pastDaysToSettle({ today, since, days, isWorkday }: PastDaysInput): {
  close: DateKey[];
  absent: DateKey[];
} {
  const close: DateKey[] = [];
  const absent: DateKey[] = [];
  for (let date = since; compareDateKeys(date, today) < 0; date = addDays(date, 1)) {
    const record = days[date];
    if (record?.status === 'active') close.push(date);
    else if (!record && date !== since && isWorkday(date)) absent.push(date);
  }
  return { close, absent };
}

/**
 * The first workday after missing at least one gets ×1.5 base XP, once per absence:
 * looking back, a missed workday comes before any day that was worked.
 */
export function returnBonusFor({ today, since, days, isWorkday }: PastDaysInput): boolean {
  for (let date = addDays(today, -1); compareDateKeys(date, since) >= 0; date = addDays(date, -1)) {
    const record = days[date];
    if (record?.status === 'active' || record?.status === 'closed') return false;
    if (record?.status === 'absent') return true;
    if (!record && date !== since && isWorkday(date)) return true;
  }
  return false;
}
