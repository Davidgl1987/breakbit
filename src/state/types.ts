import type { GapOption, GapProposal } from '@/domain/gap/gap';
import type {
  DateKey,
  DayOverrides,
  DayPlan,
  DayRecord,
  DaySchedule,
  Instant,
  Mood,
  NextDayDecision,
  ProgressState,
  SkipReason,
  UserSettings,
  XpEntry,
} from '@/domain/types';
import type { Locale } from '@/i18n/translate';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Prefs {
  theme: ThemePreference;
  locale: Locale;
}

/** Everything saved to IndexedDB. Derived values (streak, level, stats) are never stored. */
export interface PersistedState {
  prefs: Prefs;
  /** Set when onboarding finishes. */
  onboardedAt?: Instant;
  settings: UserSettings;
  /** One-off exceptions to the weekly template, by date. */
  dayOverrides: DayOverrides;
  days: Partial<Record<DateKey, DayRecord>>;
  progress: ProgressState;
  xpLedger: XpEntry[];
  meta: {
    installedAt: Instant;
    lastReconciledAt?: Instant;
  };
}

export interface PrefsActions {
  setTheme: (theme: ThemePreference) => void;
  setLocale: (locale: Locale) => void;
}

export interface SettingsActions {
  /** Applies a settings change; schedules must be valid (the UI validates first). */
  updateSettings: (patch: Partial<UserSettings>) => void;
  completeOnboarding: (settings: UserSettings) => void;
}

export interface CalendarActions {
  /** "Hoy no trabajo" (also once the day has started: its record becomes a day off). */
  markDayOff: (date: DateKey) => void;
  /** "No, cambiar horario" for one date. */
  setCustomSchedule: (date: DateKey, schedule: DaySchedule) => void;
  /** "Sí, repetir horario" onto the next workday. */
  repeatSchedule: (date: DateKey, schedule: DaySchedule) => void;
  /** "No trabajo mañana" + chosen next workday. */
  skipUntil: (from: DateKey, next: DateKey, schedule?: DaySchedule) => void;
  clearOverride: (date: DateKey) => void;
}

export interface DayActions {
  /** "Empezar jornada": saves today's plan; its hours become that day's calendar entry. */
  startDay: (plan: DayPlan) => void;
  /** Saves a re-planned day (new hours, meetings or main activity). */
  updateDayPlan: (plan: DayPlan) => void;
  /** "Hoy sí trabajo" after "Hoy no trabajo": a day under way goes on with its plan. */
  undoDayOff: (date: DateKey) => void;
  /**
   * "Cerrar jornada": what's still open is missed, the good/perfect day XP is earned and
   * the summary is kept, with how the user ends the day and what tomorrow looks like.
   */
  closeDay: (date: DateKey, answers?: { mood?: Mood; nextDay?: NextDayDecision }) => void;
  /** Lazily settles the past: days left under way close, unstarted workdays are absent. */
  closePastDays: (now: Instant) => void;
  /** Recovers the day's latest missed pause (once a day); returns it, started, to play. */
  recoverPause: (date: DateKey) => string | undefined;
}

export interface PauseActions {
  /** The engine: moves every day under way forward to `now` (notified, reminded, missed). */
  reconcile: (now: Instant) => void;
  /** A notification was opened (metrics only: it is not an answer to the pause). */
  notificationOpened: (date: DateKey, id: string) => void;
  /** +5 / +10 / +15 while it fits; later pauses move if they come too close. */
  postponePause: (date: DateKey, id: string, minutes: number) => void;
  /** "Vamos". */
  startPause: (date: DateKey, id: string) => void;
  /** The exercise was finished: completed, with its XP (once). */
  completePause: (date: DateKey, id: string, elapsedSec: number) => void;
  /** "Descartar pausa": −50 XP, with an optional reason. */
  discardPause: (date: DateKey, id: string, reason?: SkipReason) => void;
}

/** Today's main activity: its session and completion. The rules live in domain/main. */
export interface MainActions {
  /** Starts, resumes, or begins another block. */
  startMain: (date: DateKey, id: string) => void;
  /** Pauses the run, or ends the block, keeping the time done. */
  pauseMain: (date: DateKey, id: string) => void;
  /** Done: the time added up, "Terminar", or "Ya la he hecho" (without a session). */
  completeMain: (date: DateKey, id: string) => void;
  /** "Versión corta": the activity's shortest length, before it starts. */
  shortenMain: (date: DateKey, id: string) => void;
}

/** "Tengo un hueco". The rules live in domain/gap. */
export interface GapActions {
  /**
   * Takes a proposal: starts the waiting pause, does the next one now, or adds an extra
   * one. Returns the pause to play, if any (the main activity is started on its own).
   */
  takeGap: (date: DateKey, option: GapOption, proposal: GapProposal) => string | undefined;
}

export interface DataActions {
  /** Clears everything except appearance and language preferences. */
  resetData: () => void;
  /** Replaces all saved data (backup import). */
  replaceData: (state: PersistedState) => void;
}

export type AppState = PersistedState &
  PrefsActions &
  SettingsActions &
  CalendarActions &
  DayActions &
  PauseActions &
  MainActions &
  GapActions &
  DataActions;
