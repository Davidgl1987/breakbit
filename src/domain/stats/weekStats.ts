import { WEEK } from '../config';
import { addDays, compareDateKeys } from '../time';
import type { DateKey, XpEntry } from '../types';
import { dayStat, type HistoryInput } from './days';

/** A week in numbers (Monday to Sunday, up to today). */
export interface WeekStats {
  /** Workdays that counted: worked or missed. */
  plannedDays: number;
  goodDays: number;
  /** Days the main activity was done. */
  mainDays: number;
  /** Planned microbreaks and how they went. */
  planned: number;
  completed: number;
  firstPrompt: number;
  postponed: number;
  ignored: number;
  skipped: number;
  missed: number;
  extras: number;
  microSec: number;
  movementSec: number;
  interruptionSec: number;
  xp: number;
}

/**
 * `days` limits it to the first days of the week (Monday = 1), to compare a week under
 * way with the same stretch of the previous one.
 */
export function weekStats(
  start: DateKey,
  input: HistoryInput,
  ledger: readonly XpEntry[],
  days = 7,
): WeekStats {
  const stats: WeekStats = {
    plannedDays: 0,
    goodDays: 0,
    mainDays: 0,
    planned: 0,
    completed: 0,
    firstPrompt: 0,
    postponed: 0,
    ignored: 0,
    skipped: 0,
    missed: 0,
    extras: 0,
    microSec: 0,
    movementSec: 0,
    interruptionSec: 0,
    xp: 0,
  };
  const end = addDays(start, days - 1);
  for (let i = 0; i < days; i++) {
    const stat = dayStat(addDays(start, i), input);
    if (stat.kind === 'absent') stats.plannedDays++;
    if (stat.kind !== 'worked') continue;
    const { summary } = stat;
    stats.plannedDays++;
    if (summary.isGood) stats.goodDays++;
    if (summary.mainCompleted) stats.mainDays++;
    stats.planned += summary.planned;
    stats.completed += summary.completed;
    stats.firstPrompt += summary.firstPrompt;
    stats.postponed += summary.postponed;
    stats.ignored += summary.ignored;
    stats.skipped += summary.skipped;
    stats.missed += summary.missed;
    stats.extras += summary.extras;
    stats.microSec += summary.microSec;
    stats.movementSec += summary.movementSec;
    stats.interruptionSec += summary.interruptionSec;
  }
  stats.xp = ledger
    .filter(
      (entry) => compareDateKeys(entry.date, start) >= 0 && compareDateKeys(entry.date, end) <= 0,
    )
    .reduce((sum, entry) => sum + entry.amount, 0);
  return stats;
}

/**
 * Where the current week stands for the avatar: its planned workdays (including the ones
 * still to come), the good ones so far, and how many more it needs for a good week.
 * - short: fewer than 3 planned days, it won't count;
 * - done: already enough good days;
 * - reachable: the days left are enough;
 * - out_of_reach: not this week (every good day still counts for the streak).
 */
export interface WeekOutlook {
  planned: number;
  good: number;
  needed: number;
  status: 'short' | 'done' | 'reachable' | 'out_of_reach';
}

export function weekOutlook(start: DateKey, input: HistoryInput): WeekOutlook {
  let planned = 0;
  let good = 0;
  let left = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const stat = dayStat(date, input);
    switch (stat.kind) {
      case 'future':
        // Still to come: a workday on the calendar, unless already marked off.
        if (
          compareDateKeys(date, input.since) >= 0 &&
          input.days[date]?.status !== 'day_off' &&
          input.isWorkday(date)
        ) {
          planned++;
          left++;
        }
        break;
      case 'pending':
        planned++;
        left++;
        break;
      case 'absent':
        planned++;
        break;
      case 'worked':
        planned++;
        if (stat.summary.isGood) good++;
        // Today can still turn good.
        else if (date === input.today && input.days[date]?.status === 'active') left++;
        break;
      default:
        break;
    }
  }
  // Integer maths: 70 % of 10 days is exactly 7.
  const percent = Math.round(WEEK.goodWeekMinRatio * 100);
  const needed = Math.max(0, Math.ceil((planned * percent) / 100) - good);
  const status =
    planned < WEEK.minPlannedDays
      ? 'short'
      : needed === 0
        ? 'done'
        : needed <= left
          ? 'reachable'
          : 'out_of_reach';
  return { planned, good, needed, status };
}
