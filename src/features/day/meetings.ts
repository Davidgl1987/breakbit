import { fromMinutes, isValidHHmm, toMinutes } from '@/domain/time';
import type { Meeting } from '@/domain/types';
import type { TimeRange } from '@/features/schedule/timeRange';

/** The usual meeting: half an hour. */
export const DEFAULT_MEETING_MIN = 30;
/** 23:59: a meeting never ends past midnight. */
const LAST_MINUTE = 24 * 60 - 1;

/** An id for a new meeting of the day: m1, m2… skipping any already taken. */
export function nextMeetingId(meetings: readonly Meeting[]): string {
  const taken = new Set(meetings.map((meeting) => meeting.id));
  let n = meetings.length + 1;
  while (taken.has(`m${n}`)) n++;
  return `m${n}`;
}

/**
 * A new start brings the end along, half an hour later; the end can then be changed on
 * its own for a longer meeting.
 */
export function withDefaultLength(current: TimeRange, next: TimeRange): TimeRange {
  if (next.start === current.start || !isValidHHmm(next.start)) return next;
  const end = Math.min(toMinutes(next.start) + DEFAULT_MEETING_MIN, LAST_MINUTE);
  return { start: next.start, end: fromMinutes(end) };
}
