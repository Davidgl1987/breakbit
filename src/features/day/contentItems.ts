import { CATALOG } from '@/content/catalog';
import type { ActivityContent, ActivitySlot, BodyArea, Exercise } from '@/domain/types';

export interface ContentItem {
  exercise: Exercise;
  seconds: number;
}

/** The moves of a pause, in order: one exercise, a combined reset or a routine's steps. */
export function contentItems(content: ActivityContent): ContentItem[] {
  const exercises = (ids: readonly string[]) =>
    ids
      .map((id) => CATALOG.exercises.find((exercise) => exercise.id === id))
      .filter((exercise): exercise is Exercise => exercise !== undefined);
  if (content.kind === 'exercises') {
    return exercises(content.exerciseIds).map((exercise) => ({
      exercise,
      seconds: exercise.durationSec,
    }));
  }
  if (content.kind === 'routine') {
    const routineId = content.routineId;
    const routine = CATALOG.routines.find((item) => item.id === routineId);
    return (routine?.steps ?? []).flatMap((step) =>
      exercises([step.exercise]).map((exercise) => ({ exercise, seconds: step.seconds })),
    );
  }
  return [];
}

/**
 * What a pause is for: the main area of each move (the first the catalog lists), in order
 * and each once. One exercise gives one; a routine, one per area its moves aim at.
 */
export function contentAreas(content: ActivityContent): BodyArea[] {
  const main = contentItems(content).flatMap((item) => item.exercise.areas.slice(0, 1));
  return [...new Set(main)];
}

/** "Si puedes, hazlo mejor de pie": moves that work seated too, outside meetings. */
export function suggestsStanding(exercises: readonly Exercise[], slot?: ActivitySlot): boolean {
  return slot !== 'meeting' && exercises.some((exercise) => exercise.posture === 'either');
}
