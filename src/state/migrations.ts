import type { Instant } from '@/domain/types';
import { defaultPrefs, initialState } from './initialState';
import type { PersistedState, Prefs } from './types';

/**
 * Persisted schema version. Bump it and add a step below whenever the saved shape
 * changes, so existing users (and backups) keep their data.
 */
export const STATE_VERSION = 3;

type Step = (state: unknown, now: Instant) => unknown;

const STEPS: Record<number, Step> = {
  // v1 (Fase 1) only stored appearance and language.
  2: (state, now) => {
    const prefs = (state as { prefs?: Partial<Prefs> } | undefined)?.prefs;
    return initialState(now, { ...defaultPrefs(), ...prefs });
  },
  // v3: the pause sound, on unless already chosen.
  3: (state) => {
    if (!isRecord(state) || !isRecord(state.settings)) return state;
    const { settings } = state;
    if (!isRecord(settings.notifications)) return state;
    return {
      ...state,
      settings: { ...settings, notifications: { sound: true, ...settings.notifications } },
    };
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Brings a saved state from `version` up to STATE_VERSION. */
export function migrateState(state: unknown, version: number, now: Instant): PersistedState {
  if (version > STATE_VERSION) {
    throw new Error(`Saved data is from a newer version (${version} > ${STATE_VERSION})`);
  }
  let current = state;
  for (let next = version + 1; next <= STATE_VERSION; next++) {
    const step = STEPS[next];
    if (!step) throw new Error(`Missing migration to version ${next}`);
    current = step(current, now);
  }
  return current as PersistedState;
}
