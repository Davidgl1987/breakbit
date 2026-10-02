import { describe, expect, it } from 'vitest';
import { makeSchedule } from '@/test/builders';
import { validateSchedule } from './validation';

describe('validateSchedule', () => {
  it('accepts the default schedule', () => {
    expect(validateSchedule(makeSchedule())).toEqual([]);
  });

  it('rejects malformed times', () => {
    expect(validateSchedule(makeSchedule({ workStart: '9:00' as never }))).toEqual([
      { code: 'invalid_time', field: 'workStart' },
    ]);
  });

  it('rejects malformed block times', () => {
    expect(
      validateSchedule(makeSchedule({ breaks: [{ start: '25:00' as never, durationMin: 15 }] })),
    ).toEqual([{ code: 'invalid_time', field: 'break', index: 0 }]);
  });

  it('rejects an end before the start (no overnight shifts in the MVP)', () => {
    expect(validateSchedule(makeSchedule({ workStart: '17:00', workEnd: '09:00' }))).toEqual([
      { code: 'end_before_start' },
    ]);
    expect(validateSchedule(makeSchedule({ workStart: '09:00', workEnd: '09:00' }))).toEqual([
      { code: 'end_before_start' },
    ]);
  });

  it('requires lunch and breaks inside work hours', () => {
    const issues = validateSchedule(
      makeSchedule({
        lunch: { start: '16:30', durationMin: 60 },
        breaks: [{ start: '08:30', durationMin: 15 }],
      }),
    );
    expect(issues).toContainEqual({ code: 'outside_work_hours', field: 'lunch', index: undefined });
    expect(issues).toContainEqual({ code: 'outside_work_hours', field: 'break', index: 0 });
  });

  it('rejects non-positive durations', () => {
    expect(validateSchedule(makeSchedule({ lunch: { start: '14:00', durationMin: 0 } }))).toEqual([
      { code: 'invalid_duration', field: 'lunch', index: undefined },
    ]);
  });

  it('detects overlaps between breaks and lunch', () => {
    const issues = validateSchedule(
      makeSchedule({
        lunch: { start: '14:00', durationMin: 60 },
        breaks: [
          { start: '14:30', durationMin: 15 },
          { start: '11:00', durationMin: 15 },
          { start: '11:10', durationMin: 10 },
        ],
      }),
    );
    expect(issues).toEqual([
      { code: 'overlap', blocks: [{ kind: 'lunch' }, { kind: 'break', index: 0 }] },
      {
        code: 'overlap',
        blocks: [
          { kind: 'break', index: 1 },
          { kind: 'break', index: 2 },
        ],
      },
    ]);
  });

  it('allows blocks that only touch', () => {
    const touching = makeSchedule({
      lunch: { start: '14:00', durationMin: 60 },
      breaks: [{ start: '15:00', durationMin: 15 }],
    });
    expect(validateSchedule(touching)).toEqual([]);
  });
});
