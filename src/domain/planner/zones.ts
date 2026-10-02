import { PLANNER } from '../config';
import type { Zone } from './resolve';
import type { DayTimeline, Interval } from './timeline';

/** Where microbreaks can't go: lunch, busy meetings, movable meetings (unless discreet) and the
 * main activity with its buffers. */
export function microbreakZones(timeline: DayTimeline, main?: Interval): Zone[] {
  return [
    ...(timeline.lunch ? [{ ...timeline.lunch, kind: 'lunch' as const }] : []),
    ...timeline.busyMeetings.map((interval) => ({ ...interval, kind: 'busy_meeting' as const })),
    ...timeline.moveMeetings.map((interval) => ({ ...interval, kind: 'move_meeting' as const })),
    ...(main
      ? [
          {
            start: main.start - PLANNER.mainPreBufferMin,
            end: main.end + PLANNER.mainPostBufferMin,
            kind: 'main' as const,
          },
        ]
      : []),
  ];
}
