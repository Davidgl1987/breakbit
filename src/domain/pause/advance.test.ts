import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSchedule, makeSettings } from '@/test/builders';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime } from '../time';
import type { DayPlan, ScheduledActivity } from '../types';
import { advanceDay } from './advance';
import { pauseMain, startMain } from '../main/session';
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

describe('advanceDay and the main activity', () => {
  // 09:00–17:00, a 20 min walk at 11:00 and pauses around it.
  const day = generateDayPlan({
    date: DATE,
    schedule: makeSchedule({ breaks: [], lunch: undefined }),
    settings,
    catalog: CATALOG,
    mainActivity: { activityId: 'walk_outside', start: '11:00', durationMin: 20 },
  });
  const main = day.activities.find((item) => item.kind === 'main')!;
  const withMain = (patch: (item: ScheduledActivity) => ScheduledActivity): DayPlan => ({
    ...day,
    activities: day.activities.map((item) => (item.id === main.id ? patch(item) : item)),
  });
  const mainOf = (plan: DayPlan) => plan.activities.find((item) => item.kind === 'main')!;

  it('never lets it expire: it waits all day', () => {
    const later = atTime(DATE, '16:30');
    const { plan: advanced } = advanceDay(day, later, context);
    expect(mainOf(advanced)).toMatchObject({ status: 'pending' });
    const paused = withMain((item) =>
      pauseMain(startMain(item, main.scheduledAt), main.scheduledAt + MIN),
    );
    expect(mainOf(advanceDay(paused, later, context).plan).status).toBe('pending');
  });

  it('completes a session once its time adds up', () => {
    // Started 30 min early: the time adds up at 10:50.
    const startedAt = atTime(DATE, '10:30');
    const running = withMain((item) => startMain(item, startedAt));
    const mainEvents = (events: { type: string }[]) =>
      events.filter((event) => event.type === 'main_activity_completed');
    expect(mainEvents(advanceDay(running, atTime(DATE, '10:49'), context).events)).toEqual([]);

    const { plan: advanced, events } = advanceDay(running, atTime(DATE, '10:55'), context);
    expect(mainOf(advanced)).toMatchObject({
      status: 'completed',
      completedAt: atTime(DATE, '10:50'),
      elapsedSec: 20 * 60,
    });
    expect(mainEvents(events)).toEqual([
      { type: 'main_activity_completed', activityId: main.id, at: atTime(DATE, '10:50') },
    ]);
  });

  it('keeps the next pauses away from it', () => {
    const startedAt = atTime(DATE, '10:30');
    const running = withMain((item) => startMain(item, startedAt));
    const { plan: advanced } = advanceDay(running, atTime(DATE, '10:55'), context);
    const end = atTime(DATE, '10:50');
    for (const pause of micros(advanced)) {
      if (pause.currentScheduledAt <= atTime(DATE, '10:55')) continue;
      expect(pause.currentScheduledAt - end).toBeGreaterThanOrEqual(35 * MIN);
    }
  });
});
