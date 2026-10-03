import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { SAMPLE_DATE, sampleAt, sampleDay } from '@/test/sampleDay';
import { createActivity } from '../planner/activities';
import { addDays, weekdayOf } from '../time';
import type { DailySummary, DateKey, DayRecord, DayStatus, XpEntry } from '../types';
import { areaStats } from './areas';
import { dayStat, type HistoryInput } from './days';
import { heatLevel, heatmapWeeks } from './heatmap';
import { weekInsights } from './insights';
import { weekOutlook, weekStats, type WeekStats } from './weekStats';

// Week 41: Monday 5 – Sunday 11 October 2026; workdays Monday to Friday.
const MONDAY: DateKey = '2026-10-05';
const isWorkday = (date: DateKey) => weekdayOf(date) <= 5;
const summary = (patch: Partial<DailySummary> = {}): DailySummary => ({
  planned: 5,
  completed: 4,
  firstPrompt: 3,
  postponed: 1,
  ignored: 1,
  skipped: 0,
  missed: 1,
  extras: 0,
  mainCompleted: true,
  microSec: 200,
  movementSec: 1400,
  interruptionSec: 200,
  xp: 700,
  isGood: true,
  isPerfect: false,
  ...patch,
});
const day = (date: DateKey, status: DayStatus, patch?: Partial<DailySummary>): DayRecord => ({
  date,
  status,
  returnBonus: false,
  recoveryUsed: false,
  ...(status === 'closed' && { summary: summary(patch) }),
});
const input = (
  days: Partial<Record<DateKey, DayRecord>>,
  { today = '2026-10-09' as DateKey, since = '2026-09-28' as DateKey } = {},
): HistoryInput => ({ today, since, days, isWorkday, catalog: CATALOG });

describe('what each day was', () => {
  const days = {
    '2026-10-05': day('2026-10-05', 'closed'),
    '2026-10-06': day('2026-10-06', 'absent'),
    '2026-10-07': day('2026-10-07', 'day_off'),
  };

  it('tells worked, missed, off, pending and outside days apart', () => {
    const kind = (date: DateKey, extra = {}) => dayStat(date, input(days, extra)).kind;
    expect(kind('2026-10-05')).toBe('worked');
    expect(kind('2026-10-06')).toBe('absent');
    expect(kind('2026-10-07')).toBe('off');
    expect(kind('2026-10-08')).toBe('absent');
    expect(kind('2026-10-09')).toBe('pending');
    expect(kind('2026-10-10')).toBe('future');
    expect(kind('2026-10-11', { today: '2026-10-12' })).toBe('off');
    expect(kind('2026-09-27')).toBe('before');
    // The onboarding day only counts if it was worked.
    expect(kind('2026-09-28')).toBe('off');
  });

  it('reads a day under way from its plan', () => {
    const active = { ...day(SAMPLE_DATE, 'active'), plan: sampleDay() };
    const stat = dayStat(SAMPLE_DATE, input({ [SAMPLE_DATE]: active }, { today: SAMPLE_DATE }));
    expect(stat).toMatchObject({ kind: 'worked', summary: { planned: 3, completed: 0 } });
    expect(
      dayStat(
        SAMPLE_DATE,
        input({ [SAMPLE_DATE]: day(SAMPLE_DATE, 'active') }, { today: SAMPLE_DATE }),
      ).kind,
    ).toBe('pending');
  });
});

describe('heatmap', () => {
  it('shades by how much of the day was done', () => {
    const worked = (patch: Partial<DailySummary>) =>
      heatLevel({ date: MONDAY, kind: 'worked', summary: summary(patch) });
    expect(worked({ isGood: true })).toBe(4);
    expect(worked({ isGood: false, completed: 4 })).toBe(3); // 80 %, main missing
    expect(worked({ isGood: false, completed: 2 })).toBe(2); // 40 %
    expect(worked({ isGood: false, completed: 1, mainCompleted: false })).toBe(1);
    expect(worked({ isGood: false, completed: 0, mainCompleted: false })).toBe(0);
    expect(worked({ isGood: false, completed: 0, mainCompleted: true })).toBe(1);
    expect(worked({ isGood: false, planned: 0, completed: 0, mainCompleted: true })).toBe(2);
    expect(worked({ isGood: false, planned: 0, completed: 0, mainCompleted: false })).toBe(0);
    expect(heatLevel({ date: MONDAY, kind: 'absent' })).toBe(0);
    expect(heatLevel({ date: MONDAY, kind: 'off' })).toBe('off');
    expect(heatLevel({ date: MONDAY, kind: 'future' })).toBe('blank');
  });

  it('lays out whole weeks, the latest last', () => {
    const weeks = heatmapWeeks(MONDAY, 3, input({ '2026-10-05': day('2026-10-05', 'closed') }));
    expect(weeks).toHaveLength(3);
    expect(weeks.map((week) => week[0]!.date)).toEqual(['2026-09-21', '2026-09-28', MONDAY]);
    expect(weeks[2]![0]).toEqual({ date: MONDAY, level: 4 });
    expect(weeks[0]![0]!.level).toBe('blank'); // before the onboarding
    expect(weeks[2]![5]!.level).toBe('blank'); // Saturday, still to come
  });
});

