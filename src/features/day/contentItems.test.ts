import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { contentAreas, contentItems } from './contentItems';

const exercise = (id: string) => CATALOG.exercises.find((item) => item.id === id)!;

describe('contentAreas', () => {
  it('gives an exercise its main area only', () => {
    const several = CATALOG.exercises.find((item) => item.areas.length > 1)!;
    expect(contentAreas({ kind: 'exercises', exerciseIds: [several.id] })).toEqual([
      several.areas[0],
    ]);
  });

  it('gives a routine the main area of each move, in order and each once', () => {
    for (const routine of CATALOG.routines) {
      const areas = contentAreas({ kind: 'routine', routineId: routine.id });
      const main = routine.steps.map((step) => exercise(step.exercise).areas[0]);
      expect(areas).toEqual([...new Set(main)]);
      expect(new Set(areas).size).toBe(areas.length);
    }
  });
});

describe('contentItems', () => {
  it('goes through a routine whole for each round', () => {
    const once = contentItems({ kind: 'routine', routineId: 'mobility_5' });
    expect(once.map((item) => item.seconds)).toEqual([60, 60, 60, 60, 60]);
    const twice = contentItems({ kind: 'routine', routineId: 'mobility_5', rounds: 2 });
    expect(twice.map((item) => item.exercise.id)).toEqual([
      ...once.map((item) => item.exercise.id),
      ...once.map((item) => item.exercise.id),
    ]);
  });
});
