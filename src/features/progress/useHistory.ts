import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import { isWorkday } from '@/domain/calendar/schedule';
import type { HistoryInput } from '@/domain/stats/days';
import { toDateKey } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { useAppStore } from '@/state/store';

/** Everything the stats read: the saved days, the calendar and the onboarding day. */
export function useHistory(today: DateKey): HistoryInput {
  const days = useAppStore((state) => state.days);
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const onboardedAt = useAppStore((state) => state.onboardedAt);
  return useMemo(
    () => ({
      today,
      since: onboardedAt === undefined ? today : toDateKey(onboardedAt),
      days,
      isWorkday: (date: DateKey) => isWorkday(date, settings, overrides),
      catalog: CATALOG,
    }),
    [today, days, settings, overrides, onboardedAt],
  );
}
