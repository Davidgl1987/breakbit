import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { contentAreas } from './contentItems';

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
      const main = routine.steps.map((step) => exercise(step.exerciseId).areas[0]);
      expect(areas).toEqual([...new Set(main)]);
      expect(new Set(areas).size).toBe(areas.length);
    }
  });
});
