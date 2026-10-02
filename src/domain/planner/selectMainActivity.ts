import { weightedPick, type Rng } from '../rng';
import type { ActivitySlot, EquipmentId, MainActivity } from '../types';
import { hasEquipment } from './selectExercise';

export interface MainActivityContext {
  equipment: readonly EquipmentId[];
  /** 'break' allows everything; 'work' excludes activities that need a real break. */
  slot: ActivitySlot;
  preferredMin: number;
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
  context: Pick<MainActivityContext, 'equipment' | 'slot'>,
): boolean {
  if (!hasEquipment(activity.equipment, context.equipment)) return false;
  if (context.slot === 'meeting') return activity.meetingFriendly;
  if (context.slot === 'work') return !activity.needsBreak;
  return true;
}

/** Duration for an activity: the preferred length, clamped to the activity's range. */
export function mainActivityDuration(activity: MainActivity, preferredMin: number): number {
  return Math.min(Math.max(preferredMin, activity.durationMin.min), activity.durationMin.max);
}

export function pickMainActivity(
  activities: readonly MainActivity[],
  context: MainActivityContext,
  rng: Rng,
): MainActivityPick | undefined {
  const eligible = activities.filter((activity) => isMainActivityEligible(activity, context));
  const fresh = eligible.filter((activity) => activity.id !== context.excludeId);
  const pool = fresh.length > 0 ? fresh : eligible;
  const activity = weightedPick(
    pool,
    ({ durationMin }) =>
      context.preferredMin >= durationMin.min && context.preferredMin <= durationMin.max
        ? PREFERRED_DURATION_WEIGHT
        : 1,
    rng,
  );
  return activity
    ? { activity, durationMin: mainActivityDuration(activity, context.preferredMin) }
    : undefined;
}
