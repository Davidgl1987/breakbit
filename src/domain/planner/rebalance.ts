import { DAY_END_LEAD_MIN, SPACING } from '../config';
import { createRng } from '../rng';
import { atMinutes, compareDateKeys, minutesOfDay, toDateKey } from '../time';
import type { DayPlan, Instant, ScheduledActivity } from '../types';
import { byScheduledAt } from './activities';
import {
  choosePauseContent,
  contentExerciseIds,
  isContentValidFor,
  replacementShape,
  type ContentContext,
} from './pauseContent';
import { PAUSE_RESERVE_MIN, resolvePauseTimes, type PauseRequest } from './resolve';
import { pauseTypeForDuration } from './selectExercise';
import { buildTimeline, slotAt, type Interval } from './timeline';
import { microbreakZones } from './zones';

/**
 * Re-plans the remaining microbreaks after something changed (a postpone, a missed or
 * early pause, a new meeting, a moved main activity).
 *
 * Only planned microbreaks that are still pending and in the future move; everything
 * else is fixed. Times are recomputed from the original plan plus the current state, so
 * calling it again with the same `now` changes nothing (idempotent):
 * - pauses keep their original time unless a rule pushes them later (spacing from the
 *   last movement, lunch, meetings, the main activity);
 * - after a missed pause, the next one may come up to 10 min earlier;
 * - after a pause done early, the next one is pulled in so the gap stays ≤ 90 min;
 * - a pause that no longer fits before the end of the day is missed ("no_room"):
 *   no debt is carried over;
 * - a pause that lands in another context (break, meeting, work) takes that slot, and
 *   gets new content only if its current content doesn't suit the new context.
 */
export function rebalance(plan: DayPlan, now: Instant, context: ContentContext): DayPlan {
  const timeline = buildTimeline(plan.schedule, plan.meetings);
  const toMinute = (instant: Instant) => minutesOfDay(instant);
  const earliest = startMinute(plan, now);

  const main = plan.activities.find((item) => item.kind === 'main' && item.status !== 'skipped');
  const zones = microbreakZones(timeline, main ? mainInterval(main) : undefined);

  const planned = plan.activities
    .filter((item) => item.kind === 'micro' && item.origin === 'plan')
    .sort(byScheduledAt);
  const isMovable = (item: ScheduledActivity) =>
    item.status === 'pending' && item.currentScheduledAt > now;
  const movable = planned.filter(isMovable);
  if (movable.length === 0) return plan;

  const anchors = planned
    .filter((item) => !isMovable(item))
    .map(movementAnchor)
    .filter((anchor): anchor is Instant => anchor !== undefined)
    .map(toMinute);

  const requests: PauseRequest[] = movable.map((item, index) => {
    let desired = toMinute(item.scheduledAt);
    if (index === 0) {
      const previous = planned[planned.indexOf(item) - 1];
      if (previous?.status === 'missed' && previous.missReason === 'window_expired') {
        desired -= SPACING.missedAdvanceMaxMin;
      }
      if (previous?.status === 'completed' && previous.completedAt !== undefined) {
        desired = Math.min(desired, toMinute(previous.completedAt) + SPACING.idealMaxGapMin);
      }
    }
    // The same reserve as when planning, so replacement content always fits.
    return {
      desired,
      durationMin: PAUSE_RESERVE_MIN,
      allowMoveMeetings: item.slot === 'meeting',
    };
  });

  const times = resolvePauseTimes(requests, {
    anchors,
    zones,
    minGap: SPACING.minGapAfterReplanMin,
    earliest,
    latestEnd: timeline.workEnd - DAY_END_LEAD_MIN,
  });

  let activities = plan.activities;
  let changed = false;
  const replace = (updated: ScheduledActivity) => {
    activities = activities.map((item) => (item.id === updated.id ? updated : item));
    changed = true;
  };

  movable.forEach((item, index) => {
    const time = times[index];
    if (time === null || time === undefined) {
      replace({ ...item, status: 'missed', missReason: 'no_room' });
      return;
    }
    const currentScheduledAt = atMinutes(plan.date, time);
    const slot = slotAt(timeline, time);
    if (currentScheduledAt === item.currentScheduledAt && slot === item.slot) return;

    const moved = { ...item, currentScheduledAt, slot };
    const needsNewContent = slot !== item.slot && !isContentValidFor(item.content, slot, context);
    replace(needsNewContent ? withContentFor(moved, activities, plan, context) : moved);
  });

  return changed ? { ...plan, activities } : plan;
}

/**
 * New content suited to the pause's (new) slot, kept varied against the rest of the
 * day. Seeded by pause and slot, so re-running gives the same content.
 */
function withContentFor(
  item: ScheduledActivity,
  activities: readonly ScheduledActivity[],
  plan: DayPlan,
  context: ContentContext,
): ScheduledActivity {
  const others = activities.filter((other) => other.kind === 'micro' && other.id !== item.id);
  const previous = others
    .filter(
      (other) =>
        other.status !== 'missed' &&
        other.status !== 'skipped' &&
        other.currentScheduledAt <= item.currentScheduledAt,
    )
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)
    .at(-1);
  const chosen = choosePauseContent(
    replacementShape(item.slot, item.durationSec),
    item.slot,
    context,
    {
      previousExerciseIds: previous ? contentExerciseIds(previous.content, context.catalog) : [],
      recentExerciseIds: others.flatMap((other) =>
        contentExerciseIds(other.content, context.catalog),
      ),
      usedRoutineIds: others.flatMap((other) =>
        other.content.kind === 'routine' ? [other.content.routineId] : [],
      ),
    },
    createRng(`${plan.date}#${plan.rerollCount}#${item.id}@${item.slot}`),
  );
  if (!chosen) return item;
  return {
    ...item,
    content: chosen.content,
    durationSec: chosen.durationSec,
    pauseType: pauseTypeForDuration(chosen.durationSec),
  };
}

/** When the user last moved (or will move) for a fixed planned microbreak. */
function movementAnchor(item: ScheduledActivity): Instant | undefined {
  if (item.status === 'completed') return item.completedAt ?? item.currentScheduledAt;
  if (item.status === 'skipped' || item.status === 'missed') return undefined;
  return item.startedAt ?? item.currentScheduledAt;
}

function mainInterval(main: ScheduledActivity): Interval {
  const durationMin = Math.ceil(main.durationSec / 60);
  const end =
    main.status === 'completed' && main.completedAt !== undefined
      ? minutesOfDay(main.completedAt)
      : minutesOfDay(main.currentScheduledAt) + durationMin;
  return { start: end - durationMin, end };
}

/**
 * Pauses can only move to the future: from the next minute after `now`, or from the
 * start of the day when re-planning a future day. (A past day has nothing movable.)
 */
function startMinute(plan: DayPlan, now: Instant): number {
  return compareDateKeys(toDateKey(now), plan.date) < 0 ? 0 : minutesOfDay(now) + 1;
}
