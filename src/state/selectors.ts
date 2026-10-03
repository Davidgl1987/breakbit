import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import { isWorkday } from '@/domain/calendar/schedule';
import { currentStreak } from '@/domain/progress/streak';
import { levelFromXp, totalXp } from '@/domain/progress/xp';
import { toDateKey } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { useAppStore, type AppState } from './store';

export const selectIsOnboarded = (state: AppState) => state.onboardedAt !== undefined;

export const selectDay = (date: DateKey) => (state: AppState) => state.days[date];

export const selectTotalXp = (state: AppState) => totalXp(state.xpLedger);

/** XP earned (or lost) on a given day. */
export const selectXpOn = (date: DateKey) => (state: AppState) =>
  state.xpLedger.reduce((sum, entry) => (entry.date === date ? sum + entry.amount : sum), 0);

export function useLevel() {
  const total = useAppStore(selectTotalXp);
  return useMemo(() => ({ total, ...levelFromXp(total) }), [total]);
}

/** Consecutive good workdays up to `today` (counted from the onboarding day). */
export function useStreak(today: DateKey): number {
  const days = useAppStore((state) => state.days);
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const onboardedAt = useAppStore((state) => state.onboardedAt);
  return useMemo(() => {
    if (onboardedAt === undefined) return 0;
    return currentStreak({
      today,
      since: toDateKey(onboardedAt),
      days,
      isWorkday: (date) => isWorkday(date, settings, overrides),
      catalog: CATALOG,
    });
  }, [today, days, settings, overrides, onboardedAt]);
}
