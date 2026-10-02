import { PAUSE_SIZE, SELECTION } from '../config';
import { weightedPick, type Rng } from '../rng';
import {
  BODY_AREAS,
  type ActivitySlot,
  type BodyArea,
  type DiscomfortLevels,
  type EquipmentId,
  type Exercise,
  type PauseType,
  type Routine,
} from '../types';

export interface ExerciseFilter {
  equipment: readonly EquipmentId[];
  /** Where the pause happens: floor work needs a real break; meetings need quiet moves. */
  slot: ActivitySlot;
  minDurationSec?: number;
  maxDurationSec?: number;
}

export interface SelectionContext extends ExerciseFilter {
  discomfort: DiscomfortLevels;
  /** Exercise of the previous pause: never repeated back to back (if avoidable). */
  previousExerciseId?: string;
  /** Area of the previous pause: avoided unless it clearly dominates the sliders. */
  previousArea?: BodyArea;
  /** Recently used exercises get a lower weight to rotate the catalog. */
  recentExerciseIds?: readonly string[];
}

export interface ExercisePick {
  exercise: Exercise;
  area: BodyArea;
}

/** Sliders become weights; they change the mix of areas, never the number of pauses. */
export function areaWeights(discomfort: DiscomfortLevels): Record<BodyArea, number> {
  return Object.fromEntries(
    BODY_AREAS.map((area) => [
      area,
      SELECTION.areaBaseWeight + SELECTION.areaWeightPerLevel * discomfort[area],
    ]),
  ) as Record<BodyArea, number>;
}

export function hasEquipment(required: readonly EquipmentId[], available: readonly EquipmentId[]) {
  return required.every((item) => available.includes(item));
}

export function isExerciseEligible(exercise: Exercise, filter: ExerciseFilter): boolean {
  if (!hasEquipment(exercise.equipment, filter.equipment)) return false;
  if (filter.minDurationSec !== undefined && exercise.durationSec < filter.minDurationSec)
    return false;
  if (filter.maxDurationSec !== undefined && exercise.durationSec > filter.maxDurationSec)
    return false;
  switch (filter.slot) {
    case 'work':
      return exercise.posture !== 'floor';
    case 'meeting':
      return exercise.meetingFriendly !== 'no' && exercise.posture !== 'floor';
    case 'break':
      return true;
  }
}

/**
 * Weighted area choice. The previous area is excluded unless its weight is dominant
 * (or it is the only area left), so consecutive pauses vary the body zone.
 */
export function pickArea(
  weights: Record<BodyArea, number>,
  candidates: readonly BodyArea[],
  rng: Rng,
  previousArea?: BodyArea,
): BodyArea | undefined {
  let pool = candidates;
  if (previousArea && candidates.includes(previousArea)) {
    const others = candidates.filter((area) => area !== previousArea);
    const othersWeight = others.reduce((sum, area) => sum + weights[area], 0);
    const dominant = weights[previousArea] >= SELECTION.areaRepeatDominance * othersWeight;
    if (others.length > 0 && !dominant) pool = others;
  }
  return weightedPick(pool, (area) => weights[area], rng);
}

/** Chooses a body area by the sliders, then a varied exercise for it. */
export function pickExercise(
  exercises: readonly Exercise[],
  context: SelectionContext,
  rng: Rng,
): ExercisePick | undefined {
  const eligible = exercises.filter((exercise) => isExerciseEligible(exercise, context));
  const candidates = BODY_AREAS.filter((area) =>
    eligible.some((exercise) => exercise.areas.includes(area)),
  );
  const area = pickArea(areaWeights(context.discomfort), candidates, rng, context.previousArea);
  if (!area) return undefined;

  const inArea = eligible.filter((exercise) => exercise.areas.includes(area));
  const fresh = inArea.filter((exercise) => exercise.id !== context.previousExerciseId);
  const pool = fresh.length > 0 ? fresh : inArea;
  const recent = new Set(context.recentExerciseIds ?? []);
  const exercise = weightedPick(
    pool,
    (item) => (recent.has(item.id) ? SELECTION.recentExerciseWeight : 1),
    rng,
  );
  return exercise ? { exercise, area } : undefined;
}

// ---------- Pause sizes ----------

export function routineDurationSec(routine: Routine): number {
  return routine.steps.reduce((sum, step) => sum + step.seconds, 0);
}

export function pauseTypeForDuration(seconds: number): PauseType {
  if (seconds <= PAUSE_SIZE.microMaxSec) return 'micro';
  if (seconds <= PAUSE_SIZE.resetMaxSec) return 'reset';
  return 'active';
}
