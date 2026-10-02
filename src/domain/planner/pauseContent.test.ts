import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeExercise } from '@/test/builders';
import { PAUSE_SIZE } from '../config';
import { createRng } from '../rng';
import { BODY_AREAS, type Catalog, type DiscomfortLevels } from '../types';
import {
  choosePauseContent,
  contentExerciseIds,
  isContentValidFor,
  pauseShape,
  replacementShape,
  type VarietyState,
} from './pauseContent';

const discomfort = Object.fromEntries(BODY_AREAS.map((area) => [area, 2])) as DiscomfortLevels;
const context = { catalog: CATALOG, discomfort, equipment: [] };
const fresh: VarietyState = { previousExerciseIds: [], recentExerciseIds: [], usedRoutineIds: [] };
const durationOf = (id: string) =>
  CATALOG.exercises.find((exercise) => exercise.id === id)!.durationSec;

describe('pauseShape', () => {
  it('uses discreet single moves in meetings and routines in breaks', () => {
    expect(pauseShape('meeting', 2)).toBe('single');
    expect(pauseShape('break', 0)).toBe('routine');
  });

  it('makes every third work pause a combined reset', () => {
    expect([0, 1, 2, 3, 4, 5].map((index) => pauseShape('work', index))).toEqual([
      'single',
      'single',
      'combined',
      'single',
      'single',
      'combined',
    ]);
  });
});

describe('choosePauseContent', () => {
  it('picks one short exercise for a single pause', () => {
    const chosen = choosePauseContent('single', 'work', context, fresh, createRng('s'));
    expect(chosen?.content.kind).toBe('exercises');
    expect(chosen?.content.kind === 'exercises' && chosen.content.exerciseIds).toHaveLength(1);
    expect(chosen!.durationSec).toBeLessThanOrEqual(PAUSE_SIZE.microMaxSec);
  });

  it('combines 2–4 different exercises into a 90–120 s reset', () => {
    for (let seed = 0; seed < 100; seed++) {
      const chosen = choosePauseContent('combined', 'work', context, fresh, createRng(`c${seed}`))!;
      if (chosen.content.kind !== 'exercises') throw new Error('expected exercises');
      const ids = chosen.content.exerciseIds;
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(2);
      expect(ids.length).toBeLessThanOrEqual(4);
      expect(chosen.durationSec).toBe(ids.reduce((sum, id) => sum + durationOf(id), 0));
      expect(chosen.durationSec).toBeGreaterThanOrEqual(PAUSE_SIZE.resetMinSec);
      expect(chosen.durationSec).toBeLessThanOrEqual(PAUSE_SIZE.resetMaxSec);
    }
  });

  it('chooses a dynamic routine in a break, not repeating one used today', () => {
    const first = choosePauseContent('routine', 'break', context, fresh, createRng('r'))!;
    expect(first.content.kind).toBe('routine');
    const usedId = first.content.kind === 'routine' ? first.content.routineId : '';
    const second = choosePauseContent('routine', 'break', context, first.state, createRng('r'))!;
    expect(second.content).not.toEqual(first.content);
    expect(first.state.usedRoutineIds).toEqual([usedId]);
    // Every step of the routine counts as "previous" for the next pause.
    expect(first.state.previousExerciseIds.length).toBeGreaterThan(1);
  });

  it('skips routines that repeat an exercise from the previous pause', () => {
    // Every master routine includes "march" or "wave".
    const afterMarchAndWave = { ...fresh, previousExerciseIds: ['march', 'wave'] };
    const chosen = choosePauseContent(
      'routine',
      'break',
      context,
      afterMarchAndWave,
      createRng('p'),
    );
    expect(chosen?.content.kind).toBe('exercises');
  });

  it('falls back to a combined reset when every routine was used', () => {
    const allUsed = { ...fresh, usedRoutineIds: CATALOG.routines.map((routine) => routine.id) };
    const chosen = choosePauseContent('routine', 'break', context, allUsed, createRng('f'));
    expect(chosen?.content.kind).toBe('exercises');
  });

  it('returns nothing when no exercise fits', () => {
    const empty: Catalog = {
      exercises: [makeExercise({ id: 'floor', posture: 'floor' })],
      routines: [],
      mainActivities: [],
    };
    expect(
      choosePauseContent('single', 'work', { ...context, catalog: empty }, fresh, createRng('x')),
    ).toBeUndefined();
  });
});

describe('replacementShape', () => {
  it('keeps meetings discreet, uses routines in breaks and keeps the size in work time', () => {
    expect(replacementShape('meeting', 120)).toBe('single');
    expect(replacementShape('break', 40)).toBe('routine');
    expect(replacementShape('work', 40)).toBe('single');
    expect(replacementShape('work', 95)).toBe('combined');
  });
});

describe('contentExerciseIds', () => {
  it('expands routines and has no exercises for the main activity', () => {
    expect(contentExerciseIds({ kind: 'routine', routineId: 'desk_reset' }, CATALOG)).toEqual([
      'chest_opener',
      'high_twist',
      'golf_swing',
      'wave',
    ]);
    expect(contentExerciseIds({ kind: 'routine', routineId: 'nope' }, CATALOG)).toEqual([]);
    expect(contentExerciseIds({ kind: 'main', activityId: 'walk_outside' }, CATALOG)).toEqual([]);
  });
});

describe('isContentValidFor', () => {
  const withMat = { catalog: CATALOG, equipment: ['mat' as const] };

  it('keeps floor work for breaks', () => {
    const floor = { kind: 'exercises' as const, exerciseIds: ['child_pose'] };
    expect(isContentValidFor(floor, 'break', withMat)).toBe(true);
    expect(isContentValidFor(floor, 'work', withMat)).toBe(false);
  });

  it('requires discreet moves and no routines in meetings', () => {
    expect(
      isContentValidFor({ kind: 'exercises', exerciseIds: ['chin_tuck'] }, 'meeting', withMat),
    ).toBe(true);
    expect(
      isContentValidFor({ kind: 'exercises', exerciseIds: ['lunge'] }, 'meeting', withMat),
    ).toBe(false);
    expect(
      isContentValidFor({ kind: 'routine', routineId: 'desk_reset' }, 'meeting', withMat),
    ).toBe(false);
    expect(isContentValidFor({ kind: 'routine', routineId: 'desk_reset' }, 'work', withMat)).toBe(
      true,
    );
  });

  it('requires the equipment and known exercises', () => {
    const dumbbells = { kind: 'exercises' as const, exerciseIds: ['farmer_hold'] };
    expect(isContentValidFor(dumbbells, 'break', withMat)).toBe(false);
    expect(isContentValidFor({ kind: 'exercises', exerciseIds: ['nope'] }, 'work', withMat)).toBe(
      false,
    );
    expect(isContentValidFor({ kind: 'exercises', exerciseIds: [] }, 'work', withMat)).toBe(false);
    expect(isContentValidFor({ kind: 'main', activityId: 'walk_outside' }, 'work', withMat)).toBe(
      true,
    );
  });
});
