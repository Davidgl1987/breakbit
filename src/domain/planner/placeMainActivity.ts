import { PLANNER } from '../config';
import type { Rng } from '../rng';
import { toMinutes } from '../time';
import type { ActivitySlot, EquipmentId, HHmm, MainActivity } from '../types';
import { roundTo } from './distribute';
import { pickMainActivity } from './selectMainActivity';
import {
  contains,
  intervalLength,
  overlaps,
  slotAt,
  subtractIntervals,
  workWindows,
  type DayTimeline,
  type Interval,
} from './timeline';

/** The user's own pick on the day-start screen ("Cambiar actividad" / "Otra hora"). */
export interface MainActivityChoice {
  activityId: string;
  start: HHmm;
  durationMin: number;
}

export interface MainPlacement {
  activity: MainActivity;
  /** Minutes since midnight. */
  start: number;
  durationMin: number;
  slot: ActivitySlot;
}

export interface MainPlacementContext {
  equipment: readonly EquipmentId[];
  preferredMin: number;
  excludeId?: string;
  /** Nothing is placed before this minute (late start). */
  from: number;
}

/**
 * Proposes the main activity and when to do it, preferring natural moments:
 * 1. a configured break (longest first), 2. a meeting where the user can move,
 * 3. otherwise the middle of the longest free stretch of work time.
 */
export function placeMainActivity(
  timeline: DayTimeline,
  activities: readonly MainActivity[],
  context: MainPlacementContext,
  rng: Rng,
): MainPlacement | undefined {
  const lunch = timeline.lunch ? [timeline.lunch] : [];
  const byLength = (intervals: readonly Interval[], unavailable: readonly Interval[]) =>
    intervals
      .filter((interval) => interval.start >= context.from)
      .filter((interval) => !unavailable.some((other) => overlaps(other, interval)))
      .sort((a, b) => intervalLength(b) - intervalLength(a) || a.start - b.start);

  // A break that overlaps a meeting isn't really free; a meeting can't overlap lunch.
  const breaks = byLength(timeline.breaks, [
    ...timeline.busyMeetings,
    ...timeline.moveMeetings,
    ...lunch,
  ]);
  const meetings = byLength(timeline.moveMeetings, [...timeline.busyMeetings, ...lunch]);
  const candidates: { interval: Interval; slot: ActivitySlot }[] = [
    ...breaks.map((interval) => ({ interval, slot: 'break' as const })),
    ...meetings.map((interval) => ({ interval, slot: 'meeting' as const })),
  ];

  for (const { interval, slot } of candidates) {
    const pick = pickMainActivity(
      activities,
      { ...context, slot, maxMin: intervalLength(interval) },
      rng,
    );
    if (pick) return { ...pick, start: interval.start, slot };
  }

  const free = subtractIntervals(workWindows(timeline, context.from), [
    ...timeline.busyMeetings,
    ...timeline.breaks,
    ...timeline.moveMeetings,
  ]).sort((a, b) => intervalLength(b) - intervalLength(a) || a.start - b.start);
  const longest = free[0];
  if (!longest) return undefined;

  const pick = pickMainActivity(
    activities,
    { ...context, slot: 'work', maxMin: intervalLength(longest) },
    rng,
  );
  if (!pick) return undefined;
  const centered = roundTo(
    longest.start + (intervalLength(longest) - pick.durationMin) / 2,
    PLANNER.roundToMin,
  );
  const start = Math.min(Math.max(centered, longest.start), longest.end - pick.durationMin);
  return { ...pick, start, slot: 'work' };
}

/**
 * Honours the user's choice; the slot follows from where it falls. Lunch is time off
 * work, like a break (a walk after eating doesn't interrupt work).
 */
export function placeChosenMainActivity(
  timeline: DayTimeline,
  activities: readonly MainActivity[],
  choice: MainActivityChoice,
): MainPlacement | undefined {
  const activity = activities.find((item) => item.id === choice.activityId);
  if (!activity) return undefined;
  const start = toMinutes(choice.start);
  const inLunch = timeline.lunch !== undefined && contains(timeline.lunch, start);
  const slot = inLunch ? 'break' : slotAt(timeline, start);
  return { activity, start, durationMin: choice.durationMin, slot };
}
