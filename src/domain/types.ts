/**
 * Core domain types. Pure TypeScript: no React, no storage, no UI.
 */

/** Local calendar date, 'YYYY-MM-DD'. */
export type DateKey = `${number}-${number}-${number}`;
/** Local wall-clock time, 'HH:mm'. */
export type HHmm = `${number}:${number}`;
/** ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** Epoch milliseconds. */
export type Instant = number;

export type LocaleCode = 'es' | 'en';
export type Localized = Record<LocaleCode, string>;

export const BODY_AREAS = ['neck', 'back', 'shoulders', 'wrists', 'eyes', 'sedentary'] as const;
export type BodyArea = (typeof BODY_AREAS)[number];

/** "Ninguno" is represented by an empty equipment list. Walking outside is always available. */
export const EQUIPMENT = ['pullup_bar', 'dumbbells', 'kettlebell', 'mat', 'standing_desk'] as const;
export type EquipmentId = (typeof EQUIPMENT)[number];

export type Intensity = 'soft' | 'normal' | 'active';
export type DiscomfortLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type DiscomfortLevels = Record<BodyArea, DiscomfortLevel>;

// ---------- Schedule ----------

export interface TimeBlock {
  start: HHmm;
  durationMin: number;
}

/** The working hours of one day (the template, or a one-off override). */
export interface DaySchedule {
  workStart: HHmm;
  workEnd: HHmm;
  breaks: TimeBlock[];
  lunch?: TimeBlock;
}

export interface NotificationPrefs {
  enabled: boolean;
  dayStart: boolean;
  microbreaks: boolean;
  dayEnd: boolean;
}

export interface UserSettings {
  workDays: Weekday[];
  /** Usual schedule; a template, not a rigid calendar. */
  schedule: DaySchedule;
  intensity: Intensity;
  discomfort: DiscomfortLevels;
  equipment: EquipmentId[];
  preferredMainActivityMin: number;
  notifications: NotificationPrefs;
}

/**
 * One-off exception for a specific date. Takes priority over the weekly template.
 * - `working: false` → day off (no notifications, excluded from weekly stats, keeps the streak).
 * - `working: true` with `schedule` → custom hours; without `schedule` → template hours.
 */
export interface DayOverride {
  date: DateKey;
  working: boolean;
  schedule?: DaySchedule;
  source: 'repeated' | 'custom' | 'day_off';
}

export type DayOverrides = Partial<Record<DateKey, DayOverride>>;

export interface Meeting {
  id: string;
  start: HHmm;
  end: HHmm;
  /** "Puedo moverme durante esta reunión" (camera off, can stand or walk). */
  canMove: boolean;
}

// ---------- Content ----------

/**
 * - 'standing': needs standing up.
 * - 'either': can be done seated, standing is better ("Si puedes, hazlo mejor de pie").
 * - 'floor': needs a mat / a real break.
 */
export type Posture = 'standing' | 'either' | 'floor';
export type MeetingFriendly = 'yes' | 'partial' | 'no';

/** A single movement used for microbreaks and routines. */
export interface Exercise {
  id: string;
  name: Localized;
  description: Localized;
  steps: Localized[];
  areas: BodyArea[];
  equipment: EquipmentId[];
  durationSec: number;
  posture: Posture;
  meetingFriendly: MeetingFriendly;
}

/** A sequence of exercises. Its pause type follows from its total duration. */
export interface Routine {
  id: string;
  name: Localized;
  steps: { exerciseId: string; seconds: number }[];
}

export type CompletionMode = 'continuous' | 'accumulated';

/** The daily "misión principal": a longer block needed for a good day. */
export interface MainActivity {
  id: string;
  name: Localized;
  description: Localized;
  steps: Localized[];
  equipment: EquipmentId[];
  durationMin: { min: number; max: number };
  /**
   * A short version that still makes sense ("versión corta" at the end of the day), in
   * minutes. Only activities that declare one offer it.
   */
  shortVersionMin?: number;
  completionMode: CompletionMode;
  /**
   * Where it fits: 'break' (going out, floor work…), 'work' (any time at the desk),
   * 'meeting' (a meeting marked "puedo moverme").
   */
  slots: ActivitySlot[];
  /** Done while working (standing desk, walking meeting): it does not interrupt work. */
  whileWorking: boolean;
  /** Optional guided routine for the activity. */
  routineId?: string;
}

/** Content the planner chooses from. Passed in as data so domain logic stays testable. */
export interface Catalog {
  exercises: readonly Exercise[];
  routines: readonly Routine[];
  mainActivities: readonly MainActivity[];
}

/**
 * Microbreak size, by duration:
 * micro 30–60 s (1 exercise) · reset 90–120 s (2–4 movements) · active 2–3 min.
 */
export type PauseType = 'micro' | 'reset' | 'active';

export type ActivitySlot = 'work' | 'break' | 'meeting';

// ---------- Plan ----------

export type ActivityStatus =
  'pending' | 'notification_sent' | 'postponed' | 'completed' | 'skipped' | 'missed';

