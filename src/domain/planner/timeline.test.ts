import { describe, expect, it } from 'vitest';
import { makeSchedule } from '@/test/builders';
import { buildTimeline, slotAt, subtractIntervals, workWindows } from './timeline';

const at = (h: number, m = 0) => h * 60 + m;

describe('buildTimeline', () => {
  it('converts the schedule and clips meetings to work hours', () => {
    const timeline = buildTimeline(makeSchedule(), [
      { id: 'a', start: '08:00', end: '09:30', canMove: false },
      { id: 'b', start: '16:30', end: '18:00', canMove: true },
      { id: 'c', start: '18:00', end: '19:00', canMove: true },
    ]);
    expect(timeline.workStart).toBe(at(9));
    expect(timeline.lunch).toEqual({ start: at(14), end: at(15) });
    expect(timeline.breaks).toEqual([{ start: at(11), end: at(11, 15) }]);
    expect(timeline.busyMeetings).toEqual([{ start: at(9), end: at(9, 30) }]);
    expect(timeline.moveMeetings).toEqual([{ start: at(16, 30), end: at(17) }]);
  });
});

describe('workWindows', () => {
  it('removes lunch', () => {
    expect(workWindows(buildTimeline(makeSchedule()))).toEqual([
      { start: at(9), end: at(14) },
      { start: at(15), end: at(17) },
    ]);
  });

  it('starts later when the day is planned late', () => {
    expect(workWindows(buildTimeline(makeSchedule()), at(15, 30))).toEqual([
      { start: at(15, 30), end: at(17) },
    ]);
    expect(workWindows(buildTimeline(makeSchedule()), at(18))).toEqual([]);
  });
});

describe('slotAt', () => {
  it('tells breaks, movable meetings and work apart (meetings win)', () => {
    const timeline = buildTimeline(makeSchedule(), [
      { id: 'm', start: '11:10', end: '12:00', canMove: true },
    ]);
    expect(slotAt(timeline, at(11))).toBe('break');
    expect(slotAt(timeline, at(11, 10))).toBe('meeting');
    expect(slotAt(timeline, at(12))).toBe('work');
  });
});

describe('subtractIntervals', () => {
  it('splits around cuts and drops fully covered pieces', () => {
    expect(
      subtractIntervals(
        [{ start: 0, end: 100 }],
        [
          { start: 20, end: 30 },
          { start: 90, end: 120 },
        ],
      ),
    ).toEqual([
      { start: 0, end: 20 },
      { start: 30, end: 90 },
    ]);
    expect(subtractIntervals([{ start: 10, end: 20 }], [{ start: 0, end: 30 }])).toEqual([]);
  });
});
