import { DAY_END_LEAD_MIN, MOVEMENT, PLANNER, SPACING } from '../config';
import { createRng } from '../rng';
import { atMinutes, compareDateKeys, minutesOfDay, toDateKey } from '../time';
import type {
  Catalog,
  DateKey,
  DayPlan,
  DaySchedule,
  Instant,
  Meeting,
  ScheduledActivity,
  UserSettings,
} from '../types';
import { byScheduledAt, createActivity } from './activities';
import { allocatePauses, layoutPauses, targetPauseCount } from './distribute';
import { choosePauseContent, pauseShape, type VarietyState } from './pauseContent';
import {
  placeChosenMainActivity,
  placeMainActivity,
  type MainActivityChoice,
  type MainPlacement,
} from './placeMainActivity';
import { PAUSE_RESERVE_MIN, resolvePauseTimes } from './resolve';
import { pauseTypeForDuration } from './selectExercise';
import {
  buildTimeline,
  intervalLength,
  overlaps,
  slotAt,
  subtractIntervals,
  workWindows,
  type DayTimeline,
} from './timeline';
import { microbreakZones } from './zones';

export interface PlanInput {
  date: DateKey;
  schedule: DaySchedule;
  meetings?: readonly Meeting[];
  settings: Pick<
    UserSettings,
    'intensity' | 'discomfort' | 'equipment' | 'preferredMainActivityMin'
  >;
  catalog: Catalog;
  /** "Otra misión" / regenerate: a new seed gives a different, still reproducible plan. */
  rerollCount?: number;
  /** The user's own main activity and time; otherwise one is proposed. */
  mainActivity?: MainActivityChoice;
  /** "Otra misión": avoid proposing this activity again. */
  excludeMainActivityId?: string;
  /** Exercises from previous days, to rotate the catalog. */
  recentExerciseIds?: readonly string[];
  /** Plan only from this moment on (the app was first opened mid-day). */
  from?: Instant;
}

/**
 * Builds the day: proposes the main activity, spreads the microbreaks evenly over the
 * free work time (never during lunch or busy meetings, away from the main activity,
 * using free breaks as natural spots) and picks varied content: areas weighted by the
 * sliders, regular pauses that get the user up whatever the sliders say.
 * Deterministic for the same input.
 */
export function generateDayPlan(input: PlanInput): DayPlan {
  const { date, settings, catalog } = input;
  const rerollCount = input.rerollCount ?? 0;
  const meetings = [...(input.meetings ?? [])];
  const timeline = buildTimeline(input.schedule, meetings);
  const rng = createRng(`${date}#${rerollCount}`);
  const from = startMinute(date, timeline, input.from);

  const main = input.mainActivity
    ? placeChosenMainActivity(timeline, catalog.mainActivities, input.mainActivity)
    : placeMainActivity(
        timeline,
        catalog.mainActivities,
        {
          equipment: settings.equipment,
          preferredMin: settings.preferredMainActivityMin,
          excludeId: input.excludeMainActivityId,
          from,
        },
        rng,
      );
  const mainInterval = main
    ? {
        start: main.start,
        end: main.start + main.durationMin,
        whileWorking: main.activity.whileWorking,
      }
    : undefined;

  // 1. How many pauses: from the effective work time left today.
  const windows = workWindows(timeline, from);
  const effectiveMin = windows.reduce((sum, window) => sum + intervalLength(window), 0);
  const target = targetPauseCount(effectiveMin, settings.intensity);

  // 2. Where: evenly over free stretches, using free breaks as preferred spots.
  const zones = microbreakZones(timeline, mainInterval);
  const blocked = zones.filter((zone) => zone.kind === 'busy_meeting' || zone.kind === 'main');
  const free = subtractIntervals(windows, blocked);
  const allocation = allocatePauses(free, target);
  const breaks = timeline.breaks.filter(
    (pause) => pause.start >= from && !blocked.some((zone) => overlaps(zone, pause)),
  );
  const desired = free.flatMap((window, index) => layoutPauses(window, allocation[index]!, breaks));

  // 3. Enforce the hard rules (lunch, meetings, spacing, end of day).
  const times = resolvePauseTimes(
    desired.map((time) => ({
      desired: time,
      durationMin: PAUSE_RESERVE_MIN,
      allowMoveMeetings: true,
    })),
    {
      anchors: [],
      zones,
      minGap: SPACING.minGapAfterReplanMin,
      earliest: from,
      latestEnd: timeline.workEnd - DAY_END_LEAD_MIN,
    },
  ).filter((time): time is number => time !== null);

  // 4. What: varied content for each pause.
  const micros = planMicrobreaks(input, timeline, times);

  const activities = [...micros];
  if (main) activities.push(mainActivity(date, main));

  return {
    date,
    schedule: input.schedule,
    meetings,
    rerollCount,
    targetMicroCount: target,
    activities: activities.sort(byScheduledAt),
  };
}

function planMicrobreaks(
  input: PlanInput,
  timeline: DayTimeline,
  times: readonly number[],
): ScheduledActivity[] {
  const rng = createRng(`${input.date}#${input.rerollCount ?? 0}#content`);
  const context = {
    catalog: input.catalog,
    discomfort: input.settings.discomfort,
    equipment: input.settings.equipment,
  };
  let state: VarietyState = {
    previousExerciseIds: [],
    recentExerciseIds: [...(input.recentExerciseIds ?? [])],
    usedRoutineIds: [],
  };
  // Work pauses: every Nth is a combined reset. Work and meeting pauses: every Nth gets
  // the user up, whatever the sliders say (breaks get a routine anyway).
  let workIndex = 0;
  let deskIndex = 0;
  const micros: ScheduledActivity[] = [];

  times.forEach((time, index) => {
    const slot = slotAt(timeline, time);
    const standing = slot !== 'break' && deskIndex % MOVEMENT.standingEvery === 0;
    const chosen = choosePauseContent(pauseShape(slot, workIndex), slot, context, state, rng, {
      standing,
    });
    if (slot === 'work') workIndex++;
    if (slot !== 'break') deskIndex++;
    if (!chosen) return;
    state = chosen.state;
    micros.push(
      createActivity({
        id: `${input.date}:p${index}`,
        kind: 'micro',
        content: chosen.content,
        pauseType: pauseTypeForDuration(chosen.durationSec),
        slot,
        durationSec: chosen.durationSec,
        at: atMinutes(input.date, time),
      }),
    );
  });
  return micros;
}

function mainActivity(date: DateKey, placement: MainPlacement): ScheduledActivity {
  return createActivity({
    id: `${date}:main`,
    kind: 'main',
    content: { kind: 'main', activityId: placement.activity.id },
    slot: placement.slot,
    durationSec: placement.durationMin * 60,
    completionMode: placement.activity.completionMode,
    at: atMinutes(date, placement.start),
  });
}

/** First minute that can be planned: the work start, or now when opening the app late. */
function startMinute(date: DateKey, timeline: DayTimeline, from?: Instant): number {
  if (from === undefined) return timeline.workStart;
  const fromDate = toDateKey(from);
  if (compareDateKeys(fromDate, date) < 0) return timeline.workStart;
  if (compareDateKeys(fromDate, date) > 0) return timeline.workEnd;
  const minute = Math.ceil(minutesOfDay(from) / PLANNER.roundToMin) * PLANNER.roundToMin;
  return Math.max(minute, timeline.workStart);
}
