import { createStore, del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/** IndexedDB-backed key/value storage for the persisted app state. */
const stateStore = createStore('breakbit', 'state');

export const idbStateStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name, stateStore)) ?? null,
  setItem: (name, value) => set(name, value, stateStore),
  removeItem: (name) => del(name, stateStore),
};

/**
 * Per-device conveniences that must be readable synchronously before React mounts
 * (e.g. the resolved theme, to avoid a flash). Never the source of truth.
 */
export const localHints = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(`breakbit:${key}`);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(`breakbit:${key}`, value);
    } catch {
      // Storage can be unavailable (private mode, blocked site data); hints are optional.
    }
  },
};
