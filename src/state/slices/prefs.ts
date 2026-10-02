import type { StoreApi } from 'zustand';
import type { AppState, PrefsActions } from '../types';

export function prefsActions(set: StoreApi<AppState>['setState']): PrefsActions {
  return {
    setTheme: (theme) => set((state) => ({ prefs: { ...state.prefs, theme } })),
    setLocale: (locale) => set((state) => ({ prefs: { ...state.prefs, locale } })),
  };
}