/** plan = generated for the day · gap = "Tengo un hueco" extra · recovery = end-of-day recovery. */
export type ActivityOrigin = 'plan' | 'gap' | 'recovery';
export type MissReason = 'window_expired' | 'no_room' | 'day_closed';
export type SkipReason =
  'focused' | 'meeting' | 'no_time' | 'not_in_mood' | 'dislike_exercise' | 'other';

/** What the user does: one exercise (micro), 2–3 combined (reset), a routine, or the main activity. */
export type ActivityContent =
  | { kind: 'exercises'; exerciseIds: string[] }
  | { kind: 'routine'; routineId: string }
  | { kind: 'main'; activityId: string };

export interface ScheduledActivity {
  id: string;
  kind: 'micro' | 'main';
  origin: ActivityOrigin;
  content: ActivityContent;
  pauseType?: PauseType;
  slot: ActivitySlot;
  durationSec: number;
  /** Original time from the plan; never changes. */
  scheduledAt: Instant;
  /** Current time after postpones and re-plans. */
  currentScheduledAt: Instant;
  status: ActivityStatus;
  notificationSentAt?: Instant;
  notificationOpenedAt?: Instant;
  remindersSent: number;
  /** Explicit postpones only; ignored time is derived from the window. */
  postponeMinutes: number;
  postponeCount: number;
  startedAt?: Instant;
  completedAt?: Instant;
  elapsedSec?: number;
  skipReason?: SkipReason;
  missReason?: MissReason;
  firstPrompt?: boolean;
  completionMode?: CompletionMode;
  /** Main activity: time its earlier runs (or blocks) added up to, in whole seconds. */
  accumulatedSec?: number;
  /** Main activity: when the run under way started; none while paused or between blocks. */
  runningSince?: Instant;
}

export interface DayPlan {
  date: DateKey;
  schedule: DaySchedule;
  meetings: Meeting[];
  rerollCount: number;
  /** Microbreaks the intensity asks for; the plan may hold fewer if the day has no room. */
  targetMicroCount: number;
  /** Sorted by original time. */
  activities: ScheduledActivity[];
}

// ---------- Day, progress and history ----------

/**
 * - active: the workday is being tracked.
 * - closed: summary taken (by the user or automatically the next time the app opens).
 * - day_off: "Hoy no trabajo"; excluded from weekly stats, keeps the streak.
 * - absent: a planned workday the app was never opened; counts as not good.
 */
export type DayStatus = 'active' | 'closed' | 'day_off' | 'absent';
export type Mood = 'great' | 'good' | 'loaded' | 'bad';
export type NextDayDecision = 'repeat' | 'change' | 'day_off';

/** Snapshot taken when a day closes, so history stays stable if rules or content change. */
export interface DailySummary {
  planned: number;
  completed: number;
  firstPrompt: number;
  postponed: number;
  ignored: number;
  skipped: number;
  missed: number;
  extras: number;
  mainCompleted: boolean;
  microSec: number;
  movementSec: number;
  interruptionSec: number;
  xp: number;
  isGood: boolean;
  isPerfect: boolean;
}

export interface DayRecord {
  date: DateKey;
  status: DayStatus;
  /** Absent days have no plan. */
  plan?: DayPlan;
  openedAt?: Instant;
  closedAt?: Instant;
  /** First workday after an absence: ×1.5 base XP (once per absence). */
  returnBonus: boolean;
  recoveryUsed: boolean;
  mood?: Mood;
  nextDayDecision?: NextDayDecision;
  summary?: DailySummary;
}

export type EvolutionPhase = 1 | 2 | 3 | 4 | 5;
export type WeekResult = 'good' | 'regular' | 'bad' | 'neutral';

export interface WeeklyResult {
  /** ISO week id, e.g. '2026-W40'. */
  week: string;
  planned: number;
  good: number;
  result: WeekResult;
  phaseAfter: EvolutionPhase;
}

export interface ProgressState {
  evolutionPhase: EvolutionPhase;
  lastEvaluatedWeek?: string;
  weeklyResults: WeeklyResult[];
  unlockedRoomItems: string[];
}

export type XpReason =
  | 'microbreak'
  | 'main_activity'
  | 'first_prompt'
  | 'extra_break'
  | 'good_day'
  | 'perfect_day'
  | 'discard';

/** Append-only XP ledger entry; `key` is deterministic so awards are idempotent. */
export interface XpEntry {
  key: string;
  amount: number;
  at: Instant;
  date: DateKey;
  reason: XpReason;
}

/** Dogfooding events (breakbit_mvp_master_v1.md §25), stored locally only. */
export const EVENT_TYPES = [
  'notification_sent',
  'notification_opened',
  'exercise_started',
  'exercise_completed',
  'exercise_completed_first_prompt',
  'exercise_postponed',
  'exercise_ignored',
  'exercise_skipped',
  'exercise_missed',
  'spontaneous_break',
  'main_activity_completed',
  'day_completed',
  'day_off_marked',
  'mood_recorded',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface AppEvent {
  id: string;
  type: EventType;
  at: Instant;
  date: DateKey;
  activityId?: string;
  data?: Record<string, string | number | boolean>;
}
