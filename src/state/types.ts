import type {
  DateKey,
  DayOverrides,
  DayPlan,
  DayRecord,
  DaySchedule,
  Instant,
  ProgressState,
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
  DataActions;
