import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { atTime } from '@/domain/time';
import type { DateKey, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { clearEvents, readEvents } from '@/services/eventLog';
import { useAppStore } from '../store';

const DATE: DateKey = '2026-10-05';
const store = () => useAppStore.getState();
// A 20 min walk at 13:00 (default hours 09:00–17:00, lunch at 14:00).
const plan = generateDayPlan({
  date: DATE,
  schedule: DEFAULT_SETTINGS.schedule,
  settings: DEFAULT_SETTINGS,
  catalog: CATALOG,
  mainActivity: { activityId: 'walk_outside', start: '13:00', durationMin: 20 },
});
const MAIN = plan.activities.find((item) => item.kind === 'main')!;
const main = (): ScheduledActivity =>
  store().days[DATE]!.plan!.activities.find((item) => item.id === MAIN.id)!;
const at = (time: `${number}:${number}`, plusMs = 0) => clock.travelTo(atTime(DATE, time) + plusMs);
const xpTotal = () => store().xpLedger.reduce((sum, entry) => sum + entry.amount, 0);
const eventTypes = async () => (await readEvents()).map((event) => event.type);
/** Real time keeps running during a test: compared to the second. */
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

describe('main activity actions', () => {
  it('starts it where it really happens and moves pauses out of its way', async () => {
    at('10:00');
    store().startMain(DATE, MAIN.id);
    expect(main()).toMatchObject({
      startedAt: near(atTime(DATE, '10:00')),
      currentScheduledAt: near(atTime(DATE, '10:00')),
      runningSince: near(atTime(DATE, '10:00')),
    });
    // No pause during the walk or right after it.
    for (const pause of store().days[DATE]!.plan!.activities) {
      if (pause.kind !== 'micro' || pause.currentScheduledAt <= atTime(DATE, '10:00')) continue;
      expect(pause.currentScheduledAt).toBeGreaterThanOrEqual(atTime(DATE, '10:55'));
    }
    await settle();
    expect(await eventTypes()).toEqual(['exercise_started']);
  });

  it('pauses and resumes, adding up the time done', async () => {
    at('13:00');
    store().startMain(DATE, MAIN.id);
    at('13:05');
    store().pauseMain(DATE, MAIN.id);
    expect(main()).toMatchObject({ accumulatedSec: 300, runningSince: undefined });
    at('13:30');
    store().startMain(DATE, MAIN.id);
    expect(main()).toMatchObject({
      startedAt: near(atTime(DATE, '13:00')),
      runningSince: near(atTime(DATE, '13:30')),
    });
    await settle();
    // Resuming is not a new start.
    expect(await eventTypes()).toEqual(['exercise_started']);
  });

  it('completes it with +300 XP, once', async () => {
    at('13:00');
    store().startMain(DATE, MAIN.id);
    at('13:12');
    store().completeMain(DATE, MAIN.id);
    store().completeMain(DATE, MAIN.id);
    expect(main()).toMatchObject({ status: 'completed', elapsedSec: 720 });
    expect(store().xpLedger).toEqual([
      expect.objectContaining({ key: `main:${DATE}`, amount: 300, reason: 'main_activity' }),
    ]);
    await settle();
    expect(await eventTypes()).toEqual(['exercise_started', 'main_activity_completed']);
  });

  it('counts "Ya la he hecho" with its planned time and the return bonus', () => {
    useAppStore.setState((state) => ({
      days: { ...state.days, [DATE]: { ...state.days[DATE]!, returnBonus: true } },
    }));
    at('16:00');
    store().completeMain(DATE, MAIN.id);
    expect(main()).toMatchObject({ status: 'completed', elapsedSec: 1200 });
    expect(xpTotal()).toBe(450);
  });

  it('completes a session whose time added up while away, with its XP once', async () => {
    at('13:00');
    store().startMain(DATE, MAIN.id);
    store().reconcile(atTime(DATE, '13:19'));
    expect(main().status).not.toBe('completed');

    store().reconcile(atTime(DATE, '13:45'));
    store().reconcile(atTime(DATE, '13:46'));
    expect(main()).toMatchObject({
      status: 'completed',
      completedAt: near(atTime(DATE, '13:20')),
      elapsedSec: 1200,
    });
    expect(xpTotal()).toBe(300);
    await settle();
    expect((await eventTypes()).filter((type) => type === 'main_activity_completed')).toHaveLength(
      1,
    );
  });

  it('leaves a day that is not under way alone', () => {
    store().markDayOff(DATE);
    store().startMain(DATE, MAIN.id);
    store().completeMain(DATE, MAIN.id);
    expect(store().xpLedger).toEqual([]);
  });
});
