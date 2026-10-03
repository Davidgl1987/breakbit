import { byScheduledAt, createActivity } from '../planner/activities';
import { generateDayPlan, type PlanInput } from '../planner/generateDayPlan';
import { placeChosenMainActivity, type MainActivityChoice } from '../planner/placeMainActivity';
import { contentExerciseIds, type ContentContext } from '../planner/pauseContent';
import { rebalance } from '../planner/rebalance';
import { hasEquipment } from '../planner/selectExercise';
import { buildTimeline } from '../planner/timeline';
import { addDays, atMinutes, fromMinutes, minutesOfDay, toMinutes } from '../time';
import type {
  Catalog,
  DateKey,
  DayPlan,
  DayRecord,
  DaySchedule,
  Instant,
  ScheduledActivity,
} from '../types';

/** How many previous days count as "recent" when rotating exercises. */
const RECENT_DAYS = 2;

export interface PlanDayRequest extends Omit<PlanInput, 'from'> {
  now: Instant;
  /**
   * Today's current plan, when re-planning a day already under way: what already
   * happened (or is happening) is kept, and only the rest of the day is planned again.
   */
  previous?: DayPlan;
}

/**
 * Plans the day from `now` on: the day-start proposal, and every later change to the
 * hours, meetings or main activity. Re-planning never rewrites the past: activities that
 * are done, under way, or already due stay as they are, and new pauses keep their
 * distance from them.
 */
export function planDay({ now, previous, ...input }: PlanDayRequest): DayPlan {
  const fresh = generateDayPlan({ ...input, from: now });
  if (!previous) return fresh;

  const kept = previous.activities.filter((item) => isSettled(item, now));
  if (kept.length === 0) return fresh;
  const keptMain = kept.some((item) => item.kind === 'main');
  const usedIds = new Set(kept.map((item) => item.id));
  const added = fresh.activities
    .filter((item) => !(item.kind === 'main' && keptMain))
    .map((item) => withFreeId(item, usedIds, input.date));

  const plan: DayPlan = {
    ...fresh,
    targetMicroCount: plannedMicros(kept) + fresh.targetMicroCount,
    activities: [...kept, ...added].sort(byScheduledAt),
  };
  return rebalance(plan, now, {
    catalog: input.catalog,
    discomfort: input.settings.discomfort,
    equipment: input.settings.equipment,
  });
}

/** Exercises planned on the last few days before `date`, so today rotates the catalog. */
export function recentExerciseIds(
  days: Partial<Record<DateKey, DayRecord>>,
  date: DateKey,
  catalog: Catalog,
): string[] {
  const ids: string[] = [];
  for (let offset = 1; offset <= RECENT_DAYS; offset++) {
    const plan = days[addDays(date, -offset)]?.plan;
    for (const item of plan?.activities ?? []) {
      if (item.kind === 'micro') ids.push(...contentExerciseIds(item.content, catalog));
    }
  }
  return ids;
}

/** Done, under way, extra/recovered, or already due: re-planning leaves it alone. */
function isSettled(item: ScheduledActivity, now: Instant): boolean {
  return (
    item.origin !== 'plan' ||
    item.status !== 'pending' ||
    item.startedAt !== undefined ||
    item.currentScheduledAt <= now
  );
}

function plannedMicros(items: readonly ScheduledActivity[]): number {
  return items.filter((item) => item.kind === 'micro' && item.origin === 'plan').length;
}

/** Fresh pauses are numbered from 0 again; give them ids the kept ones don't use. */
function withFreeId(item: ScheduledActivity, used: Set<string>, date: DateKey): ScheduledActivity {
  let id = item.id;
  for (let n = 0; used.has(id); n++) id = `${date}:p${n}`;
  used.add(id);
  return id === item.id ? item : { ...item, id };
}

/** The main activity as a choice, to keep it as it is when the rest of the day changes. */
export function mainChoiceOf(plan: DayPlan): MainActivityChoice | undefined {
  const main = plan.activities.find((item) => item.kind === 'main');
  if (main?.content.kind !== 'main') return undefined;
  return {
    activityId: main.content.activityId,
    start: fromMinutes(minutesOfDay(main.currentScheduledAt)),
    durationMin: Math.round(main.durationSec / 60),
  };
}

/**
 * "Cambiar actividad" once the day is under way: only the main activity changes, and
 * pauses that now clash with it move later. A main activity already started or done
 * can't be swapped.
 */
export function changeMainActivity(
  plan: DayPlan,
  choice: MainActivityChoice,
  now: Instant,
  context: ContentContext,
): DayPlan {
  const current = plan.activities.find((item) => item.kind === 'main');
  if (current && (current.status !== 'pending' || current.startedAt !== undefined)) return plan;
  const timeline = buildTimeline(plan.schedule, plan.meetings);
  const placement = placeChosenMainActivity(timeline, context.catalog.mainActivities, choice);
  if (!placement) return plan;

  const main = createActivity({
    id: current?.id ?? `${plan.date}:main`,
    kind: 'main',
    content: { kind: 'main', activityId: placement.activity.id },
    slot: placement.slot,
    durationSec: placement.durationMin * 60,
    completionMode: placement.activity.completionMode,
    at: atMinutes(plan.date, placement.start),
  });
  const activities = [...plan.activities.filter((item) => item !== current), main].sort(
    byScheduledAt,
  );
  return rebalance({ ...plan, activities }, now, context);
}

/** Whether a chosen main activity still fits inside the day's hours. */
export function choiceFits(choice: MainActivityChoice, schedule: DaySchedule): boolean {
  const start = toMinutes(choice.start);
  return (
    start >= toMinutes(schedule.workStart) &&
    start + choice.durationMin <= toMinutes(schedule.workEnd)
  );
}

/**
 * Re-plans the rest of a day under way after the user changed their settings (discomfort,
 * equipment, pace): what's done or under way stays, the hours and meetings stay, and the
 * main activity stays unless its equipment is no longer available.
 */
export function replanDay(
  plan: DayPlan,
  {
    settings,
    catalog,
    now,
    recentExerciseIds,
  }: Pick<PlanDayRequest, 'settings' | 'catalog' | 'now' | 'recentExerciseIds'>,
): DayPlan {
  const main = mainChoiceOf(plan);
  const activityId = main?.activityId;
  const activity = catalog.mainActivities.find((item) => item.id === activityId);
  const keepMain = activity !== undefined && hasEquipment(activity.equipment, settings.equipment);
  return planDay({
    date: plan.date,
    schedule: plan.schedule,
    meetings: plan.meetings,
    settings,
    catalog,
    rerollCount: plan.rerollCount,
    recentExerciseIds,
    ...(keepMain && main && { mainActivity: main }),
    now,
    previous: plan,
  });
}
