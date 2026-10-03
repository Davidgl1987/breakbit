import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { addDays, weekdayOf } from '../time';
import type {
  DailySummary,
  DateKey,
  DayRecord,
  DayStatus,
  EvolutionPhase,
  ProgressState,
  WeeklyResult,
} from '../types';
import {
  evaluateWeeks,
  goodWeekStreak,
  phaseAfter,
  unseenWeek,
  weekTally,
  type WeekInput,
} from './weekly';

// Week 41 runs Monday 5 – Sunday 11 October 2026; workdays Monday to Friday.
const W41: DateKey = '2026-10-05';
const W42: DateKey = '2026-10-12';
const isWorkday = (date: DateKey) => weekdayOf(date) <= 5;
const ROOM = ['plant', 'picture', 'lamp'];

function record(date: DateKey, status: DayStatus, isGood = false): DayRecord {
  return {
    date,
    status,
    returnBonus: false,
    recoveryUsed: false,
    ...(status === 'closed' && { summary: { isGood } as DailySummary }),
  };
}
/** A Monday–Friday week with `good` good days and the rest closed but not good. */
function week(start: DateKey, good: number): Partial<Record<DateKey, DayRecord>> {
  return Object.fromEntries(
    [0, 1, 2, 3, 4].map((i) => {
      const date = addDays(start, i);
      return [date, record(date, 'closed', i < good)];
    }),
  );
}
const input = (
  days: Partial<Record<DateKey, DayRecord>>,
  since: DateKey = '2026-09-28',
): WeekInput => ({ since, days, isWorkday, catalog: CATALOG });
const progress = (phase: EvolutionPhase, extra: Partial<ProgressState> = {}): ProgressState => ({
  evolutionPhase: phase,
  weeklyResults: [],
  unlockedRoomItems: [],
  ...extra,
});

describe('a week tally', () => {
  it('counts planned workdays and good ones', () => {
    const days = { ...week(W41, 3), '2026-10-09': record('2026-10-09', 'absent') };
    expect(weekTally(W41, input(days))).toEqual({ planned: 5, good: 3, result: 'regular' });
  });

  it('leaves days off, rest days and days before the onboarding out', () => {
    const days = { ...week(W41, 4), '2026-10-05': record('2026-10-05', 'day_off') };
    expect(weekTally(W41, input(days))).toMatchObject({ planned: 4, good: 3 });
    // Onboarded on Wednesday: Monday and Tuesday don't count.
    expect(weekTally(W41, input(week(W41, 5), '2026-10-07'))).toMatchObject({
      planned: 3,
      good: 3,
    });
  });

  it('counts an unstarted workday as planned, but not the onboarding day', () => {
    expect(weekTally(W41, input({}, '2026-10-07'))).toMatchObject({ planned: 2, good: 0 });
  });

  it('counts a day still under way by how it is going', () => {
    const plan = { date: W41, activities: [] } as unknown as DayRecord['plan'];
    const days = {
      ...week(W41, 3),
      '2026-10-09': { ...record('2026-10-09', 'active'), plan },
      '2026-10-08': { ...record('2026-10-08', 'active') },
    };
    // An empty plan can't be good; neither can a day without one.
    expect(weekTally(W41, input(days))).toMatchObject({ planned: 5, good: 3 });
  });

  it('judges by the share of good days', () => {
    const result = (good: number) => weekTally(W41, input(week(W41, good))).result;
    expect(result(5)).toBe('good');
    expect(result(4)).toBe('good'); // 80 %
    expect(result(3)).toBe('regular'); // 60 %
    expect(result(2)).toBe('regular'); // 40 %
    expect(result(1)).toBe('bad'); // 20 %
  });

  it('is neutral with fewer than 3 planned days', () => {
    const days = { ...week(W41, 2) };
    for (const date of ['2026-10-07', '2026-10-08', '2026-10-09'] as DateKey[]) {
      days[date] = record(date, 'day_off');
    }
    expect(weekTally(W41, input(days))).toEqual({ planned: 2, good: 2, result: 'neutral' });
  });
});

