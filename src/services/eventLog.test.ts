import { beforeEach, describe, expect, it } from 'vitest';
import { atTime } from '@/domain/time';
import { clearEvents, logEvent, readEvents, replaceEvents } from './eventLog';

describe('event log', () => {
  beforeEach(async () => {
    await clearEvents();
  });

  it('appends events with their day and reads them oldest first', async () => {
    await logEvent('exercise_completed', { at: atTime('2026-10-05', '11:00'), activityId: 'p1' });
    await logEvent('exercise_postponed', {
      at: atTime('2026-10-05', '10:00'),
      activityId: 'p0',
      data: { minutes: 10 },
    });
    const events = await readEvents();
    expect(events.map((event) => event.type)).toEqual(['exercise_postponed', 'exercise_completed']);
    expect(events[0]).toMatchObject({
      date: '2026-10-05',
      activityId: 'p0',
      data: { minutes: 10 },
    });
    expect(new Set(events.map((event) => event.id)).size).toBe(2);
  });

  it('keeps events logged at the same moment', async () => {
    const at = atTime('2026-10-05', '09:00');
    await Promise.all([
      logEvent('notification_sent', { at }),
      logEvent('notification_opened', { at }),
    ]);
    expect(await readEvents()).toHaveLength(2);
  });

  it('replaces and clears the whole log', async () => {
    const event = await logEvent('day_completed', { at: atTime('2026-10-05', '17:00') });
    await replaceEvents([{ ...event, id: 'x', type: 'mood_recorded' }]);
    expect((await readEvents()).map((item) => item.type)).toEqual(['mood_recorded']);
    await clearEvents();
    expect(await readEvents()).toEqual([]);
  });
});
