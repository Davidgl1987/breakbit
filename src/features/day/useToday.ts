import { resolveDaySchedule } from '@/domain/calendar/schedule';
import { todayState, type TodayState } from '@/domain/day/today';
import { toDateKey } from '@/domain/time';
import type { DateKey, Instant } from '@/domain/types';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';

/** What today is (not started, under way, day off…), re-checked at the given resolution. */
export function useToday(resolutionMs = 5_000): { now: Instant; date: DateKey; state: TodayState } {
  const now = useNow(resolutionMs);
  const date = toDateKey(now);
  const record = useAppStore((state) => state.days[date]);
  const override = useAppStore((state) => state.dayOverrides[date]);
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const schedule = resolveDaySchedule(date, settings, overrides);
  return { now, date, state: todayState({ date, now, record, override, schedule }) };
}
