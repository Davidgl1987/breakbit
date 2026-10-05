import { describe, expect, it } from 'vitest';
import { nextMeetingId, withDefaultLength } from './meetings';

describe('withDefaultLength', () => {
  const current = { start: '10:00', end: '10:30' };

  it('moves the end to half an hour after a new start', () => {
    expect(withDefaultLength(current, { start: '12:15', end: '10:30' })).toEqual({
      start: '12:15',
      end: '12:45',
    });
  });

  it('leaves the end as chosen when only the end changes', () => {
    expect(withDefaultLength(current, { start: '10:00', end: '11:30' })).toEqual({
      start: '10:00',
      end: '11:30',
    });
  });

  it('never goes past midnight, and waits for a complete start time', () => {
    expect(withDefaultLength(current, { start: '23:50', end: '10:30' }).end).toBe('23:59');
    expect(withDefaultLength(current, { start: '', end: '10:30' })).toEqual({
      start: '',
      end: '10:30',
    });
  });
});

describe('nextMeetingId', () => {
  it('skips the ids already taken', () => {
    const meeting = (id: string) => ({ id, start: '10:00', end: '10:30', canMove: false }) as const;
    expect(nextMeetingId([])).toBe('m1');
    expect(nextMeetingId([meeting('m2')])).toBe('m3');
    expect(nextMeetingId([meeting('m1'), meeting('m3')])).toBe('m4');
  });
});
