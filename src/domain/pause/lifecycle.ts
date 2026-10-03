import { XP } from '../config';
import { toDateKey } from '../time';
import type { Instant, ScheduledActivity, SkipReason, XpEntry } from '../types';
import { isDue, isOpen, postponeOptions, windowEnd } from './window';

const MINUTE = 60_000;

/**
 * The user's answers to a microbreak. Pure: each returns the updated activity, or the
 * same object when the action no longer applies (so a double tap changes nothing).
 */

/**
 * A notification was opened (for metrics). Not an answer: reminders go on until the user
 * says "Vamos", postpones or discards.
 */
export function markNotificationOpened(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (!isDue(item, now)) return item;
  return { ...item, notificationOpenedAt: now };
}

/** +5 / +10 / +15: only while it fits in the window. Postponing costs nothing if done later. */
export function postpone(
  item: ScheduledActivity,
  minutes: number,
  now: Instant,
): ScheduledActivity {
  if (!postponeOptions(item, now).includes(minutes)) return item;
  return {
    ...item,
    status: 'postponed',
    currentScheduledAt: now + minutes * MINUTE,
    postponeMinutes: item.postponeMinutes + minutes,
    postponeCount: item.postponeCount + 1,
    remindersSent: 0,
  };
}

/**
 * "Vamos": the pause starts and can be finished later, even after its window. It counts
 * as "a la primera" when it was never postponed and no reminder was needed.
 */
export function start(item: ScheduledActivity, now: Instant): ScheduledActivity {
  if (item.kind !== 'micro' || !isOpen(item) || item.startedAt !== undefined) return item;
  if (now >= windowEnd(item)) return item;
  return {
    ...item,
    startedAt: now,
    firstPrompt: item.postponeCount === 0 && item.remindersSent === 0,
  };
}

/**
 * The exercise was finished. Only a pause that was started can be completed; it may be
 * finished after its window, since "Vamos" came in time.
 */
export function complete(
  item: ScheduledActivity,
  now: Instant,
  elapsedSec: number,
): ScheduledActivity {
  if (item.kind !== 'micro' || !isOpen(item) || item.startedAt === undefined) return item;
  return {
    ...item,
    status: 'completed',
    completedAt: now,
    elapsedSec: Math.max(0, Math.round(elapsedSec)),
  };
}

/** "Descartar pausa": skipped for good, with an optional reason. */
export function discard(item: ScheduledActivity, reason?: SkipReason): ScheduledActivity {
  if (item.kind !== 'micro' || !isOpen(item) || item.startedAt !== undefined) return item;
  return { ...item, status: 'skipped', ...(reason && { skipReason: reason }) };
}

/** The XP penalty for discarding; its key makes it count once. */
export function discardPenalty(item: ScheduledActivity, now: Instant): XpEntry {
  return {
    key: `discard:${item.id}`,
    amount: XP.discard,
    at: now,
    date: toDateKey(item.scheduledAt),
    reason: 'discard',
  };
}
