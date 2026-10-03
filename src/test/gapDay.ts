import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { createActivity } from '@/domain/planner/activities';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan, HHmm, ScheduledActivity } from '@/domain/types';

export const GAP_DATE: DateKey = '2026-10-05';

export const gapAt = (time: HHmm) => atTime(GAP_DATE, time);

export function gapPause(n: number, time: HHmm): ScheduledActivity {
  return createActivity({
    id: `${GAP_DATE}:p${n}`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
    slot: 'work',
    durationSec: 40,
    pauseType: 'micro',
    at: gapAt(time),
  });
}

/**
 * A known day for "Tengo un hueco": default hours (09:00–17:00, break at 11:00, lunch at
 * 14:00), pauses at 10:00, 12:30 and 16:00, and a 20 min walk at 13:00.
 */
export function gapDay(): DayPlan {
  return {
    date: GAP_DATE,
    schedule: DEFAULT_SETTINGS.schedule,
    meetings: [],
    rerollCount: 0,
    targetMicroCount: 3,
    activities: [
      gapPause(0, '10:00'),
      gapPause(1, '12:30'),
      createActivity({
        id: `${GAP_DATE}:main`,
        kind: 'main',
        content: { kind: 'main', activityId: 'walk_outside' },
        slot: 'work',
        durationSec: 20 * 60,
        completionMode: 'continuous',
        at: gapAt('13:00'),
      }),
      gapPause(2, '16:00'),
    ],
  };
}
