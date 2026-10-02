import { addDays, toMinutes, weekdayOf } from '../time';
import type { DateKey, DayOverrides, DaySchedule, UserSettings } from '../types';

/** How far ahead `nextWorkday` searches before giving up. */
const NEXT_WORKDAY_HORIZON_DAYS = 366;

/**
 * Working hours for `date`, or null if it is not a workday.
 * An explicit override for the date wins; otherwise the weekly template applies.
 */
export function resolveDaySchedule(
  date: DateKey,
  settings: Pick<UserSettings, 'workDays' | 'schedule'>,
  overrides: DayOverrides,
): DaySchedule | null {
  const override = overrides[date];
  if (override) return override.working ? (override.schedule ?? settings.schedule) : null;
  return settings.workDays.includes(weekdayOf(date)) ? settings.schedule : null;
}

export function isWorkday(
  date: DateKey,
  settings: Pick<UserSettings, 'workDays' | 'schedule'>,
  overrides: DayOverrides,
): boolean {
  return resolveDaySchedule(date, settings, overrides) !== null;
}

/** First workday strictly after `after`, or null if none within a year. */
export function nextWorkday(
  after: DateKey,
  settings: Pick<UserSettings, 'workDays' | 'schedule'>,
  overrides: DayOverrides,
): DateKey | null {
  for (let offset = 1; offset <= NEXT_WORKDAY_HORIZON_DAYS; offset++) {
    const date = addDays(after, offset);
    if (isWorkday(date, settings, overrides)) return date;
  }
  return null;
}

/** Work minutes excluding lunch (breaks still count: they can host microbreaks). */
export function effectiveWorkMinutes(schedule: DaySchedule): number {
  const span = toMinutes(schedule.workEnd) - toMinutes(schedule.workStart);
  return Math.max(span - (schedule.lunch?.durationMin ?? 0), 0);
}

/** Structural equality, ignoring the order of breaks. */
export function sameSchedule(a: DaySchedule, b: DaySchedule): boolean {
  const breaks = (schedule: DaySchedule) =>
    [...schedule.breaks]
      .sort((x, y) => toMinutes(x.start) - toMinutes(y.start))
      .map((block) => `${block.start}+${block.durationMin}`)
      .join(',');
  const lunch = (schedule: DaySchedule) =>
    schedule.lunch ? `${schedule.lunch.start}+${schedule.lunch.durationMin}` : '';
  return (
    a.workStart === b.workStart &&
    a.workEnd === b.workEnd &&
    breaks(a) === breaks(b) &&
    lunch(a) === lunch(b)
  );
}
