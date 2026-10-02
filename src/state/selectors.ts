import { useMemo } from 'react';
import { levelFromXp, totalXp } from '@/domain/progress/xp';
import type { DateKey } from '@/domain/types';
import { useAppStore, type AppState } from './store';

export const selectIsOnboarded = (state: AppState) => state.onboardedAt !== undefined;

export const selectDay = (date: DateKey) => (state: AppState) => state.days[date];

export const selectTotalXp = (state: AppState) => totalXp(state.xpLedger);

export function useLevel() {
  const total = useAppStore(selectTotalXp);
  return useMemo(() => ({ total, ...levelFromXp(total) }), [total]);
}
