import { GAP, PAUSE_SIZE } from '../config';
import { mainActivityOf } from '../day/today';
import { isMainRunning } from '../main/session';
import { isAwaitingAnswer, isOpen } from '../pause/window';
import { byScheduledAt, createActivity } from '../planner/activities';
import {
  choosePauseContent,
  contentExerciseIds,
  type ChosenContent,
  type ContentContext,
  type VarietyState,
} from '../planner/pauseContent';
import { rebalance } from '../planner/rebalance';
import {
  hasEquipment,
  isExerciseEligible,
  pauseTypeForDuration,
  pickExercise,
  routineDurationSec,
} from '../planner/selectExercise';
import { buildTimeline, slotAt } from '../planner/timeline';
import { createRng, weightedPick } from '../rng';
import { atTime, minutesOfDay } from '../time';
import type {
  ActivityContent,
  ActivitySlot,
  DayPlan,
  Instant,
  ScheduledActivity,
  XpEntry,
} from '../types';

const MINUTE = 60_000;

/** "Tengo un hueco": how much time the user has. */
export const GAP_OPTIONS = ['s30', 'm1', 'm3', 'm10'] as const;
export type GapOption = (typeof GAP_OPTIONS)[number];

export function isGapOption(value: string): value is GapOption {
  return (GAP_OPTIONS as readonly string[]).includes(value);
}

/** Why an extra pause earns no XP: moved too recently, or the day's extras are used up. */
export type NoXpReason = 'cooldown' | 'cap';

/**
 * What to do with the time:
 * - due: a pause is already waiting for an answer, so it's that one;
 * - main: 10+ minutes and the main activity still to do (or paused), if it can be done
 *   here and now (equipment, meeting or not);
 * - advance: enough time since the last movement and the next pause is close, so it is
 *   done now (with content for the time available) and counts as that pause;
 * - extra: otherwise, a voluntary pause that doesn't touch the plan; +10 XP only if the
 *   last movement wasn't too recent (and the optional daily cap allows it).
 */
export type GapProposal =
  | { kind: 'due'; activity: ScheduledActivity }
  | { kind: 'main'; activity: ScheduledActivity }
  | ({ kind: 'advance'; target: ScheduledActivity } & GapContent)
  | ({ kind: 'extra'; noXp?: NoXpReason } & GapContent);

export interface GapContent {
  content: ActivityContent;
  durationSec: number;
  slot: ActivitySlot;
}

export interface GapContext extends ContentContext {
  ledger: readonly XpEntry[];
}

/** A proposal for the time the user has. `seed` keeps it stable and lets them ask for another. */
export function proposeGap(
  plan: DayPlan,
  option: GapOption,
  now: Instant,
  context: GapContext,
  seed: string,
): GapProposal | undefined {
  const due = plan.activities
    .filter((item) => item.origin === 'plan' && isAwaitingAnswer(item, now))
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)[0];
  if (due) return { kind: 'due', activity: due };

  const slot = slotNow(plan, now);
  if (option === 'm10') {
    const main = gapMainActivity(plan, slot, context);
    if (main) return { kind: 'main', activity: main };
  }

  const chosen = chooseGapContent(option, slot, context, varietyOf(plan, context), createRng(seed));
  if (!chosen) return undefined;
  const content = { content: chosen.content, durationSec: chosen.durationSec, slot };

  const target = advanceTarget(plan, now);
  if (target) return { kind: 'advance', target, ...content };
  const noXp = extraXpBlock(plan, context.ledger, now);
  return { kind: 'extra', ...content, ...(noXp && { noXp }) };
}

/**
 * The main activity, if a gap of 10+ minutes is a good time for it: still to do (or
 * paused), the user has its equipment, and it suits where they are. In a "puedo moverme"
 * meeting only what fits a meeting (a walking meeting, standing); elsewhere anything that
 * doesn't need one.
 */
