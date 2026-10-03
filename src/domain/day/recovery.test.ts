import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { SAMPLE_DATE as DATE, sampleAt as at, sampleDay } from '@/test/sampleDay';
import type { DayPlan, DayRecord, ScheduledActivity } from '../types';
import { recoverablePause, recoverPause, recoveryMakesGood } from './recovery';

const patch = (day: DayPlan, id: string, change: Partial<ScheduledActivity>): DayPlan => ({
  ...day,
  activities: day.activities.map((item) => (item.id === id ? { ...item, ...change } : item)),
});
const record = (plan: DayPlan, extra: Partial<DayRecord> = {}): DayRecord => ({
  date: DATE,
  status: 'active',
  plan,
  returnBonus: false,
  recoveryUsed: false,
  ...extra,
});
const missed = { status: 'missed' as const, missReason: 'window_expired' as const };

describe('recovering a pause at the end of the day', () => {
  it('offers the latest missed planned pause, once a day', () => {
    const day = patch(patch(sampleDay(), `${DATE}:p0`, missed), `${DATE}:p1`, missed);
    expect(recoverablePause(record(day))?.id).toBe(`${DATE}:p1`);
    expect(recoverablePause(record(day, { recoveryUsed: true }))).toBeUndefined();
    expect(recoverablePause(record(sampleDay()))).toBeUndefined();
    expect(recoverablePause(record(day, { status: 'closed' }))).toBeUndefined();
  });

  it('opens it again as "recovery", started now, keeping why it was missed', () => {
    const pause = { ...sampleDay().activities[0]!, ...missed, firstPrompt: true };
    expect(recoverPause(pause, at('16:55'))).toMatchObject({
      origin: 'recovery',
      status: 'pending',
      startedAt: at('16:55'),
      currentScheduledAt: at('16:55'),
      firstPrompt: false,
      missReason: 'window_expired',
    });
    const open = sampleDay().activities[0]!;
    expect(recoverPause(open, at('16:55'))).toBe(open);
  });

  it('knows when one more pause would make the day good', () => {
    // 2 of 3 pauses and the walk done, one missed: with it, 3 of 3 reaches 70 %.
    const base = [`${DATE}:p0`, `${DATE}:p2`, `${DATE}:main`].reduce(
      (day, id) => patch(day, id, { status: 'completed' }),
      patch(sampleDay(), `${DATE}:p1`, missed),
    );
    expect(recoveryMakesGood(record(base), CATALOG)).toBe(true);
    // Without the main activity, one pause is not enough.
    const noMain = patch(base, `${DATE}:main`, { status: 'pending' });
    expect(recoveryMakesGood(record(noMain), CATALOG)).toBe(false);
    // Two missed: one more isn't enough either.
    const twoMissed = patch(base, `${DATE}:p2`, missed);
    expect(recoveryMakesGood(record(twoMissed), CATALOG)).toBe(false);
    // Already good: nothing to turn.
    const good = patch(base, `${DATE}:p1`, { status: 'completed' });
    expect(recoveryMakesGood(record(good), CATALOG)).toBe(false);
  });
});
