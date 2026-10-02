import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeExercise } from '@/test/builders';
import { createRng } from '../rng';
import {
  BODY_AREAS,
  EQUIPMENT,
  type ActivitySlot,
  type BodyArea,
  type DiscomfortLevel,
  type DiscomfortLevels,
} from '../types';
import {
  areaWeights,
  isExerciseEligible,
  pauseTypeForDuration,
  pickArea,
  pickExercise,
  routineDurationSec,
  type SelectionContext,
} from './selectExercise';

const flat = (level: DiscomfortLevel): DiscomfortLevels =>
  Object.fromEntries(BODY_AREAS.map((area) => [area, level])) as DiscomfortLevels;

const baseContext: SelectionContext = { discomfort: flat(0), equipment: [], slot: 'work' };

describe('areaWeights', () => {
  it('keeps a base weight and grows with the slider', () => {
    const weights = areaWeights({ ...flat(0), neck: 5, eyes: 2 });
    expect(weights.neck).toBe(11);
    expect(weights.eyes).toBe(5);
    expect(weights.wrists).toBe(1);
  });
});

describe('isExerciseEligible', () => {
  const floor = makeExercise({ id: 'floor', posture: 'floor', equipment: ['mat'] });
  const loud = makeExercise({ id: 'loud', posture: 'standing', meetingFriendly: 'no' });
  const quiet = makeExercise({ id: 'quiet', meetingFriendly: 'partial' });

  it('requires all of the exercise equipment', () => {
    expect(isExerciseEligible(floor, { equipment: [], slot: 'break' })).toBe(false);
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'break' })).toBe(true);
  });

  it('keeps floor work for real breaks', () => {
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'work' })).toBe(false);
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'meeting' })).toBe(false);
  });

  it('only allows meeting-friendly moves during meetings', () => {
    expect(isExerciseEligible(loud, { equipment: [], slot: 'meeting' })).toBe(false);
    expect(isExerciseEligible(quiet, { equipment: [], slot: 'meeting' })).toBe(true);
  });

  it('respects duration limits', () => {
    const filter = { equipment: [], slot: 'work' as const, minDurationSec: 30, maxDurationSec: 40 };
    expect(isExerciseEligible(makeExercise({ id: 'a', durationSec: 40 }), filter)).toBe(true);
    expect(isExerciseEligible(makeExercise({ id: 'b', durationSec: 45 }), filter)).toBe(false);
    expect(isExerciseEligible(makeExercise({ id: 'c', durationSec: 25 }), filter)).toBe(false);
  });
});

describe('pickArea', () => {
  it('avoids repeating the previous area when others are relevant', () => {
    const weights = areaWeights({ ...flat(1), neck: 5 });
    for (let seed = 0; seed < 200; seed++) {
      expect(pickArea(weights, BODY_AREAS, createRng(`s${seed}`), 'neck')).not.toBe('neck');
    }
  });

  it('allows a repeat when the previous area clearly dominates', () => {
    // neck 11 vs. five other areas at weight 1 → 11 ≥ 2 × 5.
    const weights = areaWeights({ ...flat(0), neck: 5 });
    const picks = new Set<BodyArea | undefined>();
    for (let seed = 0; seed < 200; seed++) {
      picks.add(pickArea(weights, BODY_AREAS, createRng(`s${seed}`), 'neck'));
    }
    expect(picks.has('neck')).toBe(true);
  });

  it('repeats when it is the only candidate', () => {
    expect(pickArea(areaWeights(flat(0)), ['eyes'], createRng('x'), 'eyes')).toBe('eyes');
  });

  it('favours higher sliders', () => {
    const weights = areaWeights({ ...flat(0), eyes: 5 });
    let eyes = 0;
    for (let seed = 0; seed < 2000; seed++) {
      if (pickArea(weights, BODY_AREAS, createRng(`w${seed}`)) === 'eyes') eyes++;
    }
    // eyes weighs 11 of 16 ≈ 69 %.
    expect(eyes / 2000).toBeGreaterThan(0.6);
    expect(eyes / 2000).toBeLessThan(0.78);
  });
});