export function gapMainActivity(
  plan: DayPlan,
  slot: ActivitySlot,
  context: Pick<ContentContext, 'catalog' | 'equipment'>,
): ScheduledActivity | undefined {
  const main = mainActivityOf(plan);
  if (!main || !isOpen(main) || isMainRunning(main) || main.content.kind !== 'main')
    return undefined;
  const activityId = main.content.activityId;
  const info = context.catalog.mainActivities.find((item) => item.id === activityId);
  if (!info || !hasEquipment(info.equipment, context.equipment)) return undefined;
  const fits =
    slot === 'meeting'
      ? info.slots.includes('meeting')
      : info.slots.some((place) => place !== 'meeting');
  return fits ? main : undefined;
}

/** Where the user is now: a "puedo moverme" meeting, a break, or work time. */
export function slotNow(plan: DayPlan, now: Instant): ActivitySlot {
  return slotAt(buildTimeline(plan.schedule, plan.meetings), minutesOfDay(now));
}

/**
 * The next planned pause, if it can be done now: it comes within 45 min and at least
 * 35 min have passed since the last movement (or the start of the day).
 */
export function advanceTarget(plan: DayPlan, now: Instant): ScheduledActivity | undefined {
  const next = plan.activities
    .filter(
      (item) =>
        item.kind === 'micro' &&
        item.origin === 'plan' &&
        isOpen(item) &&
        item.startedAt === undefined &&
        item.currentScheduledAt > now,
    )
    .sort((a, b) => a.currentScheduledAt - b.currentScheduledAt)[0];
  if (!next || next.currentScheduledAt - now > GAP.advanceMaxAheadMin * MINUTE) return undefined;
  const since = lastMovementAt(plan, now) ?? atTime(plan.date, plan.schedule.workStart);
  return now - since >= GAP.advanceMinSinceLastMin * MINUTE ? next : undefined;
}

/** When the user last finished moving (any pause or the main activity), up to `at`. */
export function lastMovementAt(plan: DayPlan, at: Instant): Instant | undefined {
  let last: Instant | undefined;
  for (const item of plan.activities) {
    if (item.status !== 'completed' || item.completedAt === undefined) continue;
    if (item.completedAt > at) continue;
    if (last === undefined || item.completedAt > last) last = item.completedAt;
  }
  return last;
}

/** Why an extra pause started at `at` would earn no XP, if it wouldn't. */
export function extraXpBlock(
  plan: DayPlan,
  ledger: readonly XpEntry[],
  at: Instant,
): NoXpReason | undefined {
  const last = lastMovementAt(plan, at);
  if (last !== undefined && at - last < GAP.extraXpCooldownMin * MINUTE) return 'cooldown';
  const cap = GAP.extraXpDailyCap;
  const earned = ledger.filter(
    (entry) => entry.reason === 'extra_break' && entry.date === plan.date,
  ).length;
  return cap !== null && earned >= cap ? 'cap' : undefined;
}

/**
 * Does the next pause now, with the proposed content: it is started at once, keeps
 * counting as a planned pause (without the "a la primera" bonus: nobody asked for it
 * yet) and the following pauses keep their distance from it.
 */
export function advancePause(
  plan: DayPlan,
  proposal: Extract<GapProposal, { kind: 'advance' }>,
  now: Instant,
  context: ContentContext,
): DayPlan {
  const target = plan.activities.find((item) => item.id === proposal.target.id);
  if (!target || !isOpen(target) || target.startedAt !== undefined) return plan;
  const advanced: ScheduledActivity = {
    ...target,
    content: proposal.content,
    durationSec: proposal.durationSec,
    pauseType: pauseTypeForDuration(proposal.durationSec),
    slot: proposal.slot,
    currentScheduledAt: now,
    startedAt: now,
    firstPrompt: false,
  };
  const activities = plan.activities.map((item) => (item.id === target.id ? advanced : item));
  return rebalance({ ...plan, activities }, now, context);
}

