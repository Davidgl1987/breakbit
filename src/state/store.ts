import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clock } from '@/services/clock';
import { idbStateStorage } from '@/services/storage';
import { initialState, pickPersisted } from './initialState';
import { migrateState, STATE_VERSION } from './migrations';
import { calendarActions } from './slices/calendar';
import { dataActions } from './slices/data';
import { dayActions } from './slices/day';
import { gapActions } from './slices/gap';
import { mainActions } from './slices/main';
import { pauseActions } from './slices/pause';
import { prefsActions } from './slices/prefs';
import { settingsActions } from './slices/settings';
import type { AppState, PersistedState } from './types';

export type { AppState, PersistedState, Prefs, ThemePreference } from './types';
export { STATE_VERSION } from './migrations';

/**
 * The single app store. Actions stay thin: they call pure domain functions and log
 * events; anything derived (streak, level, stats) is computed by selectors.
 */
export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedState>(
    (set, get) => ({
      ...initialState(clock.now()),
      ...prefsActions(set),
      ...settingsActions(set),
      ...calendarActions(set),
      ...dayActions(set, get),
      ...pauseActions(set, get),
      ...mainActions(set, get),
      ...gapActions(set, get),
      ...dataActions(set),
    }),
    {
      name: 'breakbit:state',
      version: STATE_VERSION,
      storage: createJSONStorage(() => idbStateStorage),
      partialize: pickPersisted,
      migrate: (persisted, version) => migrateState(persisted, version, clock.now()),
    },
  ),
);
