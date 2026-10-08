import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeExercise } from '@/test/builders';
import { PAUSE_SIZE } from '../config';
import { createRng } from '../rng';
import type { Catalog, DiscomfortLevels } from '../types';
import {
  choosePauseContent,
  contentExerciseIds,
  isContentValidFor,
  pauseRoutines,
  pauseShape,
  replacementShape,
  type VarietyState,
} from './pauseContent';

const discomfort = Object.fromEntries(
  CATALOG.areas.map((area) => [area.id, 2]),
) as DiscomfortLevels;
const context = { catalog: CATALOG, discomfort, equipment: [] };
const fresh: VarietyState = { previousExerciseIds: [], recentExerciseIds: [], usedRoutineIds: [] };
const exercise = (id: string) => CATALOG.exercises.find((item) => item.id === id)!;
const durationOf = (id: string) => exercise(id).durationSec;
const idsOf = (chosen: ReturnType<typeof choosePauseContent>) =>
  chosen?.content.kind === 'exercises' ? chosen.content.exerciseIds : [];

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

  it('gets the user up in a single pause when asked', () => {
    for (let seed = 0; seed < 100; seed++) {
      const chosen = choosePauseContent('single', 'work', context, fresh, createRng(`u${seed}`), {
        standing: true,
      });
      const ids = idsOf(chosen);
      expect(ids).toHaveLength(1);
      expect(exercise(ids[0]!).posture).toBe('standing');
    }
  });

  it('combines up to 4 different exercises into a 90–120 s reset that gets the user up', () => {
    for (let seed = 0; seed < 100; seed++) {
      const chosen = choosePauseContent('combined', 'work', context, fresh, createRng(`c${seed}`))!;
      const ids = idsOf(chosen);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(1);
      expect(ids.length).toBeLessThanOrEqual(4);
      expect(exercise(ids[0]!).posture).toBe('standing');
      expect(chosen.durationSec).toBe(ids.reduce((sum, id) => sum + durationOf(id), 0));
      expect(chosen.durationSec).toBeGreaterThanOrEqual(PAUSE_SIZE.resetMinSec);
      expect(chosen.durationSec).toBeLessThanOrEqual(PAUSE_SIZE.resetMaxSec);
    }
  });

  it('lets a longer move, like a short walk, be a reset on its own', () => {
    const walk = makeExercise({ id: 'walk', durationSec: 90, posture: 'standing' });
    const chosen = choosePauseContent(
      'combined',
      'work',
      { ...context, catalog: { ...CATALOG, exercises: [walk] } },
      fresh,
      createRng('w'),
    );
    expect(idsOf(chosen)).toEqual(['walk']);
    expect(chosen?.durationSec).toBe(90);
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
    const previousExerciseIds = pauseRoutines('break', context).flatMap((routine) =>
      routine.steps.slice(0, 1).map((step) => step.exercise),
    );
    const chosen = choosePauseContent(
      'routine',
      'break',
      context,
      { ...fresh, previousExerciseIds },
      createRng('p'),
    );
    expect(chosen?.content.kind).toBe('exercises');
  });

  it('only uses routines of up to 3 minutes whose moves suit the slot and equipment', () => {
    const ids = (equipment: string[], freeTime = false) =>
      pauseRoutines('work', { catalog: CATALOG, equipment }, { freeTime }).map(
        (routine) => routine.id,
      );
    expect(ids([])).not.toContain('mobility_5');
    expect(ids([])).not.toContain('band_upper_reset');
    expect(ids(['resistance_band'])).toContain('band_upper_reset');
    // Floor work needs a real break, or time the user chose.
    expect(ids(['mat'])).not.toContain('floor_reset');
    expect(ids(['mat'], true)).toContain('floor_reset');
  });

  it('favours routines aimed at the areas with higher sliders', () => {
    let wrists = 0;
    for (let seed = 0; seed < 500; seed++) {
      const chosen = choosePauseContent(
        'routine',
        'break',
        { ...context, discomfort: { wrists: 5 } },
        fresh,
        createRng(`h${seed}`),
      );
      if (chosen?.content.kind === 'routine' && chosen.content.routineId === 'wrists_reset')
        wrists++;
    }
    expect(wrists / 500).toBeGreaterThan(0.5);
  });

  it('falls back to a combined reset when every routine was used', () => {
    const allUsed = { ...fresh, usedRoutineIds: CATALOG.routines.map((routine) => routine.id) };
    const chosen = choosePauseContent('routine', 'break', context, allUsed, createRng('f'));
    expect(chosen?.content.kind).toBe('exercises');
  });

  it('returns nothing when no exercise fits', () => {
    const empty: Catalog = {
      areas: [],
      equipment: [],
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
      'desk_thoracic_extension',
      'side_reach',
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
    const dumbbells = { kind: 'exercises' as const, exerciseIds: ['dumbbell_shrug'] };
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
