import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { makeSettings } from '@/test/builders';
import { completeMain, pauseMain, startMain } from '../main/session';
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
    expect(
      schedule({ prefs: { ...settings.notifications, microbreaks: false } }).map(
        (item) => item.kind,
      ),
    ).toEqual(['day_end']);
    expect(
      schedule({ record: undefined, prefs: { ...settings.notifications, dayStart: false } }),
    ).toEqual([]);
  });
});

describe('main activity reminders', () => {
  const main = plan.activities.find((item) => item.kind === 'main')!;
  const withMain = (patch: (item: ScheduledActivity) => ScheduledActivity) =>
    record({
      ...plan,
      activities: plan.activities.map((item) => (item.id === main.id ? patch(item) : item)),
    });
  const forMain = (input: Partial<ScheduleInput> = {}) =>
    schedule(input)
      .filter((item) => item.activityId === main.id)
      .map((item) => [item.id, item.kind, item.at, item.tag]);

  it('reminds of it at its time while it has not started', () => {
    expect(forMain()).toEqual([
      [
        `main:${main.id}:${main.currentScheduledAt}`,
        'main',
        main.currentScheduledAt,
        `main:${main.id}`,
      ],
    ]);
    // Moved: a new reminder.
    const moved = main.currentScheduledAt + 60 * MIN;
    expect(
      forMain({ record: withMain((item) => ({ ...item, currentScheduledAt: moved })) }),
    ).toEqual([[`main:${main.id}:${moved}`, 'main', moved, `main:${main.id}`]]);
  });

  it('says so when a session completes on its own', () => {
    const at = main.currentScheduledAt;
    expect(forMain({ record: withMain((item) => startMain(item, at)) })).toEqual([]);
    expect(
      forMain({ record: withMain((item) => pauseMain(startMain(item, at), at + MIN)) }),
    ).toEqual([]);
    const done = withMain((item) =>
      completeMain(startMain(item, at), at + main.durationSec * 1000 + 5 * MIN),
    );
    expect(forMain({ record: done })).toEqual([
      [`main-done:${main.id}`, 'main_done', at + main.durationSec * 1000, `main:${main.id}`],
    ]);
  });

  it('stays quiet when it was done without the timer', () => {
    const at = main.currentScheduledAt;
    expect(forMain({ record: withMain((item) => completeMain(item, at)) })).toEqual([]);
  });

  it('follows the pauses preference', () => {
    expect(forMain({ prefs: { ...settings.notifications, microbreaks: false } })).toEqual([]);
  });
});

describe('end of the workday', () => {
  it('reminds 10 minutes before it ends, while the day is under way', () => {
    const end = schedule().filter((item) => item.kind === 'day_end');
    expect(end).toEqual([
      {
        id: `day-end:${DATE}`,
        kind: 'day_end',
        at: atTime(DATE, settings.schedule.workEnd) - 10 * MIN,
        date: DATE,
        tag: 'day-end',
      },
    ]);
  });

  it('stays quiet when turned off, or once the day is closed', () => {
    const kinds = (input: Partial<ScheduleInput>) => schedule(input).map((item) => item.kind);
    expect(kinds({ prefs: { ...settings.notifications, dayEnd: false } })).not.toContain('day_end');
    expect(kinds({ record: { ...record(), status: 'closed' } })).not.toContain('day_end');
  });
});
