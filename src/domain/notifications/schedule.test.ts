import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { markNotificationOpened, postpone, start } from '../pause/lifecycle';
import { generateDayPlan } from '../planner/generateDayPlan';
import { atTime } from '../time';
import type { DayPlan, DayRecord, ScheduledActivity } from '../types';
import { buildNotificationSchedule, type ScheduleInput } from './schedule';

const DATE = '2026-10-05';
const MIN = 60_000;
const settings = makeSettings();
const plan = generateDayPlan({
  date: DATE,
  schedule: settings.schedule,
  settings,
  catalog: CATALOG,
});
const micros = plan.activities.filter((item) => item.kind === 'micro');
const first = micros[0]!;
const record = (day: DayPlan = plan): DayRecord => ({
  date: DATE,
  status: 'active',
  plan: day,
  returnBonus: false,
  recoveryUsed: false,
});
const withFirst = (patch: (item: ScheduledActivity) => ScheduledActivity) =>
  record({
    ...plan,
    activities: plan.activities.map((item) => (item.id === first.id ? patch(item) : item)),
  });
const schedule = (input: Partial<ScheduleInput> = {}) =>
  buildNotificationSchedule({
    date: DATE,
    record: record(),
    schedule: settings.schedule,
    dayOff: false,
    prefs: settings.notifications,
    ...input,
  });

describe('buildNotificationSchedule', () => {
  it('reminds of each pause, then every 10 minutes while its window is open', () => {
    const forFirst = schedule().filter((item) => item.activityId === first.id);
    expect(forFirst.map((item) => [item.id, item.kind, item.at])).toEqual([
      [`pause:${first.id}:0`, 'pause', first.scheduledAt],
      [`pause:${first.id}:0:r1`, 'pause_reminder', first.scheduledAt + 10 * MIN],
      [`pause:${first.id}:0:r2`, 'pause_reminder', first.scheduledAt + 20 * MIN],
    ]);
    expect(new Set(forFirst.map((item) => item.tag))).toEqual(new Set([`pause:${first.id}`]));
    expect(schedule().filter((item) => item.kind === 'pause')).toHaveLength(micros.length);
  });

  it('starts a new round after a postpone', () => {
    const notified = {
      ...first,
      status: 'notification_sent' as const,
      notificationSentAt: first.scheduledAt,
    };
    const postponed = schedule({
      record: withFirst(() => postpone(notified, 10, first.scheduledAt + 2 * MIN)),
    }).filter((item) => item.activityId === first.id);
    expect(postponed.map((item) => item.id)).toEqual([
      `pause:${first.id}:1`,
      `pause:${first.id}:1:r1`,
    ]);
  });

  it('keeps the reminders when the notification is opened but not answered', () => {
    const notified = {
      ...first,
      status: 'notification_sent' as const,
      notificationSentAt: first.scheduledAt,
    };
    const opened = schedule({
      record: withFirst(() => markNotificationOpened(notified, first.scheduledAt + MIN)),
    }).filter((item) => item.activityId === first.id);
    expect(opened.map((item) => item.kind)).toEqual(['pause', 'pause_reminder', 'pause_reminder']);
  });

  it('forgets pauses that started, ended or were discarded', () => {
    const notified = { ...first, status: 'notification_sent' as const };
    const started = schedule({ record: withFirst(() => start(notified, first.scheduledAt)) });
    expect(started.some((item) => item.activityId === first.id)).toBe(false);
    const missed = schedule({ record: withFirst((item) => ({ ...item, status: 'missed' })) });
    expect(missed.some((item) => item.activityId === first.id)).toBe(false);
  });

  it('announces the start of a workday that has not been planned', () => {
    expect(schedule({ record: undefined })).toEqual([
      {
        id: `day-start:${DATE}`,
        kind: 'day_start',
        at: atTime(DATE, '09:00'),
        date: DATE,
        tag: 'day-start',
      },
    ]);
    expect(schedule({ record: undefined, schedule: null })).toEqual([]);
  });

  it('follows the preferences and days off', () => {
    expect(schedule({ dayOff: true })).toEqual([]);
    expect(schedule({ prefs: { ...settings.notifications, enabled: false } })).toEqual([]);
    expect(schedule({ prefs: { ...settings.notifications, microbreaks: false } })).toEqual([]);
    expect(
      schedule({ record: undefined, prefs: { ...settings.notifications, dayStart: false } }),
    ).toEqual([]);
  });
});