describe('a week in numbers', () => {
  const days = {
    '2026-10-05': day('2026-10-05', 'closed'),
    '2026-10-06': day('2026-10-06', 'closed', {
      isGood: false,
      completed: 2,
      mainCompleted: false,
    }),
    '2026-10-07': day('2026-10-07', 'absent'),
  };
  const ledger: XpEntry[] = [
    { key: 'a', amount: 300, at: 0, date: '2026-10-05', reason: 'main_activity' },
    { key: 'b', amount: 100, at: 0, date: '2026-10-04', reason: 'microbreak' },
  ];

  it('adds the days up, counting missed workdays as planned', () => {
    expect(weekStats(MONDAY, input(days, { today: '2026-10-07' }), ledger)).toMatchObject({
      plannedDays: 3,
      goodDays: 1,
      mainDays: 1,
      planned: 10,
      completed: 6,
      firstPrompt: 6,
      movementSec: 2800,
      xp: 300,
    });
  });

  it('can count only the first days, to compare like with like', () => {
    // Monday and Tuesday only.
    expect(weekStats(MONDAY, input(days, { today: '2026-10-07' }), ledger, 2)).toMatchObject({
      plannedDays: 2,
      completed: 6,
    });
  });

  it('only promises an evolution the days left can still reach', () => {
    // Mon and Tue good; Wed is today, not started; Thu planned; Fri a day off.
    const week = {
      '2026-10-05': day('2026-10-05', 'closed'),
      '2026-10-06': day('2026-10-06', 'closed'),
      '2026-10-09': day('2026-10-09', 'day_off'),
    };
    // 4 planned days: 3 good needed, 1 more with Wed and Thu left.
    expect(weekOutlook(MONDAY, input(week, { today: '2026-10-07' }))).toEqual({
      planned: 4,
      good: 2,
      needed: 1,
      status: 'reachable',
    });
    // Wed missed; Thu is today, still under way: it can still be the one.
    const thursday = { ...week, '2026-10-07': day('2026-10-07', 'absent') };
    expect(
      weekOutlook(
        MONDAY,
        input({ ...thursday, '2026-10-08': day('2026-10-08', 'active') }, { today: '2026-10-08' }),
      ),
    ).toMatchObject({ needed: 1, status: 'reachable' });
    // Thu closed without being good: nothing left this week, so no promise.
    const closed = { ...thursday, '2026-10-08': day('2026-10-08', 'closed', { isGood: false }) };
    expect(weekOutlook(MONDAY, input(closed, { today: '2026-10-08' }))).toMatchObject({
      needed: 1,
      status: 'out_of_reach',
    });
  });

  it('says how far the week is from a good one', () => {
    // Mon good, Tue not, Wed missed; Thu and Fri to come: 4 of 5 needed, 2 days left.
    expect(weekOutlook(MONDAY, input(days, { today: '2026-10-07' }))).toEqual({
      planned: 5,
      good: 1,
      needed: 3,
      status: 'out_of_reach',
    });
    const better = { ...days, '2026-10-07': day('2026-10-07', 'closed') };
    expect(weekOutlook(MONDAY, input(better, { today: '2026-10-07' }))).toMatchObject({
      good: 2,
      needed: 2,
      status: 'reachable',
    });
    const done = Object.fromEntries(
      [0, 1, 2, 3].map((i) => [addDays(MONDAY, i), day(addDays(MONDAY, i), 'closed')]),
    );
    expect(weekOutlook(MONDAY, input(done, { today: '2026-10-08' })).status).toBe('done');
    // Onboarded on Thursday: two days can't make a week.
    expect(
      weekOutlook(MONDAY, input({}, { since: '2026-10-08', today: '2026-10-08' })).status,
    ).toBe('short');
  });

  it('counts today as a day that can still turn good', () => {
    const today = { ...day(SAMPLE_DATE, 'active'), plan: sampleDay() };
    const outlook = weekOutlook(MONDAY, input({ [SAMPLE_DATE]: today }, { today: SAMPLE_DATE }));
    expect(outlook).toEqual({ planned: 5, good: 0, needed: 4, status: 'reachable' });
  });
});

