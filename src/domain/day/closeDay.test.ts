import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { SAMPLE_DATE as DATE, sampleAt as at, sampleDay } from '@/test/sampleDay';
import { startMain } from '../main/session';
import { addDays } from '../time';
import type { DateKey, DayPlan, DayRecord, HHmm, ScheduledActivity, XpEntry } from '../types';
import {
  closePlan,
  closeRecord,
  dayGoalXp,
  pastDaysToSettle,
  returnBonusFor,
  summarizeDay,
} from './closeDay';

const plan = sampleDay();
const ids = { p0: `${DATE}:p0`, p1: `${DATE}:p1`, p2: `${DATE}:p2`, main: `${DATE}:main` };
const patch = (
  day: DayPlan,
  id: string,
  change: (item: ScheduledActivity) => ScheduledActivity,
): DayPlan => ({
  ...day,
  activities: day.activities.map((item) => (item.id === id ? change(item) : item)),
});
const done =
  (time: HHmm, extra: Partial<ScheduledActivity> = {}) =>
  (item: ScheduledActivity) => ({
    ...item,
    status: 'completed' as const,
    startedAt: at(time) - 40_000,
    completedAt: at(time),
    elapsedSec: 40,
    ...extra,
  });
const record = (day: DayPlan, status: DayRecord['status'] = 'active'): DayRecord => ({
  date: day.date,
  status,
  plan: day,
  returnBonus: false,
  recoveryUsed: false,
});
/** Three pauses and the walk, all done: a perfect day. */
const perfect = [ids.p0, ids.p1, ids.p2, ids.main].reduce(
  (day, id) => patch(day, id, done('16:30', id === ids.main ? { elapsedSec: 1200 } : {})),
  plan,
);

describe('closing a day', () => {
  it('turns what was still open into missed, "day_closed"', () => {
    const started = patch(plan, ids.main, (item) => startMain(item, at('13:00')));
    const closed = closePlan(patch(started, ids.p0, done('10:01')));
    expect(closed.activities.find((item) => item.id === ids.p0)?.status).toBe('completed');
    for (const id of [ids.p1, ids.p2, ids.main]) {
      expect(closed.activities.find((item) => item.id === id)).toMatchObject({
        status: 'missed',
        missReason: 'day_closed',
        runningSince: undefined,
      });
    }
    expect(closePlan(closed)).toBe(closed);
  });

  it('earns +200 for a good day and +100 more for a perfect one', () => {
    const now = at('17:00');
    expect(dayGoalXp(DATE, { isGood: true, isPerfect: true }, now)).toEqual([
      { key: `good:${DATE}`, amount: 200, at: now, date: DATE, reason: 'good_day' },
      { key: `perfect:${DATE}`, amount: 100, at: now, date: DATE, reason: 'perfect_day' },
    ]);
    expect(dayGoalXp(DATE, { isGood: true, isPerfect: false }, now)).toHaveLength(1);
    expect(dayGoalXp(DATE, { isGood: false, isPerfect: false }, now)).toEqual([]);
  });

  it('sums the day up', () => {
    const day = patch(
      patch(patch(plan, ids.p0, done('10:01', { firstPrompt: true })), ids.p1, (item) => ({
        ...item,
        status: 'missed',
        postponeCount: 1,
        remindersSent: 2,
      })),
      ids.p2,
      (item) => ({ ...item, status: 'skipped' }),
    );
    expect(summarizeDay(day, CATALOG, 120)).toEqual({
      planned: 3,
      completed: 1,
      firstPrompt: 1,
      postponed: 1,
      ignored: 1,
      skipped: 1,
      missed: 1,
      extras: 0,
      mainCompleted: false,
      microSec: 40,
      movementSec: 40,
      interruptionSec: 40,
      xp: 120,
      isGood: false,
      isPerfect: false,
    });
  });

  it('closes a perfect day with its XP and keeps the summary', () => {
    const ledger: XpEntry[] = [
      { key: `micro:${ids.p0}`, amount: 100, at: at('10:01'), date: DATE, reason: 'microbreak' },
    ];
    const { record: closed, awards } = closeRecord(record(perfect), at('17:00'), CATALOG, ledger);
    expect(closed).toMatchObject({ status: 'closed', closedAt: at('17:00') });
    expect(awards.map((entry) => entry.key)).toEqual([`good:${DATE}`, `perfect:${DATE}`]);
    expect(closed.summary).toMatchObject({ isGood: true, isPerfect: true, xp: 400 });
  });

  it('leaves days that are not under way alone', () => {
    const closed = record(plan, 'closed');
    expect(closeRecord(closed, at('17:00'), CATALOG, [])).toEqual({ record: closed, awards: [] });
  });
});

describe('settling the past', () => {
  // Monday 5 to Sunday 11 October; workdays Monday–Friday.
  const workday = (date: DateKey) => !['2026-10-10', '2026-10-11'].includes(date);
  const day = (date: DateKey, status: DayRecord['status']): DayRecord => ({
    date,
    status,
    returnBonus: false,
    recoveryUsed: false,
  });

  it('closes days left under way and marks unstarted workdays absent', () => {
    const days = {
      '2026-10-05': day('2026-10-05', 'closed'),
      '2026-10-06': day('2026-10-06', 'active'),
      '2026-10-08': day('2026-10-08', 'day_off'),
    };
    expect(
      pastDaysToSettle({ today: '2026-10-12', since: '2026-10-05', days, isWorkday: workday }),
    ).toEqual({ close: ['2026-10-06'], absent: ['2026-10-07', '2026-10-09'] });
  });

  it('never marks the onboarding day absent, nor today', () => {
    expect(
      pastDaysToSettle({ today: '2026-10-06', since: '2026-10-05', days: {}, isWorkday: workday }),
    ).toEqual({ close: [], absent: [] });
  });

  it('gives the return bonus to the first day back, once per absence', () => {
    const input = (today: DateKey, days: Partial<Record<DateKey, DayRecord>>) => ({
      today,
      since: '2026-10-05' as DateKey,
      days,
      isWorkday: workday,
    });
    // Worked Monday, missed Tuesday: back on Wednesday.
    const monday = { '2026-10-05': day('2026-10-05', 'closed') };
    expect(returnBonusFor(input('2026-10-07', monday))).toBe(true);
    expect(
      returnBonusFor(input('2026-10-07', { ...monday, '2026-10-06': day('2026-10-06', 'absent') })),
    ).toBe(true);
    // Thursday: Wednesday was worked, the absence was already rewarded.
    expect(
      returnBonusFor(
        input('2026-10-08', {
          ...monday,
          '2026-10-06': day('2026-10-06', 'absent'),
          '2026-10-07': day('2026-10-07', 'closed'),
        }),
      ),
    ).toBe(false);
    // A weekend or a day off is not an absence.
    expect(
      returnBonusFor(
        input('2026-10-12', {
          '2026-10-09': day('2026-10-09', 'closed'),
          '2026-10-08': day('2026-10-08', 'day_off'),
        }),
      ),
    ).toBe(false);
    // The onboarding day itself is neutral.
    expect(returnBonusFor(input('2026-10-06', {}))).toBe(false);
    expect(addDays(DATE, 0)).toBe(DATE);
  });
});
