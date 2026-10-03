import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { createActivity } from '@/domain/planner/activities';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan, HHmm, ScheduledActivity } from '@/domain/types';

export const SAMPLE_DATE: DateKey = '2026-10-05';

export const sampleAt = (time: HHmm) => atTime(SAMPLE_DATE, time);

export function samplePause(n: number, time: HHmm): ScheduledActivity {
  return createActivity({
    id: `${SAMPLE_DATE}:p${n}`,
    kind: 'micro',
    content: { kind: 'exercises', exerciseIds: ['neck_rotation'] },
    slot: 'work',
    durationSec: 40,
    pauseType: 'micro',
    at: sampleAt(time),
  });
}

/**
 * A known day for tests: default hours (09:00–17:00, break at 11:00, lunch at
 * 14:00), pauses at 10:00, 12:30 and 16:00, and a 20 min walk at 13:00.
 */
export function sampleDay(): DayPlan {
  return {
    date: SAMPLE_DATE,
    schedule: DEFAULT_SETTINGS.schedule,
    meetings: [],
    rerollCount: 0,
    targetMicroCount: 3,
    activities: [
      samplePause(0, '10:00'),
      samplePause(1, '12:30'),
      createActivity({
        id: `${SAMPLE_DATE}:main`,
        kind: 'main',
        content: { kind: 'main', activityId: 'walk_outside' },
        slot: 'work',
        durationSec: 20 * 60,
        completionMode: 'continuous',
        at: sampleAt('13:00'),
      }),
      samplePause(2, '16:00'),
    ],
  };
}
