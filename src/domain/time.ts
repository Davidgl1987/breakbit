import type { DateKey, HHmm, Instant, Weekday } from './types';

const DAY_MS = 86_400_000;
const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ---------- Dates (local calendar days) ----------

/** Local calendar date of an instant. */
export function toDateKey(instant: Instant | Date): DateKey {
  const date = instant instanceof Date ? instant : new Date(instant);
  return formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function isValidDateKey(value: string): value is DateKey {
  const match = DATE_KEY_RE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Date arithmetic is done in UTC on calendar days, so DST changes never shift a day. */
export function addDays(date: DateKey, days: number): DateKey {
  const shifted = new Date(utcMidnight(date) + days * DAY_MS);
  return formatDateKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: DateKey, to: DateKey): number {
  return Math.round((utcMidnight(to) - utcMidnight(from)) / DAY_MS);
}

/** Lexicographic order is chronological for 'YYYY-MM-DD'. */
export function compareDateKeys(a: DateKey, b: DateKey): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inclusive list of dates from `from` to `to`. */
export function dateRange(from: DateKey, to: DateKey): DateKey[] {
  const length = daysBetween(from, to) + 1;
  return Array.from({ length: Math.max(length, 0) }, (_, index) => addDays(from, index));
}

export function weekdayOf(date: DateKey): Weekday {
  const day = new Date(utcMidnight(date)).getUTCDay();
  return (day === 0 ? 7 : day) as Weekday;
}

/** Monday of the week containing `date` (weeks run Monday–Sunday). */
export function startOfWeek(date: DateKey): DateKey {
  return addDays(date, 1 - weekdayOf(date));
}

/** ISO-8601 week id, e.g. '2026-W40'. */
export function isoWeekKey(date: DateKey): string {
  const thursday = new Date(utcMidnight(date) + (4 - weekdayOf(date)) * DAY_MS);
  const year = thursday.getUTCFullYear();
  const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / DAY_MS / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// ---------- Times of day ----------

export function isValidHHmm(value: string): value is HHmm {
  return HHMM_RE.test(value);
}

/** Minutes since midnight for 'HH:mm'. */
export function toMinutes(time: HHmm): number {
  const match = HHMM_RE.exec(time);
  if (!match) throw new Error(`Invalid time "${time}"`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** 'HH:mm' for minutes since midnight (0–1439). */
export function fromMinutes(minutes: number): HHmm {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 24 * 60) {
    throw new Error(`Minutes out of range: ${minutes}`);
  }
  const hours = Math.floor(minutes / 60);
  return `${pad(hours)}:${pad(minutes % 60)}` as HHmm;
}

/**
 * Instant for a local wall-clock time on a date. Uses the platform's local time zone,
 * so DST transitions are handled by the runtime.
 */
export function atTime(date: DateKey, time: HHmm): Instant {
  const [y, m, d] = dateParts(date);
  const minutes = toMinutes(time);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60).getTime();
}

/** Instant `minutes` after local midnight of `date` (minutes may exceed one day's span). */
export function atMinutes(date: DateKey, minutes: number): Instant {
  const [y, m, d] = dateParts(date);
  return new Date(y, m - 1, d, 0, minutes).getTime();
}

/** Local minutes since midnight of an instant. */
export function minutesOfDay(instant: Instant): number {
  const date = new Date(instant);
  return date.getHours() * 60 + date.getMinutes();
}

export function addMinutes(instant: Instant, minutes: number): Instant {
  return instant + minutes * 60_000;
}

export function minutesBetween(from: Instant, to: Instant): number {
  return (to - from) / 60_000;
}

// ---------- Internals ----------

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month)}-${pad(day)}` as DateKey;
}

function dateParts(date: DateKey): [number, number, number] {
  const match = DATE_KEY_RE.exec(date);
  if (!match) throw new Error(`Invalid date "${date}"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function utcMidnight(date: DateKey): number {
  const [y, m, d] = dateParts(date);
  return Date.UTC(y, m - 1, d);
}
