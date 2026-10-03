import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime } from '../time';
import type { DayPlan, DayRecord } from '../types';
import { equipmentInPlan, nextPause, todayState } from './today';

const DATE = '2026-10-05';
const settings = makeSettings();
const schedule = settings.schedule;
const at = (time: `${number}:${number}`) => atTime(DATE, time);
const plan = generateDayPlan({ date: DATE, schedule, settings, catalog: CATALOG });
const record = (patch: Partial<DayRecord> = {}): DayRecord => ({
  date: DATE,
  status: 'active',
  plan,
  returnBonus: false,
  recoveryUsed: false,
  ...patch,
});

describe('todayState', () => {
  const state = (input: Partial<Parameters<typeof todayState>[0]>) =>
    todayState({ date: DATE, now: at('10:00'), schedule, ...input }).kind;

  it('tells rest days, days off, unplanned, active and closed days apart', () => {
    expect(state({ schedule: null })).toBe('rest');
    expect(state({ override: { date: DATE, working: false, source: 'day_off' } })).toBe('day_off');
    expect(state({ record: record({ status: 'day_off' }) })).toBe('day_off');
    expect(state({})).toBe('not_started');
    expect(state({ record: record() })).toBe('active');
    expect(state({ record: record({ status: 'closed' }) })).toBe('closed');
  });

  it('knows when the hours are over', () => {
    expect(todayState({ date: DATE, now: at('17:00'), schedule })).toMatchObject({
      kind: 'not_started',
      late: true,
    });
    expect(todayState({ date: DATE, now: at('17:00'), schedule, record: record() })).toMatchObject({
      kind: 'active',
      over: true,
    });
  });
});

describe('nextPause', () => {
  const micros = plan.activities.filter((item) => item.kind === 'micro');

  it('is the first pause still to do, while its window is open', () => {
    const [first, second] = micros;
    expect(nextPause(plan, at('08:00'))?.id).toBe(first!.id);
    expect(nextPause(plan, first!.scheduledAt + 29 * 60_000)?.id).toBe(first!.id);
    expect(nextPause(plan, first!.scheduledAt + 30 * 60_000)?.id).toBe(second!.id);
  });

  it('keeps a pause under way as next, even after its window', () => {
    const [first] = micros;
    const started: DayPlan = {
      ...plan,
      activities: plan.activities.map((item) =>
        item.id === first!.id
          ? { ...item, status: 'notification_sent', startedAt: item.scheduledAt }
          : item,
      ),
    };
    expect(nextPause(started, first!.scheduledAt + 2 * 3_600_000)?.id).toBe(first!.id);
  });

  it('puts a pause waiting for an answer before one left half done', () => {
    const [first, second] = micros;
    const started: DayPlan = {
      ...plan,
      activities: plan.activities.map((item) =>
        item.id === first!.id
          ? { ...item, status: 'notification_sent', startedAt: item.scheduledAt }
          : item,
      ),
    };
    expect(nextPause(started, second!.scheduledAt + 60_000)?.id).toBe(second!.id);
  });

  it('skips pauses already done', () => {
    const [first, second] = micros;
    const updated: DayPlan = {
      ...plan,
      activities: plan.activities.map((item) =>
        item.id === first!.id ? { ...item, status: 'completed' } : item,
      ),
    };
    expect(nextPause(updated, first!.scheduledAt)?.id).toBe(second!.id);
  });
});

describe('equipmentInPlan', () => {
  it('lists only the equipment the plan uses', () => {
    expect(equipmentInPlan(plan, CATALOG)).toEqual([]);
    const withMat = generateDayPlan({
      date: DATE,
      schedule,
      settings: { ...settings, equipment: ['mat', 'kettlebell'] },
      catalog: CATALOG,
      mainActivity: { activityId: 'mat_mobility', start: '11:00', durationMin: 15 },
    });
    expect(equipmentInPlan(withMat, CATALOG)).toContain('mat');
  });
});
