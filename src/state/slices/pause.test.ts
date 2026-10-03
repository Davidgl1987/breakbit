import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import type { DateKey, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { clearEvents, readEvents } from '@/services/eventLog';
import { useAppStore } from '../store';

const DATE: DateKey = '2026-10-05';
const MIN = 60_000;
const store = () => useAppStore.getState();
const plan = generateDayPlan({
  date: DATE,
  schedule: DEFAULT_SETTINGS.schedule,
  settings: DEFAULT_SETTINGS,
  catalog: CATALOG,
});
const micros = plan.activities.filter((item) => item.kind === 'micro');
const first = micros[0]!;
const second = micros[1]!;
const activity = (id = first.id): ScheduledActivity =>
  store().days[DATE]!.plan!.activities.find((item) => item.id === id)!;
const at = (instant: number) => clock.travelTo(instant);
const eventTypes = async () => (await readEvents()).map((event) => event.type);
/** Real time keeps running during a test: instants are compared to the second. */
const near = (expected: number) => ({
  asymmetricMatch: (actual: unknown) =>
    typeof actual === 'number' && Math.abs(actual - expected) < 1000,
  toString: () => `near ${expected}`,
});
/** Events are written in the background. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(async () => {
  await clearEvents();
  store().completeOnboarding(DEFAULT_SETTINGS);
  store().startDay(plan);
});
afterEach(() => clock.setOffset(0));

describe('pause actions', () => {
  it('reconciles the day with the clock and logs what happened', async () => {
    store().reconcile(first.scheduledAt + 11 * MIN);
    expect(activity()).toMatchObject({ status: 'notification_sent', remindersSent: 1 });
    store().reconcile(first.scheduledAt + 31 * MIN);
    expect(activity()).toMatchObject({ status: 'missed' });
    await settle();
    expect(await eventTypes()).toEqual([
      'notification_sent',
      'exercise_ignored',
      'exercise_missed',
    ]);
  });

  it('postpones and moves later pauses that come too close', async () => {
    store().reconcile(first.scheduledAt);
    at(first.scheduledAt + 2 * MIN);
    store().notificationOpened(DATE, first.id);
    store().postponePause(DATE, first.id, 15);
    expect(activity()).toMatchObject({
      status: 'postponed',
      currentScheduledAt: near(first.scheduledAt + 17 * MIN),
      postponeCount: 1,
    });
    expect(activity(second.id).currentScheduledAt).toBeGreaterThanOrEqual(
      first.scheduledAt + (17 + 35) * MIN,
    );
    await settle();
    expect((await eventTypes()).sort()).toEqual([
      'exercise_postponed',
      'notification_opened',
      'notification_sent',
    ]);
  });

  it('keeps reminding after a notification is opened and nothing is done', async () => {
    store().reconcile(first.scheduledAt);
    at(first.scheduledAt + 2 * MIN);
    store().notificationOpened(DATE, first.id);
    store().reconcile(first.scheduledAt + 11 * MIN);
    expect(activity()).toMatchObject({ status: 'notification_sent', remindersSent: 1 });
    await settle();
    expect((await eventTypes()).sort()).toEqual([
      'exercise_ignored',
      'notification_opened',
      'notification_sent',
    ]);
  });

  it('starts a pause with "Vamos"', async () => {
    store().reconcile(first.scheduledAt);
    at(first.scheduledAt + MIN);
    store().startPause(DATE, first.id);
    expect(activity()).toMatchObject({
      startedAt: near(first.scheduledAt + MIN),
      firstPrompt: true,
    });
    await settle();
    expect(await eventTypes()).toContain('exercise_started');
  });

  it('discards a pause with a reason and a −50 XP penalty, once', async () => {
    store().reconcile(first.scheduledAt);
    at(first.scheduledAt + MIN);
    store().discardPause(DATE, first.id, 'meeting');
    store().discardPause(DATE, first.id, 'meeting');
    expect(activity()).toMatchObject({ status: 'skipped', skipReason: 'meeting' });
    expect(store().xpLedger).toEqual([
      expect.objectContaining({ key: `discard:${first.id}`, amount: -50, reason: 'discard' }),
    ]);
    await settle();
    expect((await eventTypes()).filter((type) => type === 'exercise_skipped')).toHaveLength(1);
  });

  it('ignores answers to pauses that are no longer open', () => {
    store().reconcile(first.scheduledAt + 31 * MIN);
    at(first.scheduledAt + 32 * MIN);
    const before = store().days[DATE];
    store().startPause(DATE, first.id);
    store().postponePause(DATE, first.id, 5);
    expect(store().days[DATE]).toBe(before);
  });
});

describe('completing a pause', () => {
  beforeEach(async () => {
    await clearEvents();
  });

  it('records it as done, with its XP once and its events', async () => {
    store().reconcile(first.scheduledAt);
    at(first.scheduledAt + MIN);
    store().startPause(DATE, first.id);
    at(first.scheduledAt + 2 * MIN);
    store().completePause(DATE, first.id, 41);
    store().completePause(DATE, first.id, 41);

    expect(activity()).toMatchObject({ status: 'completed', elapsedSec: 41 });
    expect(store().xpLedger.map((entry) => [entry.reason, entry.amount])).toEqual([
      ['microbreak', 100],
      ['first_prompt', 20],
    ]);
    await settle();
    const types = await eventTypes();
    expect(types.filter((type) => type === 'exercise_completed')).toHaveLength(1);
    expect(types).toContain('exercise_completed_first_prompt');
  });

  it('does not complete a pause that was never started', () => {
    store().reconcile(first.scheduledAt);
    store().completePause(DATE, first.id, 40);
    expect(activity().status).toBe('notification_sent');
    expect(store().xpLedger).toEqual([]);
  });
});
