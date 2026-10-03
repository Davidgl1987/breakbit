import { beforeEach, describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import type { DateKey, DaySchedule } from '@/domain/types';
import { makeSchedule } from '@/test/builders';
import { useAppStore } from '../store';

const MONDAY: DateKey = '2026-10-05';
const SATURDAY: DateKey = '2026-10-10';
const store = () => useAppStore.getState();
const planFor = (date: DateKey, schedule: DaySchedule = DEFAULT_SETTINGS.schedule) =>
  generateDayPlan({ date, schedule, settings: DEFAULT_SETTINGS, catalog: CATALOG });

describe('day actions', () => {
  beforeEach(() => store().completeOnboarding(DEFAULT_SETTINGS));

  it('starts the day with its plan, without touching the calendar for usual hours', () => {
    const plan = planFor(MONDAY);
    store().startDay(plan);
    expect(store().days[MONDAY]).toMatchObject({ date: MONDAY, status: 'active', plan });
    expect(store().days[MONDAY]?.openedAt).toBeTypeOf('number');
    expect(store().dayOverrides).toEqual({});
  });

  it("records today's own hours on the calendar", () => {
    const schedule = makeSchedule({ workEnd: '15:00', lunch: undefined });
    store().startDay(planFor(MONDAY, schedule));
    expect(store().dayOverrides[MONDAY]).toMatchObject({ working: true, schedule });

    // Back to the usual hours: the exception is no longer needed.
    store().updateDayPlan(planFor(MONDAY));
    expect(store().dayOverrides[MONDAY]).toBeUndefined();
  });

  it('turns a rest day into a workday when the user starts it', () => {
    store().startDay(planFor(SATURDAY));
    expect(store().dayOverrides[SATURDAY]).toMatchObject({ working: true });
  });

  it('rejects invalid hours', () => {
    const plan = { ...planFor(MONDAY), schedule: makeSchedule({ workEnd: '08:00' }) };
    expect(() => store().startDay(plan)).toThrow(/Invalid schedule/);
  });

  it('marks a started day off and brings it back with its plan', () => {
    const plan = planFor(MONDAY, makeSchedule({ workEnd: '15:00', lunch: undefined }));
    store().startDay(plan);

    store().markDayOff(MONDAY);
    expect(store().days[MONDAY]?.status).toBe('day_off');
    expect(store().dayOverrides[MONDAY]).toMatchObject({ working: false });

    store().undoDayOff(MONDAY);
    expect(store().days[MONDAY]).toMatchObject({ status: 'active', plan });
    expect(store().dayOverrides[MONDAY]).toMatchObject({ working: true, schedule: plan.schedule });
  });

  it('undoes a day off that had not started', () => {
    store().markDayOff(MONDAY);
    store().undoDayOff(MONDAY);
    expect(store().dayOverrides).toEqual({});
    expect(store().days[MONDAY]).toBeUndefined();
  });
});
