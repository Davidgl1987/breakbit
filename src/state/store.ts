import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { detectLocale, type Locale } from '@/i18n/translate';
import { idbStateStorage } from '@/services/storage';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Prefs {
  theme: ThemePreference;
  locale: Locale;
}

export interface AppState {
  prefs: Prefs;
  setTheme: (theme: ThemePreference) => void;
  setLocale: (locale: Locale) => void;
}

/** Bump together with a `migrate` step whenever the persisted shape changes. */
export const STATE_VERSION = 1;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      prefs: { theme: 'system', locale: detectLocale() },
      setTheme: (theme) => set((state) => ({ prefs: { ...state.prefs, theme } })),
      setLocale: (locale) => set((state) => ({ prefs: { ...state.prefs, locale } })),
    }),
    {
      name: 'breakbit:state',
      version: STATE_VERSION,
      storage: createJSONStorage(() => idbStateStorage),
      partialize: (state) => ({ prefs: state.prefs }),
    },
  ),
);
