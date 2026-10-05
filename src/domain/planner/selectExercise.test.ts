import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeExercise } from '@/test/builders';
import { createRng } from '../rng';
import type { ActivitySlot, BodyArea, DiscomfortLevel, DiscomfortLevels } from '../types';
import {
  areaRankWeight,
  areaWeight,
  contextWeight,
  isExerciseEligible,
  pauseTypeForDuration,
  pickArea,
  pickExercise,
  routineDurationSec,
  type SelectionContext,
} from './selectExercise';

const AREAS = CATALOG.areas.map((area) => area.id);
const EQUIPMENT = CATALOG.equipment.map((item) => item.id);

const flat = (level: DiscomfortLevel): DiscomfortLevels =>
  Object.fromEntries(AREAS.map((area) => [area, level])) as DiscomfortLevels;

const baseContext: SelectionContext = { discomfort: {}, equipment: [], slot: 'work' };

describe('areaWeight', () => {
  it('keeps a base weight and grows with the slider', () => {
    const discomfort = { neck: 5, eyes: 2 } as const;
    expect(areaWeight(discomfort, 'neck')).toBe(11);
    expect(areaWeight(discomfort, 'eyes')).toBe(5);
    expect(areaWeight(discomfort, 'wrists')).toBe(1);
  });
});

describe('areaRankWeight', () => {
  it('counts an exercise fully for its main area and less for the next ones', () => {
    const exercise = makeExercise({ id: 'x', areas: ['upper_back', 'lower_back', 'hips_legs'] });
    expect(areaRankWeight(exercise, 'upper_back')).toBe(1);
    expect(areaRankWeight(exercise, 'lower_back')).toBe(0.6);
    expect(areaRankWeight(exercise, 'hips_legs')).toBe(0.4);
    expect(areaRankWeight(exercise, 'neck')).toBe(0);
  });
});

describe('contextWeight', () => {
  const gear = makeExercise({ id: 'gear', posture: 'standing', equipment: ['dumbbells'] });
  const floor = makeExercise({ id: 'floor', posture: 'floor', equipment: ['mat'] });
  const plain = makeExercise({ id: 'plain', posture: 'standing' });

  it('keeps gear-free moves as the base of the day', () => {
    expect(contextWeight(plain, { slot: 'work' })).toBe(1);
    expect(contextWeight(plain, { slot: 'break' })).toBe(1);
  });

  it('makes equipment rare at the desk and likelier with more time', () => {
    expect(contextWeight(gear, { slot: 'work' })).toBe(0.15);
    expect(contextWeight(gear, { slot: 'meeting' })).toBe(0.15);
    expect(contextWeight(gear, { slot: 'break' })).toBe(0.6);
    expect(contextWeight(gear, { slot: 'work', freeTime: true })).toBe(0.8);
  });

  it('gives floor work less weight in a planned break than in a chosen gap', () => {
    expect(contextWeight(floor, { slot: 'break' })).toBeCloseTo(0.6 * 0.4);
    expect(contextWeight(floor, { slot: 'work', freeTime: true })).toBeCloseTo(0.8);
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

  it('keeps floor work for real breaks and chosen free time, never meetings', () => {
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'work' })).toBe(false);
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'meeting' })).toBe(false);
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'work', freeTime: true })).toBe(
      true,
    );
    expect(isExerciseEligible(floor, { equipment: ['mat'], slot: 'meeting', freeTime: true })).toBe(
      false,
    );
  });

  it('only allows meeting-friendly moves during meetings', () => {
    const yes = makeExercise({ id: 'yes', meetingFriendly: 'yes' });
    expect(isExerciseEligible(loud, { equipment: [], slot: 'meeting' })).toBe(false);
    expect(isExerciseEligible(quiet, { equipment: [], slot: 'meeting' })).toBe(true);
    expect(isExerciseEligible(yes, { equipment: [], slot: 'meeting' })).toBe(true);
  });

  it('can ask for moves that get the user up', () => {
    const filter = { equipment: [], slot: 'work' as const, standingOnly: true };
    expect(isExerciseEligible(loud, filter)).toBe(true);
    expect(isExerciseEligible(quiet, filter)).toBe(false);
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
    const discomfort: DiscomfortLevels = { ...flat(1), neck: 5 };
    for (let seed = 0; seed < 200; seed++) {
      expect(pickArea(discomfort, AREAS, createRng(`s${seed}`), 'neck')).not.toBe('neck');
    }
  });

  it('allows a repeat when the previous area clearly dominates', () => {
    // neck 11 vs. three other areas at weight 1 → 11 ≥ 2 × 3.
    const picks = new Set<BodyArea | undefined>();
    for (let seed = 0; seed < 200; seed++) {
      picks.add(
        pickArea(
          { neck: 5 },
          ['neck', 'eyes', 'wrists', 'shoulders'],
          createRng(`s${seed}`),
          'neck',
        ),
      );
    }
    expect(picks.has('neck')).toBe(true);
  });

  it('repeats when it is the only candidate', () => {
    expect(pickArea({}, ['eyes'], createRng('x'), 'eyes')).toBe('eyes');
  });

  it('favours higher sliders', () => {
    let eyes = 0;
    for (let seed = 0; seed < 2000; seed++) {
      if (pickArea({ eyes: 5 }, AREAS, createRng(`w${seed}`)) === 'eyes') eyes++;
    }
    // eyes weighs 11 of 17 ≈ 65 %.
    expect(eyes / 2000).toBeGreaterThan(0.57);
    expect(eyes / 2000).toBeLessThan(0.73);
  });

  it('treats an area without a value as 0', () => {
    let neck = 0;
    for (let seed = 0; seed < 2000; seed++) {
      if (pickArea({}, ['neck', 'eyes'], createRng(`z${seed}`)) === 'neck') neck++;
    }
    expect(neck / 2000).toBeGreaterThan(0.44);
    expect(neck / 2000).toBeLessThan(0.56);
  });
});

