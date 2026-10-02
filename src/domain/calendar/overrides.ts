import { addDays, compareDateKeys } from '../time';
import type { DateKey, DayOverrides, DaySchedule, UserSettings } from '../types';
import { isWorkday, sameSchedule } from './schedule';

type CalendarSettings = Pick<UserSettings, 'workDays' | 'schedule'>;

/** "Hoy no trabajo": the date becomes a day off (also valid once the day has started). */
export function markDayOff(overrides: DayOverrides, date: DateKey): DayOverrides {
  return { ...overrides, [date]: { date, working: false, source: 'day_off' } };
}

/** "No, cambiar horario": one-off hours for `date`; the weekly template is untouched. */
export function setCustomSchedule(
  overrides: DayOverrides,
  date: DateKey,
  schedule: DaySchedule,
): DayOverrides {
  return { ...overrides, [date]: { date, working: true, schedule, source: 'custom' } };
}

/**
 * "Sí, repetir horario": `date` uses `schedule` (typically today's hours).
 * If that is exactly the template on a template workday, no override is needed.
 */
export function repeatSchedule(
  overrides: DayOverrides,
  settings: CalendarSettings,
  date: DateKey,
  schedule: DaySchedule,
): DayOverrides {
  const withoutDate = clearOverride(overrides, date);
  const templateCovers = isWorkday(date, settings, {}) && sameSchedule(schedule, settings.schedule);
  if (templateCovers) return withoutDate;
  return { ...withoutDate, [date]: { date, working: true, schedule, source: 'repeated' } };
}

/**
 * "No trabajo mañana" + chosen next workday: every day from `from` until the day before
 * `next` that would be a workday becomes a day off, and `next` is guaranteed to be a
 * workday (template hours unless `schedule` is given).
 */
export function skipUntil(
  overrides: DayOverrides,
  settings: CalendarSettings,
  from: DateKey,
  next: DateKey,
  schedule?: DaySchedule,
): DayOverrides {
  if (compareDateKeys(next, from) <= 0) {
    throw new Error(`Next workday ${next} must be after ${from}`);
  }
  let result = overrides;
  for (let date = from; compareDateKeys(date, next) < 0; date = addDays(date, 1)) {
    if (isWorkday(date, settings, result)) result = markDayOff(result, date);
  }
  if (schedule) return setCustomSchedule(result, next, schedule);
  if (!isWorkday(next, settings, result)) {
    return { ...result, [next]: { date: next, working: true, source: 'custom' } };
  }
  return result;
}

export function clearOverride(overrides: DayOverrides, date: DateKey): DayOverrides {
  if (!(date in overrides)) return overrides;
  const { [date]: _removed, ...rest } = overrides;
  return rest;
}
