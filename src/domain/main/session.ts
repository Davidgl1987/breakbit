import { isOpen } from '../pause/window';
import type { Instant, ScheduledActivity } from '../types';

/**
 * The main activity's session. Its time lives on the activity itself, so it survives
 * leaving the screen or closing the app: `accumulatedSec` holds what earlier runs added
 * up to, and `runningSince` marks the run under way.
 * - continuous (a 20 min walk): one go; pausing is just a stop on the way;
 * - accumulated (30 min standing): blocks that add up through the day.
 * Either way it is done once the time adds up, or earlier when the user says so: the
 * app trusts them. It never expires during the day.
 */

/** Time done so far, up to the activity's length. */
export function mainElapsedSec(item: ScheduledActivity, now: Instant): number {
  const running = item.runningSince === undefined ? 0 : Math.max(0, now - item.runningSince) / 1000;
  return Math.min(item.durationSec, (item.accumulatedSec ?? 0) + running);
}

export function isMainRunning(item: ScheduledActivity): boolean {
  return item.runningSince !== undefined;
}

/** When the run under way makes the time add up; none while paused. */
export function mainEndsAt(item: ScheduledActivity): Instant | undefined {
  if (item.runningSince === undefined) return undefined;
  return item.runningSince + Math.max(0, item.durationSec - (item.accumulatedSec ?? 0)) * 1000;
}

/**
 * Starts, resumes, or begins another block. The first start also moves the activity to
 * the time it really happens, so the pauses around it can keep their distance.
 */
export function startMain(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (item.kind !== 'main' || !isOpen(item) || item.runningSince !== undefined) return item;
  if (item.startedAt !== undefined) return { ...item, runningSince: now };
  return { ...item, startedAt: now, currentScheduledAt: now, runningSince: now };
}

/** Pauses the run (continuous) or ends the block (accumulated), keeping the time done. */
export function pauseMain(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (item.kind !== 'main' || !isOpen(item) || item.runningSince === undefined) return item;
  return {
    ...item,
    accumulatedSec: Math.round(mainElapsedSec(item, now)),
    runningSince: undefined,
  };
}

/**
 * Done: when the time adds up, or earlier when the user says so. A run that went past
 * the end finishes when the time added up. Without a session ("Ya la he hecho") it
 * counts with its planned time.
 */
export function completeMain(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (item.kind !== 'main' || !isOpen(item)) return item;
  const end = mainEndsAt(item);
  const completedAt = end !== undefined && end < now ? end : now;
  const elapsedSec =
    item.startedAt === undefined ? item.durationSec : Math.round(mainElapsedSec(item, completedAt));
  return { ...item, status: 'completed', completedAt, elapsedSec, runningSince: undefined };
}

/** A shorter take before starting ("versión corta"), down to `minutes`; never longer. */
export function shortenMain(item: ScheduledActivity, minutes: number): ScheduledActivity {
  if (item.kind !== 'main' || !isOpen(item) || item.startedAt !== undefined) return item;
  const durationSec = minutes * 60;
  return durationSec < item.durationSec ? { ...item, durationSec } : item;
}

/** A run whose time has added up is done; the engine checks on every tick. */
export function advanceMain(item: ScheduledActivity, now: Instant): ScheduledActivity {
  const end = mainEndsAt(item);
  return end !== undefined && now >= end ? completeMain(item, now) : item;
}
