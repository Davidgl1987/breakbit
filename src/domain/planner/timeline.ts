import { toMinutes } from '../time';
import type { ActivitySlot, DaySchedule, Meeting } from '../types';

/**
 * Planning works in local wall-clock minutes since midnight. DST jumps happen at night,
 * outside supported work hours (no overnight shifts in the MVP).
 */

/** Half-open interval [start, end) in minutes. */
export interface Interval {
  start: number;
  end: number;
}

export interface DayTimeline {
  workStart: number;
  workEnd: number;
  lunch?: Interval;
  breaks: Interval[];
  /** Meetings where the user can't move: no pauses there. */
  busyMeetings: Interval[];
  /** Meetings marked "puedo moverme": discreet pauses or the main activity fit there. */
  moveMeetings: Interval[];
}

export function buildTimeline(
  schedule: DaySchedule,
  meetings: readonly Meeting[] = [],
): DayTimeline {
  const workStart = toMinutes(schedule.workStart);
  const workEnd = toMinutes(schedule.workEnd);
  const clip = (interval: Interval) => clipInterval(interval, { start: workStart, end: workEnd });
  const meetingIntervals = (canMove: boolean) =>
    meetings
      .filter((meeting) => meeting.canMove === canMove)
      .map((meeting) => clip({ start: toMinutes(meeting.start), end: toMinutes(meeting.end) }))
      .filter((interval): interval is Interval => interval !== null)
      .sort(byStart);

  return {
    workStart,
    workEnd,
    lunch: schedule.lunch ? blockInterval(schedule.lunch) : undefined,
    breaks: schedule.breaks.map(blockInterval).sort(byStart),
    busyMeetings: meetingIntervals(false),
    moveMeetings: meetingIntervals(true),
  };
}

/** Work time from `from` onwards, with lunch removed. */
export function workWindows(timeline: DayTimeline, from = timeline.workStart): Interval[] {
  const day = clipInterval(
    { start: Math.max(from, timeline.workStart), end: timeline.workEnd },
    { start: timeline.workStart, end: timeline.workEnd },
  );
  if (!day) return [];
  return subtractIntervals([day], timeline.lunch ? [timeline.lunch] : []);
}

/**
 * Where a moment falls: a meeting where the user can move (a meeting wins over a break
 * it overlaps), a configured break, or work.
 */
export function slotAt(timeline: DayTimeline, minute: number): ActivitySlot {
  if (timeline.moveMeetings.some((interval) => contains(interval, minute))) return 'meeting';
  if (timeline.breaks.some((interval) => contains(interval, minute))) return 'break';
  return 'work';
}

// ---------- Interval helpers ----------

export function intervalLength(interval: Interval): number {
  return interval.end - interval.start;
}

export function contains(interval: Interval, minute: number): boolean {
  return minute >= interval.start && minute < interval.end;
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** `intervals` minus every interval in `cuts`, keeping order. */
export function subtractIntervals(
  intervals: readonly Interval[],
  cuts: readonly Interval[],
): Interval[] {
  let result = [...intervals];
  for (const cut of cuts) {
    result = result.flatMap((interval) => {
      if (!overlaps(interval, cut)) return [interval];
      const pieces: Interval[] = [];
      if (cut.start > interval.start) pieces.push({ start: interval.start, end: cut.start });
      if (cut.end < interval.end) pieces.push({ start: cut.end, end: interval.end });
      return pieces;
    });
  }
  return result;
}

function clipInterval(interval: Interval, bounds: Interval): Interval | null {
  const start = Math.max(interval.start, bounds.start);
  const end = Math.min(interval.end, bounds.end);
  return end > start ? { start, end } : null;
}

function blockInterval(block: { start: DaySchedule['workStart']; durationMin: number }): Interval {
  const start = toMinutes(block.start);
  return { start, end: start + block.durationMin };
}

function byStart(a: Interval, b: Interval): number {
  return a.start - b.start;
}
