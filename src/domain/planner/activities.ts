import type { Instant, ScheduledActivity } from '../types';

type NewActivity = Pick<
  ScheduledActivity,
  'id' | 'kind' | 'content' | 'slot' | 'durationSec' | 'pauseType' | 'completionMode'
> &
  Partial<Pick<ScheduledActivity, 'origin'>> & { at: Instant };

/** A fresh, untouched activity: pending, never notified or postponed. */
export function createActivity({ at, origin = 'plan', ...fields }: NewActivity): ScheduledActivity {
  return {
    origin,
    status: 'pending',
    scheduledAt: at,
    currentScheduledAt: at,
    remindersSent: 0,
    postponeMinutes: 0,
    postponeCount: 0,
    ...fields,
  };
}

export function byScheduledAt(a: ScheduledActivity, b: ScheduledActivity): number {
  return a.scheduledAt - b.scheduledAt || a.id.localeCompare(b.id);
}
