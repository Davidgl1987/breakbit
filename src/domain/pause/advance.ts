import { PAUSE_WINDOW } from '../config';
import {
  choosePauseContent,
  contentExerciseIds,
  type ContentContext,
} from '../planner/pauseContent';
import { rebalance } from '../planner/rebalance';
import { pauseTypeForDuration } from '../planner/selectExercise';
import { advanceMain } from '../main/session';
import { createRng } from '../rng';
import type { DayPlan, Instant, ScheduledActivity } from '../types';
import { isOpen, windowEnd } from './window';

const MINUTE = 60_000;

export type PauseEventType =
  'notification_sent' | 'exercise_ignored' | 'exercise_missed' | 'main_activity_completed';

export interface PauseEvent {
  type: PauseEventType;
  activityId: string;
  at: Instant;
}

export interface AdvanceResult {
  plan: DayPlan;
  /** What happened since the last call (empty when nothing changed). */
  events: PauseEvent[];
}

/**
 * Moves a day's microbreaks forward to `now`. It depends only on time, not on whether a
 * notification was actually delivered, so it works the same with local or push reminders.
 * Idempotent: calling it again with the same `now` changes nothing.
 * - its time has come → notification_sent (again after a postpone);
 * - every 10 min without an answer → a reminder (counted as ignored); opening the
 *   screen is not an answer, only "Vamos", postponing or discarding are;
 * - 30 min after its original time without "Vamos" → missed. The next pause may then
 *   come up to 10 min earlier and become a fuller reset; the missed one still counts.
 * The main activity never expires: a run under way is completed once its time adds up,
 * and the pauses right after it move later.
 */
export function advanceDay(plan: DayPlan, now: Instant, context: ContentContext): AdvanceResult {
  const events: PauseEvent[] = [];
  let missed = false;
  let mainDone = false;

  const activities = plan.activities.map((item) => {
    if (item.kind === 'main') {
      const next = advanceMain(item, now);
      if (next !== item) {
        events.push({
          type: 'main_activity_completed',
          activityId: item.id,
          at: next.completedAt ?? now,
        });
        mainDone = true;
      }
      return next;
    }
    if (!isOpen(item) || item.startedAt !== undefined) return item;
    const end = windowEnd(item);
    if (now >= end) {
      events.push({ type: 'exercise_missed', activityId: item.id, at: end });
      missed = true;
      return { ...item, status: 'missed' as const, missReason: 'window_expired' as const };
    }
    if (now < item.currentScheduledAt) return item;

    let next = item;
    if (item.status !== 'notification_sent') {
      next = {
        ...item,
        status: 'notification_sent',
        notificationSentAt: item.currentScheduledAt,
        remindersSent: 0,
      };
      events.push({ type: 'notification_sent', activityId: item.id, at: item.currentScheduledAt });
    }
    const reminders = remindersDue(next, now);
    if (reminders > next.remindersSent) {
      for (let k = next.remindersSent + 1; k <= reminders; k++) {
        events.push({ type: 'exercise_ignored', activityId: item.id, at: reminderAt(next, k) });
      }
      next = { ...next, remindersSent: reminders };
    }
    return next;
  });

  if (events.length === 0) return { plan, events };
  const advanced = { ...plan, activities };
  if (!missed && !mainDone) return { plan: advanced, events };
  const upgraded = missed ? upgradeNextPause(advanced, now, context) : advanced;
  return { plan: rebalance(upgraded, now, context), events };
}

/**
 * Reminders that have come up for the current notification. Only an answer stops them
 * ("Vamos", a postpone or discarding): just opening the screen doesn't.
 */
function remindersDue(item: ScheduledActivity, now: Instant): number {
  if (item.notificationSentAt === undefined) return 0;
  let count = 0;
  while (reminderAt(item, count + 1) <= now && reminderAt(item, count + 1) < windowEnd(item)) {
    count++;
  }
  return count;
}

function reminderAt(item: ScheduledActivity, k: number): Instant {
  return (
    (item.notificationSentAt ?? item.currentScheduledAt) +
    k * PAUSE_WINDOW.reminderEveryMin * MINUTE
  );
}

/**
 * After a missed pause, the next single-move pause in work time becomes a combined reset
 * (2–4 movements), with new content kept varied and reproducible.
 */
function upgradeNextPause(plan: DayPlan, now: Instant, context: ContentContext): DayPlan {
  const target = plan.activities
    .filter(
      (item) =>
        item.kind === 'micro' &&
        item.origin === 'plan' &&
        item.status === 'pending' &&
        item.currentScheduledAt > now &&
        item.slot === 'work' &&
        item.pauseType === 'micro',
    )
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)[0];
  if (!target) return plan;

  const others = plan.activities.filter((item) => item.kind === 'micro' && item.id !== target.id);
  const previous = others
    .filter((item) => item.currentScheduledAt < target.currentScheduledAt)
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)
    .at(-1);
  const chosen = choosePauseContent(
    'combined',
    'work',
    context,
    {
      previousExerciseIds: previous ? contentExerciseIds(previous.content, context.catalog) : [],
      recentExerciseIds: others.flatMap((item) =>
        contentExerciseIds(item.content, context.catalog),
      ),
      usedRoutineIds: [],
    },
    createRng(`${plan.date}#${plan.rerollCount}#${target.id}@upgrade`),
  );
  if (!chosen || chosen.durationSec <= target.durationSec) return plan;
  const upgraded: ScheduledActivity = {
    ...target,
    content: chosen.content,
    durationSec: chosen.durationSec,
    pauseType: pauseTypeForDuration(chosen.durationSec),
  };
  return {
    ...plan,
    activities: plan.activities.map((item) => (item.id === target.id ? upgraded : item)),
  };
}
