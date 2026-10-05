import { PAUSE_SIZE, PLANNER } from '../config';
import { weightedPick, type Rng } from '../rng';
import type {
  ActivityContent,
  ActivitySlot,
  BodyArea,
  Catalog,
  DiscomfortLevels,
  EquipmentId,
  Exercise,
  Routine,
} from '../types';
import {
  areaWeight,
  contextWeight,
  isExerciseEligible,
  pickExercise,
  routineDurationSec,
} from './selectExercise';

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

export interface PauseOptions {
  /** The pause must get the user up: a single 'standing' move, or one among several. */
  standing?: boolean;
  /** "Tengo un hueco": the user chose the time, so floor work fits outside meetings. */
  freeTime?: boolean;
}

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
        ?.steps.map((step) => step.exercise) ?? []
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
  options: PauseOptions = {},
): ChosenContent | undefined {
  if (shape === 'routine') {
    const routine = pickRoutine(slot, context, state, rng, options);
    if (routine) return routine;
    return chooseExercises('combined', slot, context, state, rng, options);
  }
  return chooseExercises(shape, slot, context, state, rng, options);
}

/**
 * One move (micro, up to 60 s) or a combined reset of 2–4 moves adding up to 90–120 s;
 * a single longer move (a short walk) can be a reset on its own. A combined reset always
 * starts with a move that gets the user up, as does a single one when asked.
 */
function chooseExercises(
  shape: 'single' | 'combined',
  slot: ActivitySlot,
  context: ContentContext,
  initial: VarietyState,
  rng: Rng,
  options: PauseOptions,
): ChosenContent | undefined {
  const maxCount = shape === 'single' ? 1 : PLANNER.resetMaxExercises;
  const minTotal = shape === 'single' ? 0 : PAUSE_SIZE.resetMinSec;
  const ids: string[] = [];
  let total = 0;
  let state = initial;

  while (ids.length < maxCount && (ids.length === 0 || total < minTotal)) {
    const budget = shape === 'single' ? PAUSE_SIZE.microMaxSec : PAUSE_SIZE.resetMaxSec - total;
    const filter = {
      discomfort: context.discomfort,
      equipment: context.equipment,
      slot,
      freeTime: options.freeTime,
      maxDurationSec: budget,
      previousExerciseIds: [...initial.previousExerciseIds, ...ids],
      previousArea: state.previousArea,
      recentExerciseIds: state.recentExerciseIds,
    };
    const getsUp = ids.length === 0 && (options.standing || shape === 'combined');
    const pick =
      (getsUp
        ? pickExercise(context.catalog.exercises, { ...filter, standingOnly: true }, rng)
        : undefined) ?? pickExercise(context.catalog.exercises, filter, rng);
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

/** Routines of up to 3 minutes that suit the slot and the user's equipment. */
export function pauseRoutines(
  slot: ActivitySlot,
  context: Pick<ContentContext, 'catalog' | 'equipment'>,
  options: PauseOptions = {},
): Routine[] {
  return context.catalog.routines.filter(
    (routine) =>
      routineDurationSec(routine) <= PAUSE_SIZE.activeMaxSec &&
      isRoutineEligible(routine, slot, context, options),
  );
}

export function isRoutineEligible(
  routine: Routine,
  slot: ActivitySlot,
  context: Pick<ContentContext, 'catalog' | 'equipment'>,
  options: PauseOptions = {},
): boolean {
  return routineExercises(routine, context.catalog).every(
    (exercise) =>
      exercise !== undefined &&
      isExerciseEligible(exercise, {
        equipment: context.equipment,
        slot,
        freeTime: options.freeTime,
      }),
  );
}

/**
 * How likely a routine is: the sliders' weight of the areas its moves aim at (on
 * average), and less likely when it needs equipment or the floor outside free time.
 */
export function routineWeight(
  routine: Routine,
  slot: ActivitySlot,
  context: ContentContext,
  options: PauseOptions = {},
): number {
  const moves = routineExercises(routine, context.catalog).filter(
    (exercise): exercise is Exercise => exercise !== undefined,
  );
  if (moves.length === 0) return 0;
  const areas =
    moves.reduce(
      (sum, exercise) => sum + areaWeight(context.discomfort, exercise.areas[0] ?? ''),
      0,
    ) / moves.length;
  const filter = { slot, freeTime: options.freeTime };
  return areas * Math.min(...moves.map((exercise) => contextWeight(exercise, filter)));
}

function routineExercises(routine: Routine, catalog: Catalog): (Exercise | undefined)[] {
  return routine.steps.map((step) => catalog.exercises.find((item) => item.id === step.exercise));
}

function pickRoutine(
  slot: ActivitySlot,
  context: ContentContext,
  state: VarietyState,
  rng: Rng,
  options: PauseOptions,
): ChosenContent | undefined {
  // Not used today and sharing no exercise with the previous pause.
  const fresh = pauseRoutines(slot, context, options).filter(
    (routine) =>
      !state.usedRoutineIds.includes(routine.id) &&
      routine.steps.every((step) => !state.previousExerciseIds.includes(step.exercise)),
  );
  const routine = weightedPick(fresh, (item) => routineWeight(item, slot, context, options), rng);
  if (!routine) return undefined;
  const stepIds = routine.steps.map((step) => step.exercise);
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