/** Adds a voluntary pause, started now. It doesn't move or replace any planned pause. */
export function addExtraPause(
  plan: DayPlan,
  proposal: GapContent,
  now: Instant,
): { plan: DayPlan; id: string } {
  const used = new Set(plan.activities.map((item) => item.id));
  let n = plan.activities.filter((item) => item.origin === 'gap').length;
  while (used.has(`${plan.date}:g${n}`)) n++;
  const id = `${plan.date}:g${n}`;
  const extra: ScheduledActivity = {
    ...createActivity({
      id,
      kind: 'micro',
      origin: 'gap',
      content: proposal.content,
      slot: proposal.slot,
      durationSec: proposal.durationSec,
      pauseType: pauseTypeForDuration(proposal.durationSec),
      at: now,
    }),
    startedAt: now,
  };
  return { plan: { ...plan, activities: [...plan.activities, extra].sort(byScheduledAt) }, id };
}

/**
 * Content for the time available: 30 s, a single move; 1 min, one move up to a minute;
 * 3 min, a short routine (quiet moves in a meeting); 10+ min, the longest routine that
 * fits, or a short one.
 */
function chooseGapContent(
  option: GapOption,
  slot: ActivitySlot,
  context: ContentContext,
  variety: VarietyState,
  rng: ReturnType<typeof createRng>,
): ChosenContent | undefined {
  if (option === 's30') {
    const pick = pickExercise(
      context.catalog.exercises,
      {
        discomfort: context.discomfort,
        equipment: context.equipment,
        slot,
        maxDurationSec: 30,
        previousExerciseIds: variety.previousExerciseIds,
        recentExerciseIds: variety.recentExerciseIds,
      },
      rng,
    );
    if (pick) {
      return {
        content: { kind: 'exercises', exerciseIds: [pick.exercise.id] },
        durationSec: pick.exercise.durationSec,
        state: variety,
      };
    }
    return choosePauseContent('single', slot, context, variety, rng);
  }
  if (option === 'm1') return choosePauseContent('single', slot, context, variety, rng);
  if (slot === 'meeting') return choosePauseContent('combined', slot, context, variety, rng);
  if (option === 'm10') {
    const long = longRoutine(slot, context, rng);
    if (long) return { ...long, state: variety };
  }
  return choosePauseContent('routine', slot, context, variety, rng);
}

/** A routine longer than a planned pause, up to 10 min; longer ones are likelier. */
function longRoutine(
  slot: ActivitySlot,
  context: ContentContext,
  rng: ReturnType<typeof createRng>,
): Omit<ChosenContent, 'state'> | undefined {
  const exercises = new Map(context.catalog.exercises.map((item) => [item.id, item]));
  const fits = context.catalog.routines.filter((routine) => {
    const seconds = routineDurationSec(routine);
    return (
      seconds > PAUSE_SIZE.activeMaxSec &&
      seconds <= 10 * 60 &&
      routine.steps.every((step) => {
        const exercise = exercises.get(step.exerciseId);
        return exercise !== undefined && isExerciseEligible(exercise, { ...context, slot });
      })
    );
  });
  const routine = weightedPick(fits, routineDurationSec, rng);
  return routine
    ? {
        content: { kind: 'routine', routineId: routine.id },
        durationSec: routineDurationSec(routine),
      }
    : undefined;
}

/** What today has used so far, so the proposal adds variety. */
function varietyOf(plan: DayPlan, context: ContentContext): VarietyState {
  const micros = plan.activities.filter((item) => item.kind === 'micro');
  const last = micros
    .filter((item) => item.status === 'completed' && item.completedAt !== undefined)
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
    .at(-1);
  return {
    previousExerciseIds: last ? contentExerciseIds(last.content, context.catalog) : [],
    recentExerciseIds: micros.flatMap((item) => contentExerciseIds(item.content, context.catalog)),
    usedRoutineIds: micros.flatMap((item) =>
      item.content.kind === 'routine' ? [item.content.routineId] : [],
    ),
  };
}
