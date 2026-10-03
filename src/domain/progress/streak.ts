import { dayProgress } from '../day/progress';
import { addDays, compareDateKeys } from '../time';
import type { Catalog, DateKey, DayRecord } from '../types';

export interface StreakInput {
  today: DateKey;
  /** First day that counts (the onboarding day). */
  since: DateKey;
  days: Partial<Record<DateKey, DayRecord>>;
  isWorkday: (date: DateKey) => boolean;
  catalog: Catalog;
}

type Verdict = 'good' | 'bad' | 'skip';

/**
 * Consecutive good workdays up to today. Rest days and days off neither add nor break
 * it; a planned workday that wasn't good (or wasn't opened) breaks it. Today adds only
 * once it is good, and never breaks it while it is still going on.
 */
export function currentStreak({ today, since, days, isWorkday, catalog }: StreakInput): number {
  let streak = 0;
  for (let date = today; compareDateKeys(date, since) >= 0; date = addDays(date, -1)) {
    const verdict = dayVerdict(days[date], date === today, () => isWorkday(date), catalog);
    if (verdict === 'bad') break;
    if (verdict === 'good') streak++;
  }
  return streak;
}

function dayVerdict(
  record: DayRecord | undefined,
  isToday: boolean,
  isWorkday: () => boolean,
  catalog: Catalog,
): Verdict {
  if (!record) return isToday || !isWorkday() ? 'skip' : 'bad';
  switch (record.status) {
    case 'day_off':
      return 'skip';
    case 'absent':
      return 'bad';
    case 'closed':
      return record.summary?.isGood ? 'good' : 'bad';
    case 'active': {
      const good = record.plan !== undefined && dayProgress(record.plan, catalog).isGood;
      if (good) return 'good';
      return isToday ? 'skip' : 'bad';
    }
  }
}
