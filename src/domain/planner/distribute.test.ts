import { describe, expect, it } from 'vitest';
import { allocatePauses, layoutPauses, targetPauseCount, windowCapacity } from './distribute';

const at = (h: number, m = 0) => h * 60 + m;

describe('targetPauseCount', () => {
  it('follows ~0.5 / 0.75 / 1 pauses per effective hour (8 h → 4 / 6 / 8)', () => {
    expect(targetPauseCount(480, 'soft')).toBe(4);
    expect(targetPauseCount(480, 'normal')).toBe(6);
    expect(targetPauseCount(480, 'active')).toBe(8);
  });

  it('rounds to the nearest pause (7 h normal → 5)', () => {
    expect(targetPauseCount(420, 'normal')).toBe(5);
  });

  it('plans at least one pause, but none with almost no time left', () => {
    expect(targetPauseCount(45, 'soft')).toBe(1);
    expect(targetPauseCount(20, 'active')).toBe(0);
  });
});

describe('windowCapacity', () => {
  it('fits one pause per ideal gap, and one in any reasonable stretch', () => {
    expect(windowCapacity(10)).toBe(0);
    expect(windowCapacity(30)).toBe(1);
    expect(windowCapacity(90)).toBe(2);
    expect(windowCapacity(300)).toBe(6);
  });
});

describe('allocatePauses', () => {
  it('splits pauses in proportion to the free time (largest remainder)', () => {
    // 300 + 120 minutes, 5 pauses → 3.57 + 1.43 → 4 + 1
    expect(
      allocatePauses(
        [
          { start: at(9), end: at(14) },
          { start: at(15), end: at(17) },
        ],
        5,
      ),
    ).toEqual([4, 1]);
  });

  it('respects each stretch capacity and moves the rest elsewhere', () => {
    // 80 + 400 minutes, 9 pauses → quotas 1.5 + 7.5; the short stretch holds only one.
    expect(
      allocatePauses(
        [
          { start: at(9), end: at(10, 20) },
          { start: at(11), end: at(17, 40) },
        ],
        9,
      ),
    ).toEqual([1, 8]);
  });

  it('returns fewer pauses when the day is full', () => {
    expect(allocatePauses([{ start: at(9), end: at(10) }], 5)).toEqual([1]);
  });

  it('handles empty input', () => {
    expect(allocatePauses([], 3)).toEqual([]);
    expect(allocatePauses([{ start: 0, end: 60 }], 0)).toEqual([0]);
  });
});

describe('layoutPauses', () => {
  it('spreads pauses evenly with half a gap at each edge, on 5-minute marks', () => {
    // 09:00–17:00, 6 pauses → every 80 min starting at 09:40
    expect(layoutPauses({ start: at(9), end: at(17) }, 6)).toEqual([
      at(9, 40),
      at(11),
      at(12, 20),
      at(13, 40),
      at(15),
      at(16, 20),
    ]);
  });

  it('uses a break as a fixed spot and spreads the rest around it', () => {
    expect(
      layoutPauses({ start: at(9), end: at(14) }, 4, [{ start: at(11), end: at(11, 15) }]),
    ).toEqual([at(9, 40), at(11), at(12, 10), at(13, 25)]);
  });

  it('uses a break right between two evenly spaced pauses', () => {
    // Without the break: 15:30 and 16:30.
    expect(
      layoutPauses({ start: at(15), end: at(17) }, 2, [{ start: at(16), end: at(16, 15) }]),
    ).toEqual([at(15, 20), at(16)]);
  });

  it('ignores a break when the other pauses would end up too close', () => {
    const result = layoutPauses({ start: at(10), end: at(11) }, 2, [
      { start: at(10, 30), end: at(10, 40) },
    ]);
    expect(result).not.toContain(at(10, 30));
  });

  it('ignores breaks outside the stretch and never pins more breaks than pauses', () => {
    const window = { start: at(9), end: at(12) };
    expect(layoutPauses(window, 1, [{ start: at(13), end: at(13, 15) }])).toEqual([at(10, 30)]);
    expect(
      layoutPauses(window, 1, [
        { start: at(9, 45), end: at(10) },
        { start: at(11, 15), end: at(11, 30) },
      ]),
    ).toEqual([at(9, 45)]);
  });

  it('returns nothing for zero pauses', () => {
    expect(layoutPauses({ start: at(9), end: at(17) }, 0)).toEqual([]);
  });
});
