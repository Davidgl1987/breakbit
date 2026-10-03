import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSchedule, makeSettings } from '@/test/builders';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime } from '../time';
import type { DayPlan, ScheduledActivity } from '../types';
import { advanceDay } from './advance';
import { markNotificationOpened, postpone, start } from './lifecycle';

const DATE = '2026-10-05';
const MIN = 60_000;
const settings = makeSettings();
const context = { catalog: CATALOG, discomfort: settings.discomfort, equipment: [] };
// No breaks or lunch: every pause is a work-time pause.
const plan = generateDayPlan({
  date: DATE,
  schedule: makeSchedule({ breaks: [], lunch: undefined }),
  settings,
  catalog: CATALOG,
});
const micros = (day: DayPlan) => day.activities.filter((item) => item.kind === 'micro');
const first = micros(plan)[0]!;
const T = first.scheduledAt;
const find = (day: DayPlan, id = first.id) => day.activities.find((item) => item.id === id)!;
const withFirst = (patch: (item: ScheduledActivity) => ScheduledActivity): DayPlan => ({
  ...plan,
  activities: plan.activities.map((item) => (item.id === first.id ? patch(item) : item)),
});

describe('advanceDay', () => {
  it('does nothing before the first pause', () => {
    const result = advanceDay(plan, atTime(DATE, '09:00'), context);
    expect(result.plan).toBe(plan);
    expect(result.events).toEqual([]);
  });

  it('notifies a pause when its time comes, once', () => {
    const { plan: day, events } = advanceDay(plan, T + MIN, context);
    expect(find(day)).toMatchObject({ status: 'notification_sent', notificationSentAt: T });
    expect(events).toEqual([{ type: 'notification_sent', activityId: first.id, at: T }]);
    expect(advanceDay(day, T + MIN, context)).toEqual({ plan: day, events: [] });
  });

  it('counts a reminder every 10 minutes without an answer', () => {
    const { plan: day, events } = advanceDay(plan, T + 21 * MIN, context);
    expect(find(day).remindersSent).toBe(2);
    expect(events.map((event) => [event.type, event.at])).toEqual([
      ['notification_sent', T],
      ['exercise_ignored', T + 10 * MIN],
      ['exercise_ignored', T + 20 * MIN],
    ]);
  });

  it('keeps reminding after the notification is opened without an answer', () => {
    const notified = advanceDay(plan, T + MIN, context).plan;
    const opened = {
      ...notified,
      activities: notified.activities.map((item) =>
        item.id === first.id ? markNotificationOpened(item, T + 2 * MIN) : item,
      ),
    };
    const { plan: day, events } = advanceDay(opened, T + 11 * MIN, context);
    expect(events).toEqual([{ type: 'exercise_ignored', activityId: first.id, at: T + 10 * MIN }]);
    expect(find(day)).toMatchObject({ remindersSent: 1, notificationOpenedAt: T + 2 * MIN });
  });

  it('notifies a postponed pause again at its new time', () => {
    const notified = advanceDay(plan, T + MIN, context).plan;
    const postponed = {
      ...notified,
      activities: notified.activities.map((item) =>
        item.id === first.id ? postpone(item, 10, T + 2 * MIN) : item,
      ),
    };
    expect(advanceDay(postponed, T + 5 * MIN, context).events).toEqual([]);
    const { plan: day, events } = advanceDay(postponed, T + 12 * MIN, context);
    expect(find(day)).toMatchObject({
      status: 'notification_sent',
      notificationSentAt: T + 12 * MIN,
    });
    expect(events).toEqual([{ type: 'notification_sent', activityId: first.id, at: T + 12 * MIN }]);
  });

  it('misses a pause 30 minutes after its original time, even if postponed', () => {
    const postponed = withFirst((item) =>
      postpone({ ...item, status: 'notification_sent' }, 15, T + 10 * MIN),
    );
    const { plan: day, events } = advanceDay(postponed, T + 30 * MIN, context);
    expect(find(day)).toMatchObject({ status: 'missed', missReason: 'window_expired' });
    expect(events.at(-1)).toEqual({
      type: 'exercise_missed',
      activityId: first.id,
      at: T + 30 * MIN,
    });
  });

  it('never misses a pause that was started ("Vamos" before it expired)', () => {
    const started = withFirst((item) =>
      start({ ...item, status: 'notification_sent' }, T + 5 * MIN),
    );
    expect(find(advanceDay(started, T + 2 * 60 * MIN, context).plan)).toBe(find(started));
  });

  it('after a miss, brings the next pause up to 10 min earlier as a fuller reset', () => {
    const second = micros(plan)[1]!;
    expect(second.pauseType).toBe('micro');
    const { plan: day } = advanceDay(plan, first.scheduledAt + 30 * MIN, context);
    const next = find(day, second.id);
    expect(next.currentScheduledAt).toBe(second.scheduledAt - 10 * MIN);
    expect(next.pauseType).toBe('reset');
    expect(next.content.kind).toBe('exercises');
    if (next.content.kind === 'exercises')
      expect(next.content.exerciseIds.length).toBeGreaterThan(1);
  });

  it('closes a past day whose pauses were never done', () => {
    const { plan: day } = advanceDay(plan, atTime('2026-10-06', '09:00'), context);
    expect(micros(day).every((item) => item.status === 'missed')).toBe(true);
  });
});