describe('pickExercise', () => {
  const discomfortArb = fc.record(
    Object.fromEntries(AREAS.map((area) => [area, fc.integer({ min: 0, max: 5 })])) as Record<
      BodyArea,
      fc.Arbitrary<DiscomfortLevel>
    >,
  );
  const contextArb = fc.record({
    discomfort: discomfortArb,
    equipment: fc.subarray(EQUIPMENT),
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
          previousExerciseIds: previous ? [previous] : [],
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
          previousExerciseIds: previous ? [previous] : [],
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
      { ...baseContext, previousExerciseIds: ['only'] },
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

  it('prefers an exercise whose main area is the chosen one', () => {
    const main = makeExercise({ id: 'main', areas: ['eyes'] });
    const side = makeExercise({ id: 'side', areas: ['neck', 'eyes'] });
    let mains = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const pick = pickExercise(
        [main, side],
        { ...baseContext, discomfort: { eyes: 5 } },
        createRng(`m${seed}`),
      );
      if (pick?.area === 'eyes' && pick.exercise.id === 'main') mains++;
    }
    // Eyes picked ≈ 92 % (11 vs 1); within it, main 1 vs side 0.6 → ≈ 58 % overall.
    expect(mains / 1000).toBeGreaterThan(0.5);
  });

  it('keeps equipment occasional at the desk even when all of it is at hand', () => {
    let withGear = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const pick = pickExercise(
        CATALOG.exercises,
        { ...baseContext, equipment: EQUIPMENT },
        createRng(`g${seed}`),
      );
      if (pick && pick.exercise.equipment.length > 0) withGear++;
    }
    expect(withGear / 2000).toBeGreaterThan(0.02);
    expect(withGear / 2000).toBeLessThan(0.25);
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

  it('adds up a routine from its steps', () => {
    expect(
      routineDurationSec({
        id: 'r',
        name: { es: 'r', en: 'r' },
        steps: [
          { exercise: 'a', seconds: 30 },
          { exercise: 'b', seconds: 45 },
        ],
      }),
    ).toBe(75);
  });
});
