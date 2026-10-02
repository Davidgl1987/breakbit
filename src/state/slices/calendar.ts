import type { StoreApi } from 'zustand';
import * as overrides from '@/domain/calendar/overrides';
import { logEvent } from '@/services/eventLog';
import type { AppState, CalendarActions } from '../types';
import { assertValidSchedule } from './settings';

/** Thin wrappers over the pure calendar rules in domain/calendar. */
export function calendarActions(set: StoreApi<AppState>['setState']): CalendarActions {
  return {
    markDayOff: (date) => {
      set((state) => ({ dayOverrides: overrides.markDayOff(state.dayOverrides, date) }));
      void logEvent('day_off_marked', { data: { date } }).catch(() => {});
    },
    setCustomSchedule: (date, schedule) => {
      assertValidSchedule(schedule);
      set((state) => ({
        dayOverrides: overrides.setCustomSchedule(state.dayOverrides, date, schedule),
      }));
    },
    repeatSchedule: (date, schedule) => {
      set((state) => ({
        dayOverrides: overrides.repeatSchedule(state.dayOverrides, state.settings, date, schedule),
      }));
    },
    skipUntil: (from, next, schedule) => {
      if (schedule) assertValidSchedule(schedule);
      set((state) => ({
        dayOverrides: overrides.skipUntil(state.dayOverrides, state.settings, from, next, schedule),
      }));
    },
    clearOverride: (date) => {
      set((state) => ({ dayOverrides: overrides.clearOverride(state.dayOverrides, date) }));
    },
  };
}
