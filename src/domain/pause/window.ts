import { PAUSE_WINDOW } from '../config';
import type { Instant, ScheduledActivity } from '../types';

const MINUTE = 60_000;

/**
 * A microbreak's window: 30 minutes from its original time, with no grace. Postponing
 * and ignoring both consume it; once it is over without a "Vamos", the pause is missed.
 */
export function windowEnd(item: ScheduledActivity): Instant {
  return item.scheduledAt + PAUSE_WINDOW.validityMin * MINUTE;
}

/** Still to be done or decided: not completed, discarded or missed. */
export function isOpen(item: ScheduledActivity): boolean {
  return (
    item.status === 'pending' || item.status === 'notification_sent' || item.status === 'postponed'
  );
}

/** Due now: its (possibly postponed) time has come, it hasn't started and can still be done. */
export function isDue(item: ScheduledActivity, now: Instant): boolean {
  return (
    item.kind === 'micro' &&
    isOpen(item) &&
    item.startedAt === undefined &&
    now >= item.currentScheduledAt &&
    now < windowEnd(item)
  );
}

/**
 * Waiting for the user's answer: due now, or postponed and not back yet. Either way
 * "Vamos" (or discarding) is still on offer until the window closes.
 */
export function isAwaitingAnswer(item: ScheduledActivity, now: Instant): boolean {
  return (
    item.kind === 'micro' &&
    isOpen(item) &&
    item.startedAt === undefined &&
    now < windowEnd(item) &&
    (now >= item.currentScheduledAt || item.status === 'postponed')
  );
}

/** Minutes of the window already used, postponed or ignored ("Llevas X min aplazados"). */
export function consumedMinutes(item: ScheduledActivity, now: Instant): number {
  const minutes = Math.floor((now - item.scheduledAt) / MINUTE);
  return Math.min(Math.max(minutes, 0), PAUSE_WINDOW.validityMin);
}

/** Of the time consumed, what went by without any answer (for metrics). */
export function ignoredMinutes(item: ScheduledActivity, now: Instant): number {
  return Math.max(consumedMinutes(item, now) - item.postponeMinutes, 0);
}

/**
 * The postpone options (+5/+10/+15) that still fit: the pause must come back before its
 * window closes, so there is still time to say "Vamos".
 */
export function postponeOptions(item: ScheduledActivity, now: Instant): number[] {
  if (!isDue(item, now)) return [];
  return PAUSE_WINDOW.postponeOptionsMin.filter(
    (minutes) => now + minutes * MINUTE < windowEnd(item),
  );
}
