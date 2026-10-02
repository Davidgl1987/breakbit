/**
 * Product rules, centralised so they can be tuned during dogfooding.
 * Pure data: no logic lives here (it arrives with the planner and engine phases).
 * See docs/decisions.md for the reasoning behind each value.
 */

/** Pause sizes by duration (seconds): micro 30–60 s, reset 90–120 s, active 2–3 min. */
export const PAUSE_SIZE = {
  microMaxSec: 60,
  resetMaxSec: 120,
} as const;

/** Weighted exercise selection driven by the discomfort sliders. */
export const SELECTION = {
  /** Every area keeps some weight so plans stay varied even with all sliders at 0. */
  areaBaseWeight: 1,
  areaWeightPerLevel: 2,
  /**
   * The area just worked may repeat only when its weight is at least this many times
   * the weight of all other available areas together ("salvo alta prioridad").
   */
  areaRepeatDominance: 2,
  /** Relative weight of exercises used recently (others weigh 1). */
  recentExerciseWeight: 0.25,
} as const;

/** Microbreaks per effective work hour (work time minus lunch). */
export const PAUSES_PER_HOUR = {
  soft: 0.5,
  normal: 0.75,
  active: 1,
} as const;

export const SPACING = {
  /** Ideal gap between microbreaks, in minutes. */
  idealMinGapMin: 45,
  idealMaxGapMin: 90,
  /** Minimum gap tolerated after a re-plan (postpone, missed, early completion). */
  minGapAfterReplanMin: 35,
  /** How far the next break may move earlier after one is missed. */
  missedAdvanceMaxMin: 10,
} as const;

export const PAUSE_WINDOW = {
  /** Total validity window from the original scheduledAt; ignoring consumes it too. */
  validityMin: 30,
  /** Postpone options offered while they still fit inside the window. */
  postponeOptionsMin: [5, 10, 15],
  /** Reminder cadence when a notification is ignored. */
  reminderEveryMin: 10,
} as const;

export const GAP = {
  /** Minimum time since the last break for "Tengo un hueco" to advance the next one. */
  advanceMinSinceLastMin: 35,
  /** The next planned break must be at most this far away to be advanced. */
  advanceMaxAheadMin: 45,
  /** Minimum time since the last movement for an extra break to award XP. */
  extraXpCooldownMin: 20,
  /** Optional daily cap of extra breaks with XP. `null` disables the cap. */
  extraXpDailyCap: 3 as number | null,
} as const;

export const XP = {
  microbreak: 100,
  mainActivity: 300,
  firstPrompt: 20,
  extraBreak: 10,
  goodDay: 200,
  perfectDay: 100,
  discard: -50,
  /** Applies only to the base XP of planned microbreaks and the main activity. */
  returnMultiplier: 1.5,
} as const;

/** Level curve (not final): XP needed to go from one level to the next. */
export const LEVEL = {
  xpPerLevel: 1000,
} as const;

export const GOALS = {
  /** A good day needs at least this share of planned microbreaks plus the main activity. */
  goodDayMinRatio: 0.7,
  /** Recoverable missed microbreaks at the end of the day. */
  maxRecoveriesPerDay: 1,
} as const;

export const WEEK = {
  /** Planned workdays needed for a week to affect evolution. */
  minPlannedDays: 3,
  goodWeekMinRatio: 0.7,
  regularWeekMinRatio: 0.4,
  minPhase: 1,
  maxPhase: 5,
} as const;

/** End-of-day summary is offered this many minutes before the configured end. */
export const DAY_END_LEAD_MIN = 10;