describe('areas moved', () => {
  it('splits each completed pause among the areas its exercises work', () => {
    const plan = sampleDay();
    const routine = createActivity({
      id: `${SAMPLE_DATE}:r`,
      kind: 'micro',
      content: { kind: 'routine', routineId: 'wake_up' },
      slot: 'break',
      durationSec: 120,
      at: sampleAt('11:00'),
    });
    const activities = [...plan.activities, routine].map((item) =>
      item.id === `${SAMPLE_DATE}:p0` || item.id === routine.id
        ? { ...item, status: 'completed' as const, elapsedSec: item.durationSec }
        : item,
    );
    const days = {
      [SAMPLE_DATE]: { ...day(SAMPLE_DATE, 'active'), plan: { ...plan, activities } },
    };
    const stats = areaStats(SAMPLE_DATE, SAMPLE_DATE, days, CATALOG);
    const neck = CATALOG.exercises.find((item) => item.id === 'neck_rotation')!;
    for (const area of neck.areas) {
      expect(stats.find((stat) => stat.area === area)?.exercises).toBeGreaterThanOrEqual(1);
    }
    // Sorted by how much each area was worked.
    const counts = stats.map((stat) => stat.exercises);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    // Nothing done, nothing shown.
    expect(
      areaStats(
        SAMPLE_DATE,
        SAMPLE_DATE,
        { [SAMPLE_DATE]: { ...day(SAMPLE_DATE, 'active'), plan } },
        CATALOG,
      ),
    ).toEqual([]);
  });
});

describe('insights', () => {
  const stats = (patch: Partial<WeekStats>): WeekStats => ({
    plannedDays: 5,
    goodDays: 3,
    mainDays: 4,
    planned: 25,
    completed: 20,
    firstPrompt: 10,
    postponed: 2,
    ignored: 5,
    skipped: 1,
    missed: 4,
    extras: 0,
    microSec: 900,
    movementSec: 6000,
    interruptionSec: 900,
    xp: 3000,
    ...patch,
  });

  it('tells relevant changes in either direction, then plain facts', () => {
    const previous = stats({});
    const better = stats({ firstPrompt: 16, postponed: 0, ignored: 2, movementSec: 7200 });
    expect(weekInsights(better, previous)).toEqual([
      { kind: 'first_prompt', change: 6 },
      { kind: 'movement', changeSec: 1200 },
      { kind: 'postponed', change: -2 },
      { kind: 'ignored', change: -3 },
      { kind: 'main', done: 4, total: 5 },
      { kind: 'completed', percent: 80 },
    ]);
    const other = stats({ firstPrompt: 7, postponed: 5, ignored: 5, movementSec: 5000 });
    expect(weekInsights(other, previous)).toEqual([
      { kind: 'first_prompt', change: -3 },
      { kind: 'movement', changeSec: -1000 },
      { kind: 'postponed', change: 3 },
      { kind: 'main', done: 4, total: 5 },
      { kind: 'completed', percent: 80 },
    ]);
  });

  it('leaves out changes too small to mean anything', () => {
    const previous = stats({});
    const close = stats({ firstPrompt: 11, postponed: 3, ignored: 4, movementSec: 6200 });
    expect(weekInsights(close, previous).map((item) => item.kind)).toEqual(['main', 'completed']);
    // Nothing to compare with.
    expect(weekInsights(close, stats({ plannedDays: 0 })).map((item) => item.kind)).toEqual([
      'main',
      'completed',
    ]);
  });

  it('has nothing to say about an empty week, nor a "0 %"', () => {
    expect(weekInsights(stats({ plannedDays: 0, planned: 0 }))).toEqual([]);
    expect(weekInsights(stats({ completed: 0, mainDays: 0 }))).toEqual([]);
  });
});
