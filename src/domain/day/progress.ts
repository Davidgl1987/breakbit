import { GOALS } from '../config';
import type { Catalog, DayPlan, ScheduledActivity } from '../types';

export interface DayProgress {
  /** Planned microbreaks (the goal's denominator; missed and recovered ones included). */
  planned: number;
  /** Planned microbreaks done, recovered ones included ("Tengo un hueco" extras are not). */
  completed: number;
  extras: number;
  hasMain: boolean;
  mainCompleted: boolean;
  /** Time actually moved today. */
  movementSec: number;
  /** Time actually away from work: pauses in breaks or "puedo moverme" meetings, and main
   * activities done while working, don't count. */
  interruptionSec: number;
  /** ≥70 % of planned microbreaks and the main activity (when there is one). */
  isGood: boolean;
  /** Every planned microbreak and the main activity. */
  isPerfect: boolean;
}

/** How the day is going so far. Also what the end-of-day summary is built from. */
export function dayProgress(plan: DayPlan, catalog: Catalog): DayProgress {
  const micros = plan.activities.filter((item) => item.kind === 'micro');
  // A recovered pause was planned too: only "Tengo un hueco" extras are outside the goal.
  const planned = micros.filter((item) => item.origin !== 'gap').length;
  const completed = micros.filter(
    (item) => item.status === 'completed' && item.origin !== 'gap',
  ).length;
  const extras = micros.filter(
    (item) => item.status === 'completed' && item.origin === 'gap',
  ).length;
  const main = plan.activities.find((item) => item.kind === 'main');
  const mainCompleted = main?.status === 'completed';

  const done = plan.activities.filter((item) => item.status === 'completed');
  const interrupts = (item: ScheduledActivity) => {
    if (item.slot !== 'work') return false;
    if (item.kind === 'micro') return true;
    const activityId = item.content.kind === 'main' ? item.content.activityId : undefined;
    return !catalog.mainActivities.find((activity) => activity.id === activityId)?.whileWorking;
  };

  // Integer maths: 0.7 as a percentage, so 7/10 is exactly enough.
  const minPercent = Math.round(GOALS.goodDayMinRatio * 100);
  const enoughPauses = completed * 100 >= planned * minPercent;
  const mainDone = main === undefined || mainCompleted;
  // A day with nothing planned (started after hours) can't be good.
  const hasGoal = planned > 0 || main !== undefined;

  return {
    planned,
    completed,
    extras,
    hasMain: main !== undefined,
    mainCompleted,
    movementSec: sum(done),
    interruptionSec: sum(done.filter(interrupts)),
    isGood: hasGoal && enoughPauses && mainDone,
    isPerfect: hasGoal && completed >= planned && mainDone,
  };
}

function sum(items: readonly ScheduledActivity[]): number {
  return items.reduce((total, item) => total + (item.elapsedSec ?? item.durationSec), 0);
}
