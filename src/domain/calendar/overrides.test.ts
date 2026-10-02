import { describe, expect, it } from 'vitest';
import { makeSchedule, makeSettings } from '@/test/builders';
import {
  clearOverride,
  markDayOff,
  repeatSchedule,
  setCustomSchedule,
  skipUntil,
} from './overrides';
import { nextWorkday, resolveDaySchedule } from './schedule';

const settings = makeSettings(); // Monday–Friday
const THURSDAY = '2026-10-01';
const FRIDAY = '2026-10-02';
const SATURDAY = '2026-10-03';
const MONDAY = '2026-10-05';
const TUESDAY = '2026-10-06';
const WEDNESDAY = '2026-10-07';

describe('markDayOff ("Hoy no trabajo")', () => {
  it('turns the day off without touching other days', () => {
    const overrides = markDayOff({}, FRIDAY);
    expect(resolveDaySchedule(FRIDAY, settings, overrides)).toBeNull();
    expect(resolveDaySchedule(THURSDAY, settings, overrides)).toEqual(settings.schedule);
    expect(overrides[FRIDAY]?.source).toBe('day_off');
  });
});

describe('setCustomSchedule ("No, cambiar horario")', () => {
  it('applies one-off hours and keeps the template for other days', () => {
    const custom = makeSchedule({ workStart: '07:30', workEnd: '15:30' });
    const overrides = setCustomSchedule({}, MONDAY, custom);
    expect(resolveDaySchedule(MONDAY, settings, overrides)).toEqual(custom);
    expect(resolveDaySchedule(TUESDAY, settings, overrides)).toEqual(settings.schedule);
  });
});

describe('repeatSchedule ("Sí, repetir horario")', () => {
  it('needs no override when today used the template', () => {
    expect(repeatSchedule({}, settings, MONDAY, settings.schedule)).toEqual({});
  });

  it("carries today's custom hours to the next workday", () => {
    const custom = makeSchedule({ workStart: '08:00', workEnd: '16:00' });
    const overrides = repeatSchedule({}, settings, MONDAY, custom);
    expect(resolveDaySchedule(MONDAY, settings, overrides)).toEqual(custom);
    expect(overrides[MONDAY]?.source).toBe('repeated');
  });

  it('replaces an earlier override for that date', () => {
    const offFirst = markDayOff({}, MONDAY);
    expect(repeatSchedule(offFirst, settings, MONDAY, settings.schedule)).toEqual({});
  });

  it('makes a non-template day a workday when repeating onto it', () => {
    const overrides = repeatSchedule({}, settings, SATURDAY, settings.schedule);
    expect(resolveDaySchedule(SATURDAY, settings, overrides)).toEqual(settings.schedule);
  });
});

describe('skipUntil ("No trabajo mañana" + próximo día laboral)', () => {
  it('marks every workday before the chosen day as off', () => {
    const overrides = skipUntil({}, settings, MONDAY, WEDNESDAY);
    expect(resolveDaySchedule(MONDAY, settings, overrides)).toBeNull();
    expect(resolveDaySchedule(TUESDAY, settings, overrides)).toBeNull();
    expect(resolveDaySchedule(WEDNESDAY, settings, overrides)).toEqual(settings.schedule);
    expect(nextWorkday(FRIDAY, settings, overrides)).toBe(WEDNESDAY);
  });

  it('does not create overrides for days that were already free', () => {
    const overrides = skipUntil({}, settings, SATURDAY, TUESDAY);
    expect(Object.keys(overrides).sort()).toEqual([MONDAY]);
  });

  it('makes the chosen day a workday even if it is not in the template', () => {
    const overrides = skipUntil({}, settings, FRIDAY, SATURDAY);
    expect(resolveDaySchedule(FRIDAY, settings, overrides)).toBeNull();
    expect(resolveDaySchedule(SATURDAY, settings, overrides)).toEqual(settings.schedule);
  });

  it('can set custom hours for the chosen day', () => {
    const custom = makeSchedule({ workStart: '12:00', workEnd: '18:00', lunch: undefined });
    const overrides = skipUntil({}, settings, MONDAY, TUESDAY, custom);
    expect(resolveDaySchedule(TUESDAY, settings, overrides)).toEqual(custom);
  });

  it('rejects a next workday that is not in the future', () => {
    expect(() => skipUntil({}, settings, MONDAY, MONDAY)).toThrow();
  });
});

describe('clearOverride', () => {
  it('removes only the given date', () => {
    const overrides = markDayOff(markDayOff({}, MONDAY), TUESDAY);
    expect(Object.keys(clearOverride(overrides, MONDAY))).toEqual([TUESDAY]);
    expect(clearOverride(overrides, WEDNESDAY)).toBe(overrides);
  });
});
