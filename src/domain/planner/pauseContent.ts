import { PAUSE_SIZE, PLANNER } from '../config';
import { weightedPick, type Rng } from '../rng';
import type {
  ActivityContent,
  ActivitySlot,
  BodyArea,
  Catalog,
  DiscomfortLevels,
  EquipmentId,
} from '../types';
import { isExerciseEligible, pickExercise, routineDurationSec } from './selectExercise';

export interface ContentContext {
  catalog: Catalog;
  discomfort: DiscomfortLevels;
  equipment: readonly EquipmentId[];
}

/** What has been used so far today, to keep consecutive pauses varied. */
export interface VarietyState {
  /** Every exercise of the previous pause. */
  previousExerciseIds: string[];
  previousArea?: BodyArea;
  recentExerciseIds: string[];
  usedRoutineIds: string[];
}

export interface ChosenContent {
  content: ActivityContent;
  durationSec: number;
  state: VarietyState;
}

export type PauseShape = 'single' | 'combined' | 'routine';

/**
 * Shape of a planned pause: discreet single moves in meetings, a dynamic routine in
 * a break, and in work time mostly single moves with every Nth one a combined reset.
 */
export function pauseShape(slot: ActivitySlot, workIndex: number): PauseShape {
  if (slot === 'meeting') return 'single';
  if (slot === 'break') return 'routine';
  return workIndex % PLANNER.resetEvery === PLANNER.resetEvery - 1 ? 'combined' : 'single';
}

/**
 * Shape of a replacement when a pause moves to a context its content doesn't suit,
 * keeping roughly its size in work time.
 */
export function replacementShape(slot: ActivitySlot, durationSec: number): PauseShape {
  if (slot === 'meeting') return 'single';
  if (slot === 'break') return 'routine';
  return durationSec > PAUSE_SIZE.microMaxSec ? 'combined' : 'single';
}

/** Every exercise a content asks for (routines expanded). */
export function contentExerciseIds(content: ActivityContent, catalog: Catalog): string[] {
  if (content.kind === 'exercises') return content.exerciseIds;
  if (content.kind === 'routine') {
    const routineId = content.routineId;
    return (
      catalog.routines
        .find((routine) => routine.id === routineId)
        ?.steps.map((step) => step.exerciseId) ?? []
    );
  }
  return [];
}

/**
 * Whether a pause's content can be done in `slot` with the user's equipment: no floor
 * work outside breaks, only discreet moves in meetings, no routines in meetings.
 */
export function isContentValidFor(
  content: ActivityContent,
  slot: ActivitySlot,
  context: Pick<ContentContext, 'catalog' | 'equipment'>,
): boolean {
  if (content.kind === 'main') return true;
  if (content.kind === 'routine' && slot === 'meeting') return false;
  const ids = contentExerciseIds(content, context.catalog);
  if (ids.length === 0) return false;
  return ids.every((id) => {
    const exercise = context.catalog.exercises.find((item) => item.id === id);
    return (
      exercise !== undefined && isExerciseEligible(exercise, { equipment: context.equipment, slot })
    );
  });
}

export function choosePauseContent(
  shape: PauseShape,
  slot: ActivitySlot,
  context: ContentContext,
  state: VarietyState,
  rng: Rng,
): ChosenContent | undefined {
  if (shape === 'routine') {
    const routine = pickRoutine(slot, context, state, rng);
    if (routine) return routine;
    return chooseExercises('combined', slot, context, state, rng);
  }
  return chooseExercises(shape, slot, context, state, rng);
}

function chooseExercises(
  shape: 'single' | 'combined',
  slot: ActivitySlot,
  context: ContentContext,
  initial: VarietyState,
  rng: Rng,
): ChosenContent | undefined {
  const maxCount = shape === 'single' ? 1 : PLANNER.resetMaxExercises;
  const minTotal = shape === 'single' ? 0 : PAUSE_SIZE.resetMinSec;
  const ids: string[] = [];
  let total = 0;
  let state = initial;

  while (ids.length < maxCount && (ids.length === 0 || total < minTotal)) {
    const budget = shape === 'single' ? PAUSE_SIZE.microMaxSec : PAUSE_SIZE.resetMaxSec - total;
    const pick = pickExercise(
      context.catalog.exercises,
      {
        discomfort: context.discomfort,
        equipment: context.equipment,
        slot,
        maxDurationSec: Math.min(PAUSE_SIZE.microMaxSec, budget),
        previousExerciseIds: [...initial.previousExerciseIds, ...ids],
        previousArea: state.previousArea,
        recentExerciseIds: state.recentExerciseIds,
      },
      rng,
    );
    if (!pick || ids.includes(pick.exercise.id)) break;
    ids.push(pick.exercise.id);
    total += pick.exercise.durationSec;
    state = {
      ...state,
      previousArea: pick.area,
      recentExerciseIds: [...state.recentExerciseIds, pick.exercise.id],
    };
  }

  if (ids.length === 0) return undefined;
  return {
    content: { kind: 'exercises', exerciseIds: ids },
    durationSec: total,
    state: { ...state, previousExerciseIds: ids },
  };
}

function pickRoutine(
  slot: ActivitySlot,
  context: ContentContext,
  state: VarietyState,
  rng: Rng,
): ChosenContent | undefined {
  const exercises = new Map(context.catalog.exercises.map((item) => [item.id, item]));
  const fits = context.catalog.routines.filter(
    (routine) =>
      routineDurationSec(routine) <= PAUSE_SIZE.activeMaxSec &&
      routine.steps.every((step) => {
        const exercise = exercises.get(step.exerciseId);
        return exercise !== undefined && isExerciseEligible(exercise, { ...context, slot });
      }),
  );
  // Not used today and sharing no exercise with the previous pause.
  const fresh = fits.filter(
    (routine) =>
      !state.usedRoutineIds.includes(routine.id) &&
      routine.steps.every((step) => !state.previousExerciseIds.includes(step.exerciseId)),
  );
  const routine = weightedPick(fresh, () => 1, rng);
  if (!routine) return undefined;
  const stepIds = routine.steps.map((step) => step.exerciseId);
  return {
    content: { kind: 'routine', routineId: routine.id },
    durationSec: routineDurationSec(routine),
    state: {
      ...state,
      previousExerciseIds: stepIds,
      // Routines are whole-body; they don't block any area for the next pause.
      previousArea: undefined,
      recentExerciseIds: [...state.recentExerciseIds, ...stepIds],
      usedRoutineIds: [...state.usedRoutineIds, routine.id],
    },
  };
}
