import { CATALOG } from '@/content/catalog';
import { buildTimeline, contains } from '@/domain/planner/timeline';
import { minutesOfDay } from '@/domain/time';
import type { DayPlan, Exercise, MainActivity, ScheduledActivity } from '@/domain/types';
import { contentItems } from './contentItems';

/** The catalog entry behind a planned main activity. */
export function mainActivityInfo(item: ScheduledActivity): MainActivity | undefined {
  const activityId = item.content.kind === 'main' ? item.content.activityId : undefined;
  return CATALOG.mainActivities.find((activity) => activity.id === activityId);
}

/** The moves of its guided routine, in order (none for a walk or standing work). */
export function mainActivityMoves(activity: MainActivity): Exercise[] {
  return activity.routine
    ? contentItems({ kind: 'routine', routineId: activity.routine }).map((item) => item.exercise)
    : [];
}

/** Where it falls: its slot, or lunch (which has no slot of its own). */
export function mainWhere(
  plan: DayPlan,
  item: ScheduledActivity,
): 'work' | 'break' | 'meeting' | 'lunch' {
  const lunch = buildTimeline(plan.schedule, plan.meetings).lunch;
  return lunch && contains(lunch, minutesOfDay(item.currentScheduledAt)) ? 'lunch' : item.slot;
}
