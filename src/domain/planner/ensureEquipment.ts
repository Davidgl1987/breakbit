import { createRng, type Rng } from '../rng';
import type {
  ActivityContent,
  Catalog,
  DayPlan,
  DiscomfortLevels,
  EquipmentId,
  Instant,
  ScheduledActivity,
} from '../types';
import { contentExerciseIds, pauseRoutines } from './pauseContent';
import {
  hasEquipment,
  isExerciseEligible,
  pauseTypeForDuration,
  pickExercise,
  routineDurationSec,
} from './selectExercise';

export interface ChosenEquipmentContext {
  catalog: Catalog;
  discomfort: DiscomfortLevels;
  /** "Material de hoy" as the user chose it: the only equipment the day may use. */
  equipment: readonly EquipmentId[];
}

/** The equipment an activity needs: its moves', or its main activity's. */
export function activityEquipment(item: ScheduledActivity, catalog: Catalog): EquipmentId[] {
  if (item.content.kind === 'main') {
    const activityId = item.content.activityId;
    return catalog.mainActivities.find((entry) => entry.id === activityId)?.equipment ?? [];
  }
  return [
    ...new Set(
      contentExerciseIds(item.content, catalog).flatMap(
        (id) => catalog.exercises.find((entry) => entry.id === id)?.equipment ?? [],
      ),
    ),
  ];
}

/**
 * The equipment the user chose for the day is used, each piece at least once, whenever
 * something fits. A piece the plan doesn't use yet goes into a pause still to come (one of
 * its moves, or a routine with it in a break), or else becomes the main activity, when one
 * that needs it fits its time and context. Nothing that already happened or started
 * changes, nor an activity that is the only use of another chosen piece. What can't fit
 * (a mat without a break, a standing desk without room for standing work) stays unused.
 */
export function ensureEquipmentUsed(
  plan: DayPlan,
  context: ChosenEquipmentContext,
  from: Instant,
  seed: string,
): DayPlan {
  const rng = createRng(seed);
  let activities = plan.activities;
  const uses = (piece: EquipmentId) =>
    activities.filter((item) => activityEquipment(item, context.catalog).includes(piece)).length;

  for (const piece of context.equipment) {
    if (uses(piece) > 0) continue;
    // Free to change: still to come, and not the only use of another chosen piece.
    const changeable = (item: ScheduledActivity) =>
      item.origin === 'plan' &&
      item.status === 'pending' &&
      item.startedAt === undefined &&
      item.currentScheduledAt >= from &&
      activityEquipment(item, context.catalog).every(
        (other) => other === piece || !context.equipment.includes(other) || uses(other) > 1,
      );

    const pauses = activities.filter((item) => item.kind === 'micro' && changeable(item));
    // Gear-free pauses first, in a stable but not always identical order.
    const ordered = [
      ...shuffle(
        pauses.filter((item) => activityEquipment(item, context.catalog).length === 0),
        rng,
      ),
      ...shuffle(
        pauses.filter((item) => activityEquipment(item, context.catalog).length > 0),
        rng,
      ),
    ];
    let replaced: ScheduledActivity | undefined;
    for (const pause of ordered) {
      replaced = withPiece(pause, piece, context, rng);
      if (replaced) break;
    }
    if (!replaced) {
      const main = activities.find((item) => item.kind === 'main' && changeable(item));
      replaced = main && mainWithPiece(main, piece, context);
    }
    if (replaced) {
      const updated = replaced;
      activities = activities.map((item) => (item.id === updated.id ? updated : item));
    }
  }
  return activities === plan.activities ? plan : { ...plan, activities };
}

/** The pause with one of its moves (or its routine) swapped for one that uses `piece`. */
function withPiece(
  pause: ScheduledActivity,
  piece: EquipmentId,
  context: ChosenEquipmentContext,
  rng: Rng,
): ScheduledActivity | undefined {
  if (pause.content.kind === 'routine') {
    const routine = pauseRoutines(pause.slot, context).find((item) =>
      item.steps.some((step) =>
        context.catalog.exercises
          .find((exercise) => exercise.id === step.exercise)
          ?.equipment.includes(piece),
      ),
    );
    return routine && withContent(pause, { kind: 'routine', routineId: routine.id }, context);
  }
  if (pause.content.kind !== 'exercises') return undefined;
  const ids = pause.content.exerciseIds;
  const pool = context.catalog.exercises.filter(
    (exercise) =>
      exercise.equipment.includes(piece) &&
      !ids.includes(exercise.id) &&
      isExerciseEligible(exercise, { equipment: context.equipment, slot: pause.slot }),
  );
  const pick = pickExercise(
    pool,
    { discomfort: context.discomfort, equipment: context.equipment, slot: pause.slot },
    rng,
  );
  if (!pick) return undefined;
  // The last move goes: a combined reset keeps the one that gets the user up first.
  const exerciseIds = [...ids.slice(0, -1), pick.exercise.id];
  return withContent(pause, { kind: 'exercises', exerciseIds }, context);
}

function withContent(
  pause: ScheduledActivity,
  content: ActivityContent,
  context: ChosenEquipmentContext,
): ScheduledActivity {
  const durationSec =
    content.kind === 'routine'
      ? routineDurationSec(
          context.catalog.routines.find((routine) => routine.id === content.routineId)!,
        )
      : contentExerciseIds(content, context.catalog).reduce(
          (sum, id) =>
            sum +
            (context.catalog.exercises.find((exercise) => exercise.id === id)?.durationSec ?? 0),
          0,
        );
  return { ...pause, content, durationSec, pauseType: pauseTypeForDuration(durationSec) };
}

/** The main activity swapped for one that needs `piece`, in the same context and time. */
function mainWithPiece(
  main: ScheduledActivity,
  piece: EquipmentId,
  context: ChosenEquipmentContext,
): ScheduledActivity | undefined {
  const minutes = main.durationSec / 60;
  const activity = context.catalog.mainActivities.find(
    (item) =>
      item.equipment.includes(piece) &&
      hasEquipment(item.equipment, context.equipment) &&
      item.slots.includes(main.slot) &&
      item.durationMin.min <= minutes,
  );
  if (!activity) return undefined;
  return {
    ...main,
    content: { kind: 'main', activityId: activity.id },
    durationSec: Math.min(minutes, activity.durationMin.max) * 60,
    completionMode: activity.completionMode,
  };
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
