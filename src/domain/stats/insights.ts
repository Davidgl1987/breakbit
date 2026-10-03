import type { WeekStats } from './weekStats';

/**
 * Something worth telling about the week. Changes against the previous week show up in
 * either direction, said neutrally, but only when they are big enough to mean something;
 * plain facts fill the rest. Nothing here judges.
 */
export type Insight =
  /** Signed: more (+) or fewer (−) than the previous week. */
  | { kind: 'first_prompt' | 'postponed' | 'ignored'; change: number }
  | { kind: 'movement'; changeSec: number }
  | { kind: 'main'; done: number; total: number }
  | { kind: 'completed'; percent: number };

/** Below this, a change in a count is noise. */
const MIN_COUNT_CHANGE = 2;
/** Five minutes more or less of movement is worth a mention. */
const MIN_MOVEMENT_CHANGE_SEC = 5 * 60;

/**
 * `previous` should cover the same stretch of days as `current` (Monday up to today), so
 * a week under way isn't compared with a whole one.
 */
export function weekInsights(current: WeekStats, previous?: WeekStats): Insight[] {
  const insights: Insight[] = [];
  if (previous && previous.plannedDays > 0 && current.plannedDays > 0) {
    for (const kind of ['first_prompt', 'postponed', 'ignored'] as const) {
      const field = kind === 'first_prompt' ? 'firstPrompt' : kind;
      const change = current[field] - previous[field];
      if (Math.abs(change) >= MIN_COUNT_CHANGE) insights.push({ kind, change });
    }
    const movement = current.movementSec - previous.movementSec;
    if (Math.abs(movement) >= MIN_MOVEMENT_CHANGE_SEC) {
      // Movement goes right after "a la primera": both are the heart of the habit.
      insights.splice(insights[0]?.kind === 'first_prompt' ? 1 : 0, 0, {
        kind: 'movement',
        changeSec: movement,
      });
    }
  }
  // Plain facts only once there is something done: a "0 %" tells nothing new.
  if (current.plannedDays > 0 && current.mainDays > 0) {
    insights.push({ kind: 'main', done: current.mainDays, total: current.plannedDays });
  }
  if (current.planned > 0 && current.completed > 0) {
    insights.push({
      kind: 'completed',
      percent: Math.round((current.completed * 100) / current.planned),
    });
  }
  return insights;
}
