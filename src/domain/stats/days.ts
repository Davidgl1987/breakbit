import { summarizeDay } from '../day/closeDay';
import { compareDateKeys } from '../time';
import type { Catalog, DailySummary, DateKey, DayRecord } from '../types';

export interface HistoryInput {
  today: DateKey;
  /** The onboarding day: nothing before it exists. */
  since: DateKey;
  days: Partial<Record<DateKey, DayRecord>>;
  isWorkday: (date: DateKey) => boolean;
  catalog: Catalog;
}

/**
 * What a calendar day was, for the stats:
 * - before / future: outside the history;
 * - off: a rest day or "Hoy no trabajo" (neither counts nor breaks anything);
 * - absent: a planned workday nobody started;
 * - pending: today, a workday not started yet;
 * - worked: a day under way or closed, with its numbers.
 */
export type DayStat =
  | { date: DateKey; kind: 'before' | 'future' | 'off' | 'absent' | 'pending' }
  | { date: DateKey; kind: 'worked'; summary: DailySummary };

export function dayStat(date: DateKey, input: HistoryInput): DayStat {
  const { today, since, days, isWorkday, catalog } = input;
  if (compareDateKeys(date, since) < 0) return { date, kind: 'before' };
  if (compareDateKeys(date, today) > 0) return { date, kind: 'future' };
  const record = days[date];
  switch (record?.status) {
    case 'closed':
      return record.summary
        ? { date, kind: 'worked', summary: record.summary }
        : { date, kind: 'absent' };
    case 'active':
      return record.plan
        ? { date, kind: 'worked', summary: summarizeDay(record.plan, catalog, 0) }
        : { date, kind: 'pending' };
    case 'absent':
      return { date, kind: 'absent' };
    case 'day_off':
      return { date, kind: 'off' };
    default:
      // The onboarding day only counts if it was worked.
      if (!isWorkday(date) || date === since) return { date, kind: 'off' };
      return { date, kind: date === today ? 'pending' : 'absent' };
  }
}