describe('evolution', () => {
  it('moves one phase, within 1–5', () => {
    expect(phaseAfter(2, 'good')).toBe(3);
    expect(phaseAfter(5, 'good')).toBe(5);
    expect(phaseAfter(2, 'bad')).toBe(1);
    expect(phaseAfter(1, 'bad')).toBe(1);
    expect(phaseAfter(3, 'regular')).toBe(3);
    expect(phaseAfter(3, 'neutral')).toBe(3);
  });

  it('judges weeks once they are over, in order, once', () => {
    const days = { ...week(W41, 5), ...week(W42, 1) };
    // During week 42, only week 41 is over.
    const midWeek = evaluateWeeks(progress(1), '2026-10-14', input(days, W41), ROOM);
    expect(midWeek).toMatchObject({ evolutionPhase: 2, lastEvaluatedWeek: '2026-W41' });
    expect(midWeek.weeklyResults).toEqual([
      {
        week: '2026-W41',
        start: W41,
        planned: 5,
        good: 5,
        result: 'good',
        phaseBefore: 1,
        phaseAfter: 2,
      },
    ]);
    expect(evaluateWeeks(midWeek, '2026-10-14', input(days, W41), ROOM)).toBe(midWeek);

    // The Monday after week 42: a bad week takes it back down; nothing is skipped.
    const after = evaluateWeeks(midWeek, '2026-10-19', input(days, W41), ROOM);
    expect(after.weeklyResults.map((item) => [item.week, item.result, item.phaseAfter])).toEqual([
      ['2026-W41', 'good', 2],
      ['2026-W42', 'bad', 1],
    ]);
  });

  it('catches up on several weeks at once, from the onboarding week', () => {
    // Onboarded on Thursday 1 October: that short week is neutral.
    const days = { ...week(W41, 4), ...week(W42, 4) };
    const result = evaluateWeeks(progress(1), '2026-10-20', input(days, '2026-10-01'), ROOM);
    expect(result.weeklyResults.map((item) => item.result)).toEqual(['neutral', 'good', 'good']);
    expect(result.evolutionPhase).toBe(3);
  });

  it('unlocks the next room item for each good week already at the top', () => {
    const days = { ...week(W41, 5), ...week(W42, 5) };
    const result = evaluateWeeks(progress(4), '2026-10-19', input(days, W41), ROOM);
    // 4 → 5 is evolution; only the next good week, at 5, brings an item.
    expect(result.weeklyResults.map((item) => item.unlocked)).toEqual([undefined, 'plant']);
    expect(result.unlockedRoomItems).toEqual(['plant']);

    const full = progress(5, { unlockedRoomItems: [...ROOM] });
    const noMore = evaluateWeeks(full, '2026-10-12', input(week(W41, 5), W41), ROOM);
    expect(noMore.weeklyResults[0]?.unlocked).toBeUndefined();
    expect(noMore.unlockedRoomItems).toEqual(ROOM);
  });

  it('applies several pending weeks in order: phase first, then the room', () => {
    // Away for five weeks, starting at phase 4: good, good, bad, good, good.
    const starts = [0, 7, 14, 21, 28].map((offset) => addDays(W41, offset));
    const goods = [5, 5, 0, 5, 5];
    const days = Object.assign({}, ...starts.map((start, i) => week(start, goods[i]!)));
    const result = evaluateWeeks(progress(4), addDays(W41, 35), input(days, W41), ROOM);
    expect(
      result.weeklyResults.map((item) => [
        item.result,
        item.phaseBefore,
        item.phaseAfter,
        item.unlocked ?? null,
      ]),
    ).toEqual([
      ['good', 4, 5, null], // 4 → 5: evolution, no item
      ['good', 5, 5, 'plant'], // the first item, next good week at 5
      ['bad', 5, 4, null], // down a phase, items kept
      ['good', 4, 5, null], // straight back up, no cooldown
      ['good', 5, 5, 'picture'], // the next item, in the list's order
    ]);
    expect(result).toMatchObject({ evolutionPhase: 5, unlockedRoomItems: ['plant', 'picture'] });
  });

  it('keeps unlocked items after a bad week', () => {
    const at5 = progress(5, { unlockedRoomItems: ['plant'] });
    const result = evaluateWeeks(at5, '2026-10-12', input(week(W41, 0), W41), ROOM);
    expect(result).toMatchObject({ evolutionPhase: 4, unlockedRoomItems: ['plant'] });
  });
});

describe('week streak and what to show', () => {
  const result = (week: string, outcome: WeeklyResult['result']): WeeklyResult => ({
    week,
    start: W41,
    planned: 5,
    good: 4,
    result: outcome,
    phaseBefore: 1,
    phaseAfter: 1,
  });

  it('counts good weeks in a row; short weeks neither add nor break it', () => {
    expect(
      goodWeekStreak([
        result('2026-W38', 'good'),
        result('2026-W39', 'bad'),
        result('2026-W40', 'good'),
        result('2026-W41', 'neutral'),
        result('2026-W42', 'good'),
      ]),
    ).toBe(2);
    expect(goodWeekStreak([result('2026-W42', 'regular')])).toBe(0);
    expect(goodWeekStreak([])).toBe(0);
  });

  it('shows the latest result until it has been seen', () => {
    const weeks = [result('2026-W41', 'good'), result('2026-W42', 'good')];
    expect(unseenWeek(progress(1, { weeklyResults: weeks }))?.week).toBe('2026-W42');
    expect(
      unseenWeek(progress(1, { weeklyResults: weeks, lastSeenWeek: '2026-W42' })),
    ).toBeUndefined();
    expect(unseenWeek(progress(1))).toBeUndefined();
  });
});
