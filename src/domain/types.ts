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
  completionMode: CompletionMode;
  /** Can be done during a meeting marked "puedo moverme". */
  meetingFriendly: boolean;
  /** Needs a real break (going out, floor work…), not just a work slot. */
  needsBreak: boolean;
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
