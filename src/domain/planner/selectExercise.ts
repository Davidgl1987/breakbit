import { PAUSE_SIZE, SELECTION } from '../config';
import { weightedPick, type Rng } from '../rng';
import type {
  ActivitySlot,
  BodyArea,
  DiscomfortLevels,
  EquipmentId,
  Exercise,
  PauseType,
  Routine,
} from '../types';

export interface ExerciseFilter {
  equipment: readonly EquipmentId[];
  /** Where the pause happens: floor work needs a real break; meetings need quiet moves. */
  slot: ActivitySlot;
  /** Time the user chose to move ("Tengo un hueco"): floor work fits outside meetings too. */
  freeTime?: boolean;
  /** Only moves that get the user up (posture 'standing'). */
  standingOnly?: boolean;
  minDurationSec?: number;
  maxDurationSec?: number;
}

export interface SelectionContext extends ExerciseFilter {
  discomfort: DiscomfortLevels;
  /** Exercises of the previous pause: never repeated back to back (if avoidable). */
  previousExerciseIds?: readonly string[];
  /** Area of the previous pause: avoided unless it clearly dominates the sliders. */
  previousArea?: BodyArea;
  /** Recently used exercises get a lower weight to rotate the catalog. */
  recentExerciseIds?: readonly string[];
}

export interface ExercisePick {
  exercise: Exercise;
  area: BodyArea;
}

/**
 * When a pause happens, for the weights: at the desk (work time or a meeting), in a
 * configured break, or in free time the user chose ("Tengo un hueco").
 */
export type Setting = 'desk' | 'break' | 'free';

export function settingOf(filter: Pick<ExerciseFilter, 'slot' | 'freeTime'>): Setting {
  if (filter.freeTime) return 'free';
  return filter.slot === 'break' ? 'break' : 'desk';
}

/** A slider becomes a weight; it changes the mix of areas, never the number of pauses. */
export function areaWeight(discomfort: DiscomfortLevels, area: BodyArea): number {
  return SELECTION.areaBaseWeight + SELECTION.areaWeightPerLevel * (discomfort[area] ?? 0);
}

export function hasEquipment(required: readonly EquipmentId[], available: readonly EquipmentId[]) {
  return required.every((item) => available.includes(item));
}

/**
 * Hard rules: the user has the equipment; in a meeting only meeting-friendly moves
 * ('yes' or 'partial': meetings with pauses are the "puedo moverme" ones) and never on
 * the floor; floor work only in a break or chosen free time.
 */
export function isExerciseEligible(exercise: Exercise, filter: ExerciseFilter): boolean {
  if (!hasEquipment(exercise.equipment, filter.equipment)) return false;
  if (filter.minDurationSec !== undefined && exercise.durationSec < filter.minDurationSec)
    return false;
  if (filter.maxDurationSec !== undefined && exercise.durationSec > filter.maxDurationSec)
    return false;
  if (filter.standingOnly && exercise.posture !== 'standing') return false;
  if (filter.slot === 'meeting')
    return exercise.meetingFriendly !== 'no' && exercise.posture !== 'floor';
  if (exercise.posture === 'floor') return filter.slot === 'break' || filter.freeTime === true;
  return true;
}

/**
 * Soft preferences, as a weight: equipment and floor work are less likely at the desk
 * (gear-free 'standing' and 'either' moves are the base of the day), and more so in a
 * break or chosen free time.
 */
export function contextWeight(
  exercise: Exercise,
  filter: Pick<ExerciseFilter, 'slot' | 'freeTime'>,
): number {
  const setting = settingOf(filter);
  let weight = 1;
  if (exercise.equipment.length > 0) weight *= SELECTION.equipmentWeight[setting];
  if (exercise.posture === 'floor' && setting !== 'desk') weight *= SELECTION.floorWeight[setting];
  return weight;
}

/** How much an exercise counts for an area: fully for its main area, less for the others. */
export function areaRankWeight(exercise: Exercise, area: BodyArea): number {
  const rank = exercise.areas.indexOf(area);
  if (rank < 0) return 0;
  const weights = SELECTION.areaRankWeights;
  return weights[Math.min(rank, weights.length - 1)]!;
}

/**
 * Weighted area choice. The previous area is excluded unless its weight is dominant
 * (or it is the only area left), so consecutive pauses vary the body zone.
 */
export function pickArea(
  discomfort: DiscomfortLevels,
  candidates: readonly BodyArea[],
  rng: Rng,
  previousArea?: BodyArea,
): BodyArea | undefined {
  const weight = (area: BodyArea) => areaWeight(discomfort, area);
  let pool = candidates;
  if (previousArea && candidates.includes(previousArea)) {
    const others = candidates.filter((area) => area !== previousArea);
    const othersWeight = others.reduce((sum, area) => sum + weight(area), 0);
    const dominant = weight(previousArea) >= SELECTION.areaRepeatDominance * othersWeight;
    if (others.length > 0 && !dominant) pool = others;
  }
  return weightedPick(pool, weight, rng);
}

/**
 * Chooses a body area by the sliders, then a varied exercise for it (its main area
 * first, gear-free desk moves before equipment or floor work). Exercises of the previous
 * pause are left out whenever anything else fits, so no area is chosen just to repeat
 * one of them.
 */
export function pickExercise(
  exercises: readonly Exercise[],
  context: SelectionContext,
  rng: Rng,
): ExercisePick | undefined {
  const eligible = exercises.filter((exercise) => isExerciseEligible(exercise, context));
  const avoid = new Set(context.previousExerciseIds ?? []);
  const fresh = eligible.filter((exercise) => !avoid.has(exercise.id));
  const pool = fresh.length > 0 ? fresh : eligible;

  const candidates = [...new Set(pool.flatMap((exercise) => exercise.areas))];
  const area = pickArea(context.discomfort, candidates, rng, context.previousArea);
  if (!area) return undefined;

  const recent = new Set(context.recentExerciseIds ?? []);
  const exercise = weightedPick(
    pool.filter((item) => item.areas.includes(area)),
    (item) =>
      areaRankWeight(item, area) *
      contextWeight(item, context) *
      (recent.has(item.id) ? SELECTION.recentExerciseWeight : 1),
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
