import { describe, expect, it } from 'vitest';
import type { DaySchedule, HHmm } from '@/domain/types';
import { scheduleIssueMessages } from './scheduleIssues';
import { blockFromRange, rangeFromBlock } from './timeRange';

describe('start–end form for time blocks', () => {
  it('converts both ways', () => {
    expect(rangeFromBlock({ start: '14:00', durationMin: 45 })).toEqual({
      start: '14:00',
      end: '14:45',
    });
    expect(blockFromRange({ start: '14:00', end: '14:45' })).toEqual({
      start: '14:00',
      durationMin: 45,
    });
  });

  it('keeps an end before the start as a duration ≤ 0 for validation to report', () => {
    expect(blockFromRange({ start: '11:00', end: '10:30' }).durationMin).toBe(-30);
    expect(rangeFromBlock({ start: '11:00', durationMin: -30 }).end).toBe('10:30');
  });

  it('leaves unknown times empty', () => {
    expect(blockFromRange({ start: '11:00', end: '' }).durationMin).toBeNaN();
    expect(rangeFromBlock({ start: '11:00', durationMin: Number.NaN })).toEqual({
      start: '11:00',
      end: '',
    });
    expect(rangeFromBlock({ start: '23:50', durationMin: 30 }).end).toBe('');
    expect(rangeFromBlock({ start: '' as HHmm, durationMin: 30 })).toEqual({ start: '', end: '' });
  });
});

describe('schedule messages', () => {
  const schedule = (patch: Partial<DaySchedule>): DaySchedule => ({
    workStart: '09:00',
    workEnd: '17:00',
    breaks: [{ start: '11:00', durationMin: 15 }],
    lunch: { start: '14:00', durationMin: 60 },
    ...patch,
  });

  it('names the block that ends before it starts, in screen order', () => {
    expect(
      scheduleIssueMessages(
        schedule({
          breaks: [{ start: '11:00', durationMin: -15 }],
          lunch: { start: '14:00', durationMin: 0 },
        }),
      ),
    ).toEqual(['schedule.issues.breakEndBeforeStart', 'schedule.issues.lunchEndBeforeStart']);
  });

  it('asks to check the times when one is missing', () => {
    expect(
      scheduleIssueMessages(schedule({ breaks: [{ start: '11:00', durationMin: Number.NaN }] })),
    ).toEqual(['schedule.issues.invalid']);
  });

  it('is empty for a valid schedule', () => {
    expect(scheduleIssueMessages(schedule({}))).toEqual([]);
  });
});
