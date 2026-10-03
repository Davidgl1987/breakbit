import { WEEK } from '../config';
import { dayProgress } from '../day/progress';
import { addDays, compareDateKeys, isoWeekKey, startOfWeek } from '../time';
import type {
  Catalog,
  DateKey,
  DayRecord,
  EvolutionPhase,
  ProgressState,
  WeeklyResult,
  WeekResult,
} from '../types';

export interface WeekInput {
  /** The days from the onboarding on count; the onboarding day only if it was worked. */
  since: DateKey;
  days: Partial<Record<DateKey, DayRecord>>;
  isWorkday: (date: DateKey) => boolean;
  catalog: Catalog;
}

/**
 * How a week went (Monday to Sunday): its planned workdays (days off and days before the
 * onboarding don't count) and how many were good. Fewer than 3 planned days make it
 * neutral; otherwise ≥70 % good is a good week, 40–69 % regular, below that bad.
 */
export function weekTally(
  start: DateKey,
  { since, days, isWorkday, catalog }: WeekInput,
): { planned: number; good: number; result: WeekResult } {
  let planned = 0;
  let good = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    if (compareDateKeys(date, since) < 0) continue;
    const record = days[date];
    switch (record?.status) {
      case 'day_off':
        continue;
      case 'closed':
        planned++;
        if (record.summary?.isGood) good++;
        continue;
      case 'absent':
        planned++;
        continue;
      case 'active':
        planned++;
        if (record.plan && dayProgress(record.plan, catalog).isGood) good++;
        continue;
      default:
        // Not started: a missed workday, except the onboarding day.
        if (date !== since && isWorkday(date)) planned++;
    }
  }
  return { planned, good, result: weekResult(planned, good) };
}

function weekResult(planned: number, good: number): WeekResult {
  if (planned < WEEK.minPlannedDays) return 'neutral';
  const percent = (good * 100) / planned;
  if (percent >= WEEK.goodWeekMinRatio * 100) return 'good';
  if (percent >= WEEK.regularWeekMinRatio * 100) return 'regular';
  return 'bad';
}

/** One phase up after a good week, one down after a bad one, always within 1–5. */
export function phaseAfter(phase: EvolutionPhase, result: WeekResult): EvolutionPhase {
  if (result === 'good') return Math.min(WEEK.maxPhase, phase + 1) as EvolutionPhase;
  if (result === 'bad') return Math.max(WEEK.minPhase, phase - 1) as EvolutionPhase;
  return phase;
}

/**
 * Evaluates every week that has ended and wasn't yet, in order, from the onboarding
 * week on. A good week already at the top phase unlocks the next room item. Weeks are
 * only judged once they are over, the first time the app opens afterwards.
 */
export function evaluateWeeks(
  progress: ProgressState,
  today: DateKey,
  input: WeekInput,
  roomItems: readonly string[],
): ProgressState {
  let next = progress;
  for (
    let start = startOfWeek(input.since);
    compareDateKeys(addDays(start, 6), today) < 0;
    start = addDays(start, 7)
  ) {
    const week = isoWeekKey(start);
    if (next.lastEvaluatedWeek !== undefined && week <= next.lastEvaluatedWeek) continue;
    const tally = weekTally(start, input);
    const phaseBefore = next.evolutionPhase;
    const unlocked =
      tally.result === 'good' && phaseBefore === WEEK.maxPhase
        ? roomItems.find((id) => !next.unlockedRoomItems.includes(id))
        : undefined;
    const result: WeeklyResult = {
      week,
      start,
      ...tally,
      phaseBefore,
      phaseAfter: phaseAfter(phaseBefore, tally.result),
      ...(unlocked && { unlocked }),
    };
    next = {
      ...next,
      evolutionPhase: result.phaseAfter,
      lastEvaluatedWeek: week,
      weeklyResults: [...next.weeklyResults, result],
      unlockedRoomItems: unlocked ? [...next.unlockedRoomItems, unlocked] : next.unlockedRoomItems,
    };
  }
  return next;
}

/** Good weeks in a row up to the latest; short (neutral) weeks neither add nor break it. */
export function goodWeekStreak(results: readonly WeeklyResult[]): number {
  let streak = 0;
  for (const week of [...results].reverse()) {
    if (week.result === 'neutral') continue;
    if (week.result !== 'good') break;
    streak++;
  }
  return streak;
}

/** The latest weekly result the user hasn't seen yet, if any. */
export function unseenWeek(progress: ProgressState): WeeklyResult | undefined {
  const latest = progress.weeklyResults.at(-1);
  if (!latest) return undefined;
  return progress.lastSeenWeek !== undefined && latest.week <= progress.lastSeenWeek
    ? undefined
    : latest;
}
