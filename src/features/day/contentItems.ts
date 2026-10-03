import { CATALOG } from '@/content/catalog';
import type { ActivityContent, ActivitySlot, Exercise } from '@/domain/types';

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
      exercises([step.exerciseId]).map((exercise) => ({ exercise, seconds: step.seconds })),
    );
  }
  return [];
}

/** "Si puedes, hazlo mejor de pie": moves that work seated too, outside meetings. */
export function suggestsStanding(exercises: readonly Exercise[], slot?: ActivitySlot): boolean {
  return slot !== 'meeting' && exercises.some((exercise) => exercise.posture === 'either');
}
