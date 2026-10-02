import type { StoreApi } from 'zustand';
import { validateSchedule } from '@/domain/calendar/validation';
import type { DaySchedule } from '@/domain/types';
import { clock } from '@/services/clock';
import type { AppState, SettingsActions } from '../types';

export function settingsActions(set: StoreApi<AppState>['setState']): SettingsActions {
  return {
    updateSettings: (patch) => {
      if (patch.schedule) assertValidSchedule(patch.schedule);
      set((state) => ({ settings: { ...state.settings, ...patch } }));
    },
    completeOnboarding: (settings) => {
      assertValidSchedule(settings.schedule);
      set({ settings, onboardedAt: clock.now() });
    },
  };
}

/** Screens validate before saving; reaching this with an invalid schedule is a bug. */
export function assertValidSchedule(schedule: DaySchedule): void {
  const issues = validateSchedule(schedule);
  if (issues.length > 0) {
    throw new Error(`Invalid schedule: ${issues.map((issue) => issue.code).join(', ')}`);
  }
}
