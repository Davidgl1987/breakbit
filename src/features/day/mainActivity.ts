import { CATALOG } from '@/content/catalog';
import { buildTimeline, contains } from '@/domain/planner/timeline';
import { minutesOfDay } from '@/domain/time';
import type { DayPlan, MainActivity, ScheduledActivity } from '@/domain/types';

/** The catalog entry behind a planned main activity. */
export function mainActivityInfo(item: ScheduledActivity): MainActivity | undefined {
  const activityId = item.content.kind === 'main' ? item.content.activityId : undefined;
  return CATALOG.mainActivities.find((activity) => activity.id === activityId);
}

/** Where it falls: its slot, or lunch (which has no slot of its own). */
export function mainWhere(
  plan: DayPlan,
  item: ScheduledActivity,
): 'work' | 'break' | 'meeting' | 'lunch' {
  const lunch = buildTimeline(plan.schedule, plan.meetings).lunch;
  return lunch && contains(lunch, minutesOfDay(item.currentScheduledAt)) ? 'lunch' : item.slot;
}
