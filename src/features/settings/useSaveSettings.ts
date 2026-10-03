import { CATALOG } from '@/content/catalog';
import { recentExerciseIds, replanDay } from '@/domain/day/planDay';
import { workEnd } from '@/domain/day/today';
import { toDateKey } from '@/domain/time';
import type { UserSettings } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';

/**
 * Saves a settings change. Changes that shape the pauses (discomfort, equipment, pace)
 * also re-plan what's left of today, if the day is under way; the hours never touch today
 * (they were confirmed when it started) and future days are planned with the new
 * settings when they start. Returns whether today's plan changed.
 */
export function useSaveSettings() {
  const updateSettings = useAppStore((state) => state.updateSettings);
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);
  return (patch: Partial<UserSettings>, { replanToday }: { replanToday: boolean }): boolean => {
    updateSettings(patch);
    if (!replanToday) return false;
    const state = useAppStore.getState();
    const now = clock.now();
    const date = toDateKey(now);
    const record = state.days[date];
    if (record?.status !== 'active' || !record.plan || now >= workEnd(record.plan)) return false;
    const plan = replanDay(record.plan, {
      settings: state.settings,
      catalog: CATALOG,
      now,
      recentExerciseIds: recentExerciseIds(state.days, date, CATALOG),
    });
    if (plan === record.plan) return false;
    updateDayPlan(plan);
    return true;
  };
}
