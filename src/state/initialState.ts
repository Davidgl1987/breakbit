import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { Instant, ProgressState } from '@/domain/types';
import { detectLocale } from '@/i18n/translate';
import type { PersistedState, Prefs } from './types';

export function defaultPrefs(): Prefs {
  return { theme: 'system', locale: detectLocale() };
}

export const INITIAL_PROGRESS: ProgressState = {
  evolutionPhase: 1,
  weeklyResults: [],
  unlockedRoomItems: [],
};

/** A fresh install: default settings, no history, avatar at phase 1. */
export function initialState(now: Instant, prefs: Prefs = defaultPrefs()): PersistedState {
  return {
    prefs,
    onboardedAt: undefined,
    settings: DEFAULT_SETTINGS,
    dayOverrides: {},
    days: {},
    progress: INITIAL_PROGRESS,
    xpLedger: [],
    meta: { installedAt: now },
  };
}

/** The part of the store that is saved (actions are dropped). */
export function pickPersisted(state: PersistedState): PersistedState {
  return {
    prefs: state.prefs,
    onboardedAt: state.onboardedAt,
    settings: state.settings,
    dayOverrides: state.dayOverrides,
    days: state.days,
    progress: state.progress,
    xpLedger: state.xpLedger,
    meta: state.meta,
  };
}