describe('pickExercise', () => {
  const discomfortArb = fc.record(
    Object.fromEntries(BODY_AREAS.map((area) => [area, fc.integer({ min: 0, max: 5 })])) as Record<
      BodyArea,
      fc.Arbitrary<DiscomfortLevel>
    >,
  );
  const contextArb = fc.record({
    discomfort: discomfortArb,
    equipment: fc.subarray([...EQUIPMENT]),
    slot: fc.constantFrom<ActivitySlot>('work', 'break', 'meeting'),
    previous: fc.option(fc.constantFrom(...CATALOG.exercises.map((exercise) => exercise.id)), {
      nil: undefined,
    }),
    seed: fc.string(),
  });

  it('always returns an eligible exercise covering the chosen area', () => {
    fc.assert(
      fc.property(contextArb, ({ discomfort, equipment, slot, previous, seed }) => {
        const context: SelectionContext = {
          discomfort,
          equipment,
          slot,
          previousExerciseId: previous,
        };
        const pick = pickExercise(CATALOG.exercises, context, createRng(seed));
        expect(pick).toBeDefined();
        expect(isExerciseEligible(pick!.exercise, context)).toBe(true);
        expect(pick!.exercise.areas).toContain(pick!.area);
      }),
    );
  });

  it('never repeats the previous exercise when alternatives exist', () => {
    fc.assert(
      fc.property(contextArb, ({ discomfort, equipment, slot, previous, seed }) => {
        const context: SelectionContext = {
          discomfort,
          equipment,
          slot,
          previousExerciseId: previous,
        };
        const pick = pickExercise(CATALOG.exercises, context, createRng(seed));
        expect(pick?.exercise.id).not.toBe(previous);
      }),
    );
  });

  it('uses the same exercise only if nothing else fits', () => {
    const only = makeExercise({ id: 'only', areas: ['eyes'] });
    const pick = pickExercise(
      [only],
      { ...baseContext, previousExerciseId: 'only' },
      createRng('x'),
    );
    expect(pick?.exercise.id).toBe('only');
  });

  it('rotates away from recently used exercises', () => {
    const a = makeExercise({ id: 'a', areas: ['eyes'] });
    const b = makeExercise({ id: 'b', areas: ['eyes'] });
    let picksOfA = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const pick = pickExercise(
        [a, b],
        { ...baseContext, recentExerciseIds: ['a'] },
        createRng(`r${seed}`),
      );
      if (pick?.exercise.id === 'a') picksOfA++;
    }
    // a weighs 0.25 vs. 1 → ≈ 20 %.
    expect(picksOfA / 1000).toBeGreaterThan(0.14);
    expect(picksOfA / 1000).toBeLessThan(0.26);
  });

  it('returns undefined when nothing is eligible', () => {
    const floorOnly = makeExercise({ id: 'f', posture: 'floor' });
    expect(pickExercise([floorOnly], baseContext, createRng('x'))).toBeUndefined();
  });

  it('is deterministic for the same seed', () => {
    const context: SelectionContext = { ...baseContext, discomfort: { ...flat(2), neck: 4 } };
    const first = pickExercise(CATALOG.exercises, context, createRng('2026-10-02#0'));
    const second = pickExercise(CATALOG.exercises, context, createRng('2026-10-02#0'));
    expect(second).toEqual(first);
  });
});

describe('pause sizes', () => {
  it('classifies durations as micro, reset or active', () => {
    expect(pauseTypeForDuration(30)).toBe('micro');
    expect(pauseTypeForDuration(60)).toBe('micro');
    expect(pauseTypeForDuration(90)).toBe('reset');
    expect(pauseTypeForDuration(120)).toBe('reset');
    expect(pauseTypeForDuration(180)).toBe('active');
  });

  it('sizes the master routines as specified (2 min resets, 3 min active)', () => {
    const size = (id: string) => {
      const routine = CATALOG.routines.find((item) => item.id === id)!;
      return pauseTypeForDuration(routineDurationSec(routine));
    };
    expect(size('wake_up')).toBe('reset');
    expect(size('desk_reset')).toBe('reset');
    expect(size('active_legs')).toBe('reset');
    expect(size('active_reset')).toBe('active');
  });
});
