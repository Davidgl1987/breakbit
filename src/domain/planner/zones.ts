import { PLANNER } from '../config';
import type { Zone } from './resolve';
import type { DayTimeline, Interval } from './timeline';

/** The main activity's time; one done while working (standing desk, walking meeting) doesn't
 * stop work, so it needs no buffers around it. */
export interface MainInterval extends Interval {
  whileWorking?: boolean;
}

/** Where microbreaks can't go: lunch, busy meetings, movable meetings (unless discreet) and the
 * main activity (with buffers, unless it is done while working). */
export function microbreakZones(timeline: DayTimeline, main?: MainInterval): Zone[] {
  return [
    ...(timeline.lunch ? [{ ...timeline.lunch, kind: 'lunch' as const }] : []),
    ...timeline.busyMeetings.map((interval) => ({ ...interval, kind: 'busy_meeting' as const })),
    ...timeline.moveMeetings.map((interval) => ({ ...interval, kind: 'move_meeting' as const })),
    ...(main
      ? [
          {
            start: main.whileWorking ? main.start : main.start - PLANNER.mainPreBufferMin,
            end: main.whileWorking ? main.end : main.end + PLANNER.mainPostBufferMin,
            kind: 'main' as const,
          },
        ]
      : []),
  ];
}
