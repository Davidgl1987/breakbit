import { describe, expect, it } from 'vitest';
import {
  addDays,
  atMinutes,
  atTime,
  compareDateKeys,
  dateRange,
  daysBetween,
  fromMinutes,
  isoWeekKey,
  isValidDateKey,
  isValidHHmm,
  minutesBetween,
  minutesOfDay,
  startOfWeek,
  toDateKey,
  toMinutes,
  weekdayOf,
} from './time';

describe('date keys', () => {
  it('formats local dates with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('validates real calendar dates only', () => {
    expect(isValidDateKey('2026-10-02')).toBe(true);
    expect(isValidDateKey('2028-02-29')).toBe(true);
    expect(isValidDateKey('2026-02-29')).toBe(false);
    expect(isValidDateKey('2026-13-01')).toBe(false);
    expect(isValidDateKey('2026-1-1')).toBe(false);
  });

  it('adds days across months, years and DST changes', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29'); // spring forward night
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26'); // fall back day
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('rejects malformed date keys', () => {
    expect(() => addDays('2026-1-1' as never, 1)).toThrow();
  });

  it('counts days between dates', () => {
    expect(daysBetween('2026-03-27', '2026-03-31')).toBe(4);
    expect(daysBetween('2026-03-31', '2026-03-27')).toBe(-4);
  });

  it('orders and ranges dates', () => {
    expect(compareDateKeys('2026-01-09', '2026-01-10')).toBe(-1);
    expect(compareDateKeys('2026-01-10', '2026-01-10')).toBe(0);
    expect(dateRange('2026-02-27', '2026-03-02')).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
    expect(dateRange('2026-03-02', '2026-03-01')).toEqual([]);
  });

  it('uses ISO weekdays (Monday = 1, Sunday = 7)', () => {
    expect(weekdayOf('2026-10-05')).toBe(1);
    expect(weekdayOf('2026-10-02')).toBe(5);
    expect(weekdayOf('2026-10-04')).toBe(7);
  });

  it('starts weeks on Monday', () => {
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28');
    expect(startOfWeek('2026-10-05')).toBe('2026-10-05');
  });

  it('computes ISO week ids, including year boundaries', () => {
    expect(isoWeekKey('2026-10-02')).toBe('2026-W40');
    expect(isoWeekKey('2026-01-01')).toBe('2026-W01');
    expect(isoWeekKey('2027-01-01')).toBe('2026-W53');
    expect(isoWeekKey('2024-12-30')).toBe('2025-W01');
  });
});

describe('times of day', () => {
  it('converts between HH:mm and minutes', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(fromMinutes(570)).toBe('09:30');
    expect(fromMinutes(0)).toBe('00:00');
    expect(() => fromMinutes(1440)).toThrow();
    expect(() => toMinutes('9:30' as never)).toThrow();
  });

  it('validates HH:mm', () => {
    expect(isValidHHmm('23:59')).toBe(true);
    expect(isValidHHmm('24:00')).toBe(false);
    expect(isValidHHmm('7:00')).toBe(false);
  });

  it('builds local instants that respect DST', () => {
    const before = atTime('2026-03-29', '01:30');
    const after = atTime('2026-03-29', '03:30');
    // 02:00 → 03:00 in Madrid: only one real hour between 01:30 and 03:30.
    expect(minutesBetween(before, after)).toBe(60);
    expect(minutesOfDay(after)).toBe(210);
  });

  it('keeps wall-clock minutes on a normal day', () => {
    const start = atTime('2026-10-02', '09:00');
    expect(minutesBetween(start, atTime('2026-10-02', '17:00'))).toBe(480);
    expect(atMinutes('2026-10-02', 9 * 60)).toBe(start);
    expect(toDateKey(start)).toBe('2026-10-02');
  });
});
