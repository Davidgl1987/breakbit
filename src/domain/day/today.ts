import { isDue, isOpen, windowEnd } from '../pause/window';
import { contentExerciseIds } from '../planner/pauseContent';
import { atTime } from '../time';
import type {
  Catalog,
  DateKey,
  DayOverride,
  DayPlan,
  DayRecord,
  DaySchedule,
  EquipmentId,
  Instant,
  ScheduledActivity,
} from '../types';

/**
 * What today is, for the Today screen:
 * - rest: not a workday.
 * - day_off: "Hoy no trabajo".
 * - not_started: a workday whose plan hasn't been made yet (`late` once its hours are over).
 * - active: the day is under way (`over` once its hours are over, before closing it).
 * - closed: the day has been summarised.
 */
export type TodayState =
  | { kind: 'rest' }
  | { kind: 'day_off' }
  | { kind: 'not_started'; schedule: DaySchedule; late: boolean }
  | { kind: 'active'; plan: DayPlan; over: boolean }
  | { kind: 'closed' };

export interface TodayInput {
  date: DateKey;
  now: Instant;
  record?: DayRecord;
  override?: DayOverride;
  /** Today's hours from the calendar, or null if it is not a workday. */
  schedule: DaySchedule | null;
}

export function todayState({ date, now, record, override, schedule }: TodayInput): TodayState {
  if (record?.status === 'closed') return { kind: 'closed' };
  if (record?.status === 'day_off' || override?.working === false) return { kind: 'day_off' };
  if (record?.status === 'active' && record.plan) {
    return { kind: 'active', plan: record.plan, over: now >= workEnd(record.plan) };
  }
  if (!schedule) return { kind: 'rest' };
  return { kind: 'not_started', schedule, late: now >= atTime(date, schedule.workEnd) };
}

/** When today's work ends. */
export function workEnd(plan: DayPlan): Instant {
  return atTime(plan.date, plan.schedule.workEnd);
}

/**
 * The pause to show as "next", in this order: one waiting for an answer, one under way
 * (started and not finished), or the earliest still to come while its window is open.
 */
export function nextPause(plan: DayPlan, now: Instant): ScheduledActivity | undefined {
  const open = plan.activities
    .filter((item) => item.kind === 'micro' && isOpen(item))
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt);
  return (
    open.find((item) => isDue(item, now)) ??
    open.findLast((item) => item.startedAt !== undefined) ??
    open.find((item) => item.startedAt === undefined && now < windowEnd(item))
  );
}

export function mainActivityOf(plan: DayPlan): ScheduledActivity | undefined {
  return plan.activities.find((item) => item.kind === 'main');
}

/** Equipment the day's plan actually uses ("A mano hoy"), in catalog order. */
export function equipmentInPlan(plan: DayPlan, catalog: Catalog): EquipmentId[] {
  const used = new Set<EquipmentId>();
  for (const item of plan.activities) {
    if (item.content.kind === 'main') {
      const activityId = item.content.activityId;
      const activity = catalog.mainActivities.find((entry) => entry.id === activityId);
      activity?.equipment.forEach((id) => used.add(id));
      continue;
    }
    for (const exerciseId of contentExerciseIds(item.content, catalog)) {
      const exercise = catalog.exercises.find((entry) => entry.id === exerciseId);
      exercise?.equipment.forEach((id) => used.add(id));
    }
  }
  return catalog.equipment.map((item) => item.id).filter((id) => used.has(id));
}
