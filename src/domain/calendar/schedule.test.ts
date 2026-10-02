import { describe, expect, it } from 'vitest';
import { makeSchedule, makeSettings } from '@/test/builders';
import type { DayOverrides } from '../types';
import {
  effectiveWorkMinutes,
  isWorkday,
  nextWorkday,
  resolveDaySchedule,
  sameSchedule,
} from './schedule';

const settings = makeSettings(); // Monday–Friday, 09:00–17:00
const FRIDAY = '2026-10-02';
const SATURDAY = '2026-10-03';
const MONDAY = '2026-10-05';

describe('resolveDaySchedule', () => {
  it('uses the weekly template on configured workdays', () => {
    expect(resolveDaySchedule(FRIDAY, settings, {})).toEqual(settings.schedule);
    expect(resolveDaySchedule(SATURDAY, settings, {})).toBeNull();
  });

  it('lets an override turn a workday into a day off', () => {
    const overrides: DayOverrides = {
      [FRIDAY]: { date: FRIDAY, working: false, source: 'day_off' },
    };
    expect(resolveDaySchedule(FRIDAY, settings, overrides)).toBeNull();
  });

  it('lets an override make a weekend day a workday with custom hours', () => {
    const custom = makeSchedule({
      workStart: '10:00',
      workEnd: '14:00',
      breaks: [],
      lunch: undefined,
    });
    const overrides: DayOverrides = {
      [SATURDAY]: { date: SATURDAY, working: true, schedule: custom, source: 'custom' },
    };
    expect(resolveDaySchedule(SATURDAY, settings, overrides)).toEqual(custom);
  });

  it('falls back to template hours for a working override without schedule', () => {
    const overrides: DayOverrides = {
      [SATURDAY]: { date: SATURDAY, working: true, source: 'custom' },
    };
    expect(resolveDaySchedule(SATURDAY, settings, overrides)).toEqual(settings.schedule);
  });
});

describe('nextWorkday', () => {
  it('skips weekends', () => {
    expect(nextWorkday(FRIDAY, settings, {})).toBe(MONDAY);
    expect(isWorkday(MONDAY, settings, {})).toBe(true);
  });

  it('skips days marked off and honours extra workdays', () => {
    const overrides: DayOverrides = {
      [MONDAY]: { date: MONDAY, working: false, source: 'day_off' },
      [SATURDAY]: { date: SATURDAY, working: true, source: 'custom' },
    };
    expect(nextWorkday(FRIDAY, settings, overrides)).toBe(SATURDAY);
    expect(nextWorkday(SATURDAY, settings, overrides)).toBe('2026-10-06');
  });

  it('returns null when nothing is ever a workday', () => {
    expect(nextWorkday(FRIDAY, makeSettings({ workDays: [] }), {})).toBeNull();
  });
});

describe('effectiveWorkMinutes', () => {
  it('excludes lunch but keeps breaks', () => {
    expect(effectiveWorkMinutes(settings.schedule)).toBe(7 * 60); // 8 h − 1 h lunch
    expect(effectiveWorkMinutes(makeSchedule({ lunch: undefined }))).toBe(8 * 60);
  });
});

describe('sameSchedule', () => {
  it('ignores the order of breaks', () => {
    const a = makeSchedule({
      breaks: [
        { start: '11:00', durationMin: 15 },
        { start: '16:00', durationMin: 10 },
      ],
    });
    const b = makeSchedule({ breaks: [...a.breaks].reverse() });
    expect(sameSchedule(a, b)).toBe(true);
    expect(sameSchedule(a, makeSchedule({ workEnd: '18:00', breaks: a.breaks }))).toBe(false);
    expect(sameSchedule(a, { ...a, lunch: undefined })).toBe(false);
  });
});
