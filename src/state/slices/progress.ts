import type { StoreApi } from 'zustand';
import { CATALOG } from '@/content/catalog';
import { ROOM_ITEMS } from '@/content/roomItems';
import { isWorkday } from '@/domain/calendar/schedule';
import { evaluateWeeks } from '@/domain/progress/weekly';
import { toDateKey } from '@/domain/time';
import type { AppState, ProgressActions } from '../types';

const ROOM_ITEM_IDS = ROOM_ITEMS.map((item) => item.id);

/** Weekly evaluation: the avatar's phase and, at the top, the room. */
export function progressActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): ProgressActions {
  return {
    evaluateWeeks: (now) => {
      const state = get();
      if (state.onboardedAt === undefined) return;
      const progress = evaluateWeeks(
        state.progress,
        toDateKey(now),
        {
          since: toDateKey(state.onboardedAt),
          days: state.days,
          isWorkday: (date) => isWorkday(date, state.settings, state.dayOverrides),
          catalog: CATALOG,
        },
        ROOM_ITEM_IDS,
      );
      if (progress !== state.progress) set({ progress });
    },

    markWeekSeen: (week) => {
      set((state) =>
        state.progress.lastSeenWeek !== undefined && week <= state.progress.lastSeenWeek
          ? state
          : { progress: { ...state.progress, lastSeenWeek: week } },
      );
    },
  };
}
