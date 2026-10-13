import { describe, expect, it } from 'vitest';
import type { AreaStat } from '../stats/areas';
import type { DiscomfortLevels } from '../types';
import { proposePriorityRebalance } from './rebalancePriorities';

const areas = ['neck', 'upper_back', 'hips_legs', 'eyes'];
const stats = (counts: Record<string, number>): AreaStat[] =>
  Object.entries(counts).map(([area, exercises]) => ({
    area,
    exercises,
    seconds: exercises * 30,
  }));

describe('weekly priority suggestion', () => {
  it('moves one point from a more worked active area to a less worked one without mutating inputs', () => {
    const priorities: DiscomfortLevels = {
      neck: 3,
      upper_back: 2,
      hips_legs: 3,
      eyes: 0,
    };
    const activity = stats({ neck: 6, upper_back: 2, hips_legs: 12, eyes: 20 });
    expect(proposePriorityRebalance(priorities, activity, areas)).toEqual([
      { area: 'upper_back', from: 2, to: 3, exercises: 2 },
      { area: 'hips_legs', from: 3, to: 2, exercises: 12 },
    ]);
    expect(priorities).toEqual({
      neck: 3,
      upper_back: 2,
      hips_legs: 3,
      eyes: 0,
    });
    expect(activity[3]?.exercises).toBe(20);
  });

  it('can prioritise an active zone with no recorded exercises, but never activates a zero zone', () => {
    expect(
      proposePriorityRebalance(
        { upper_back: 2, hips_legs: 3, eyes: 0 },
        stats({ hips_legs: 8 }),
        areas,
      ),
    ).toEqual([
      { area: 'upper_back', from: 2, to: 3, exercises: 0 },
      { area: 'hips_legs', from: 3, to: 2, exercises: 8 },
    ]);
  });

  it.each([
    [{ upper_back: 2, hips_legs: 3 }, {}],
    [
      { upper_back: 2, hips_legs: 3 },
      { upper_back: 1, hips_legs: 2 },
    ],
    [
      { upper_back: 2, hips_legs: 3 },
      { upper_back: 5, hips_legs: 5 },
    ],
    [
      { upper_back: 2, hips_legs: 3 },
      { upper_back: 4, hips_legs: 5 },
    ],
    [
      { upper_back: 0, hips_legs: 3 },
      { upper_back: 1, hips_legs: 12 },
    ],
    [
      { upper_back: 5, hips_legs: 3 },
      { upper_back: 1, hips_legs: 12 },
    ],
    [
      { upper_back: 2, hips_legs: 1 },
      { upper_back: 1, hips_legs: 12 },
    ],
  ] as [DiscomfortLevels, Record<string, number>][])(
    'does not propose a change without enough evidence or room in the scale',
    (priorities, counts) => {
      expect(proposePriorityRebalance(priorities, stats(counts), areas)).toBeUndefined();
    },
  );

  it('preserves the total and active range across every pair of values', () => {
    for (let back = 0; back <= 5; back++) {
      for (let legs = 0; legs <= 5; legs++) {
        const priorities = {
          upper_back: back,
          hips_legs: legs,
        } as DiscomfortLevels;
        const proposal = proposePriorityRebalance(
          priorities,
          stats({ upper_back: 2, hips_legs: 12 }),
          areas,
        );
        if (!proposal) continue;
        expect(proposal.reduce((total, change) => total + change.to - change.from, 0)).toBe(0);
        for (const change of proposal) {
          expect(Math.abs(change.to - change.from)).toBe(1);
          expect(change.from).toBeGreaterThan(0);
          expect(change.to).toBeGreaterThanOrEqual(1);
          expect(change.to).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});
