import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan } from '@/domain/types';
import { clock } from '@/services/clock';
import { clearEvents, readEvents } from '@/services/eventLog';
import { SAMPLE_DATE as MONDAY, sampleAt as at, sampleDay } from '@/test/sampleDay';
import { useAppStore } from '../store';

const store = () => useAppStore.getState();
const ids = { p0: `${MONDAY}:p0`, p1: `${MONDAY}:p1`, p2: `${MONDAY}:p2`, main: `${MONDAY}:main` };
const keys = () => store().xpLedger.map((entry) => entry.key);
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
/** The sample day, with these activities already done. */
function dayWithDone(...done: string[]): DayPlan {
  const plan = sampleDay();
  return {
    ...plan,
    activities: plan.activities.map((item) =>
      done.includes(item.id)
        ? { ...item, status: 'completed', startedAt: at('10:00'), completedAt: at('10:01') }
        : item,
    ),
  };
}

beforeEach(async () => {
  await clearEvents();
  store().completeOnboarding(DEFAULT_SETTINGS);
  // Onboarded the Friday before the sample Monday.
  useAppStore.setState({ onboardedAt: atTime('2026-10-02', '18:00') });
});
afterEach(() => clock.setOffset(0));

describe('closing the day', () => {
  it('closes a perfect day with its XP, mood and next-day answer', async () => {
    store().startDay(dayWithDone(ids.p0, ids.p1, ids.p2, ids.main));
    clock.travelTo(at('16:55'));
    store().closeDay(MONDAY, { mood: 'great', nextDay: 'repeat' });

    expect(store().days[MONDAY]).toMatchObject({
      status: 'closed',
      mood: 'great',
      nextDayDecision: 'repeat',
      summary: { isGood: true, isPerfect: true, xp: 300 },
    });
    expect(keys()).toEqual([`good:${MONDAY}`, `perfect:${MONDAY}`]);
    // Closing twice changes nothing.
    store().closeDay(MONDAY);
    expect(keys()).toHaveLength(2);
    await settle();
    expect((await readEvents()).map((event) => event.type).sort()).toEqual([
      'day_completed',
      'mood_recorded',
    ]);
  });

  it('turns what was left into missed pauses, without day XP', () => {
    store().startDay(dayWithDone(ids.p0));
    clock.travelTo(at('16:55'));
    store().closeDay(MONDAY);
    const plan = store().days[MONDAY]!.plan!;
    expect(plan.activities.find((item) => item.id === ids.p2)).toMatchObject({
      status: 'missed',
      missReason: 'day_closed',
    });
    expect(store().days[MONDAY]?.summary).toMatchObject({ isGood: false, completed: 1 });
    expect(keys()).toEqual([]);
  });

  it('recovers one missed pause a day, as "recovery"', () => {
    const plan = dayWithDone(ids.p0);
    store().startDay({
      ...plan,
      activities: plan.activities.map((item) =>
        item.id === ids.p1 ? { ...item, status: 'missed', missReason: 'window_expired' } : item,
      ),
    });
    clock.travelTo(at('16:55'));
    const id = store().recoverPause(MONDAY);
    expect(id).toBe(ids.p1);
    expect(store().days[MONDAY]).toMatchObject({ recoveryUsed: true });
    store().completePause(MONDAY, id!, 40);
    expect(store().xpLedger).toEqual([
      expect.objectContaining({ key: `micro:${ids.p1}`, amount: 100 }),
    ]);
    expect(store().recoverPause(MONDAY)).toBeUndefined();
  });
});

describe('settling past days', () => {
  it('closes yesterday lazily and marks unstarted workdays absent', () => {
    store().startDay(dayWithDone(ids.p0, ids.p1, ids.p2, ids.main));
    // Back on Thursday: Tuesday and Wednesday were never started.
    store().closePastDays(atTime('2026-10-08', '09:00'));
    const days = store().days;
    expect(days[MONDAY]).toMatchObject({ status: 'closed', summary: { isPerfect: true } });
    expect(days['2026-10-06' as DateKey]).toMatchObject({ status: 'absent' });
    expect(days['2026-10-07' as DateKey]).toMatchObject({ status: 'absent' });
    expect(days['2026-10-08' as DateKey]).toBeUndefined();
    expect(keys()).toEqual([`good:${MONDAY}`, `perfect:${MONDAY}`]);
  });

  it('gives the first day back the return bonus, once', () => {
    store().startDay(dayWithDone(ids.p0));
    store().closePastDays(atTime('2026-10-07', '09:00'));
    const wednesday = { ...sampleDay(), date: '2026-10-07' as DateKey, activities: [] };
    store().startDay(wednesday);
    expect(store().days['2026-10-07' as DateKey]?.returnBonus).toBe(true);

    store().closePastDays(atTime('2026-10-08', '09:00'));
    store().startDay({ ...wednesday, date: '2026-10-08' as DateKey });
    expect(store().days['2026-10-08' as DateKey]?.returnBonus).toBe(false);
  });

  it('does nothing before onboarding', () => {
    useAppStore.setState({ onboardedAt: undefined });
    store().closePastDays(atTime('2026-10-08', '09:00'));
    expect(store().days).toEqual({});
  });
});
