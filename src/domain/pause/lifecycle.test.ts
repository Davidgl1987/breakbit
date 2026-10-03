import { describe, expect, it } from 'vitest';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ScheduledActivity } from '../types';
import { discard, discardPenalty, markNotificationOpened, postpone, start } from './lifecycle';
import { consumedMinutes, ignoredMinutes, isDue, postponeOptions, windowEnd } from './window';

const DATE = '2026-10-05';
const MIN = 60_000;
const AT = atTime(DATE, '10:00');
const pause = (patch: Partial<ScheduledActivity> = {}): ScheduledActivity => ({
  ...createActivity({
    id: `${DATE}:p0`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
    slot: 'work',
    durationSec: 40,
    at: AT,
  }),
  status: 'notification_sent',
  notificationSentAt: AT,
  ...patch,
});

describe('pause window', () => {
  it('lasts 30 minutes from the original time, with no grace', () => {
    expect(windowEnd(pause())).toBe(AT + 30 * MIN);
    expect(isDue(pause(), AT + 29 * MIN)).toBe(true);
    expect(isDue(pause(), AT + 30 * MIN)).toBe(false);
    expect(isDue(pause({ status: 'pending' }), AT - MIN)).toBe(false);
  });

  it('offers only the postpones that still fit', () => {
    expect(postponeOptions(pause(), AT)).toEqual([5, 10, 15]);
    expect(postponeOptions(pause(), AT + 14 * MIN)).toEqual([5, 10, 15]);
    expect(postponeOptions(pause(), AT + 16 * MIN)).toEqual([5, 10]);
    expect(postponeOptions(pause(), AT + 26 * MIN)).toEqual([]);
    expect(postponeOptions(pause({ startedAt: AT }), AT)).toEqual([]);
  });

  it('splits consumed time into postponed and ignored', () => {
    const postponed = postpone(pause(), 10, AT + 3 * MIN);
    expect(consumedMinutes(postponed, AT + 20 * MIN)).toBe(20);
    expect(ignoredMinutes(postponed, AT + 20 * MIN)).toBe(10);
    expect(consumedMinutes(pause(), AT + 45 * MIN)).toBe(30);
  });
});

describe('pause lifecycle', () => {
  it('postpones from now, within the same window', () => {
    const postponed = postpone(pause(), 10, AT + 3 * MIN);
    expect(postponed).toMatchObject({
      status: 'postponed',
      currentScheduledAt: AT + 13 * MIN,
      scheduledAt: AT,
      postponeMinutes: 10,
      postponeCount: 1,
    });
    // An option that no longer fits changes nothing.
    expect(postpone(pause(), 15, AT + 20 * MIN)).toEqual(pause());
  });

  it('starts with "Vamos", a la primera only without postpones or reminders', () => {
    expect(start(pause(), AT + MIN)).toMatchObject({ startedAt: AT + MIN, firstPrompt: true });
    expect(start(pause({ remindersSent: 1 }), AT + 11 * MIN).firstPrompt).toBe(false);
    const postponed = postpone(pause(), 5, AT);
    expect(start(postponed, AT + 6 * MIN).firstPrompt).toBe(false);
    // Too late, or already started: nothing changes.
    expect(start(pause(), AT + 30 * MIN)).toEqual(pause());
    const started = start(pause(), AT);
    expect(start(started, AT + MIN)).toBe(started);
  });

  it('discards with an optional reason and a −50 XP penalty counted once', () => {
    expect(discard(pause(), 'meeting')).toMatchObject({ status: 'skipped', skipReason: 'meeting' });
    expect(discard(pause({ startedAt: AT }))).toMatchObject({ status: 'notification_sent' });
    expect(discardPenalty(pause(), AT)).toEqual({
      key: `discard:${DATE}:p0`,
      amount: -50,
      at: AT,
      date: DATE,
      reason: 'discard',
    });
  });

  it('records a notification open only while the pause is due', () => {
    expect(markNotificationOpened(pause(), AT + MIN).notificationOpenedAt).toBe(AT + MIN);
    expect(
      markNotificationOpened(pause({ status: 'pending' }), AT - MIN).notificationOpenedAt,
    ).toBeUndefined();
  });

  it('keeps explicit postpones apart from time left unanswered', () => {
    // Notified at 10:00, ignored for 3 min, postponed +10, notified again at 10:13 and
    // ignored until 10:20: 10 min postponed, 10 ignored.
    const postponed = postpone(pause(), 10, AT + 3 * MIN);
    expect(postponed.postponeMinutes).toBe(10);
    expect(ignoredMinutes(postponed, AT + 20 * MIN)).toBe(10);
    // Never answered at all: everything is ignored, nothing postponed.
    expect(pause().postponeMinutes).toBe(0);
    expect(ignoredMinutes(pause(), AT + 25 * MIN)).toBe(25);
  });
});
