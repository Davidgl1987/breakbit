import { weightedPick, type Rng } from '../rng';
import type { ActivitySlot, EquipmentId, MainActivity } from '../types';
import { hasEquipment } from './selectExercise';

export interface MainActivityContext {
  equipment: readonly EquipmentId[];
  /** Where the activity would happen; it must be one of the activity's slots. */
  slot: ActivitySlot;
  preferredMin: number;
  /** Length of the slot it must fit in. */
  maxMin?: number;
  /** "Otra misión": the currently proposed activity is skipped when possible. */
  excludeId?: string;
}

export interface MainActivityPick {
  activity: MainActivity;
  durationMin: number;
}

/** Activities whose duration range covers the preferred length are favoured. */
const PREFERRED_DURATION_WEIGHT = 3;

export function isMainActivityEligible(
  activity: MainActivity,
  context: Pick<MainActivityContext, 'equipment' | 'slot' | 'maxMin'>,
): boolean {
  if (!hasEquipment(activity.equipment, context.equipment)) return false;
  if (context.maxMin !== undefined && activity.durationMin.min > context.maxMin) return false;
  return activity.slots.includes(context.slot);
}

/** Duration for an activity: the preferred length, clamped to its range and the slot. */
export function mainActivityDuration(
  activity: MainActivity,
  preferredMin: number,
  maxMin = Infinity,
): number {
  const upper = Math.min(activity.durationMin.max, maxMin);
  return Math.min(Math.max(preferredMin, activity.durationMin.min), upper);
}

export function pickMainActivity(
  activities: readonly MainActivity[],
  context: MainActivityContext,
  rng: Rng,
): MainActivityPick | undefined {
  const eligible = activities.filter((activity) => isMainActivityEligible(activity, context));
  const fresh = eligible.filter((activity) => activity.id !== context.excludeId);
  const pool = fresh.length > 0 ? fresh : eligible;
  const maxMin = context.maxMin ?? Infinity;
  const activity = weightedPick(
    pool,
    ({ durationMin }) =>
      context.preferredMin >= durationMin.min &&
      context.preferredMin <= Math.min(durationMin.max, maxMin)
        ? PREFERRED_DURATION_WEIGHT
        : 1,
    rng,
  );
  return activity
    ? { activity, durationMin: mainActivityDuration(activity, context.preferredMin, maxMin) }
    : undefined;
}
