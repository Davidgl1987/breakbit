import { PAUSE_WINDOW } from '../config';
import { isOpen, windowEnd } from '../pause/window';
import { atTime } from '../time';
import type { DateKey, DayRecord, DaySchedule, Instant, NotificationPrefs } from '../types';

const MINUTE = 60_000;

export type NotificationKind = 'pause' | 'pause_reminder' | 'day_start' | 'main' | 'main_done';

/**
 * A reminder the app should show at `at`. Ids are deterministic, so a delivery channel
 * (local now, Web Push later) can tell what it already showed. Notifications with the
 * same `tag` replace each other instead of piling up.
 */
export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  at: Instant;
  date: DateKey;
  tag: string;
  activityId?: string;
}

export interface ScheduleInput {
  date: DateKey;
  record?: DayRecord;
  /** Today's hours, or null if it is not a workday. */
  schedule: DaySchedule | null;
  /** "Hoy no trabajo". */
  dayOff: boolean;
  prefs: NotificationPrefs;
}

/**
 * Today's reminders, past and future, following the user's preferences:
 * - the start of the workday, while the day hasn't been started;
 * - each open microbreak when its (possibly postponed) time comes;
 * - a reminder every 10 min while it gets no answer ("Vamos", postpone or discard) and its
 *   window is open. Just opening the screen is not an answer;
 * - the main activity at its time, while it hasn't started, and once a session completes
 *   on its own (a walk with the phone away). Both follow the pauses preference.
 */
export function buildNotificationSchedule({
  date,
  record,
  schedule,
  dayOff,
  prefs,
}: ScheduleInput): PlannedNotification[] {
  if (!prefs.enabled || dayOff) return [];
  const planned: PlannedNotification[] = [];

  if (prefs.dayStart && schedule && !record) {
    planned.push({
      id: `day-start:${date}`,
      kind: 'day_start',
      at: atTime(date, schedule.workStart),
      date,
      tag: 'day-start',
    });
  }

  if (prefs.microbreaks && record?.status === 'active' && record.plan) {
    for (const item of record.plan.activities) {
      if (item.kind !== 'micro' || !isOpen(item) || item.startedAt !== undefined) continue;
      const end = windowEnd(item);
      const base = item.currentScheduledAt;
      if (base >= end) continue;
      const id = `pause:${item.id}:${item.postponeCount}`;
      const tag = `pause:${item.id}`;
      planned.push({ id, kind: 'pause', at: base, date, tag, activityId: item.id });

      for (let k = 1; base + k * PAUSE_WINDOW.reminderEveryMin * MINUTE < end; k++) {
        planned.push({
          id: `${id}:r${k}`,
          kind: 'pause_reminder',
          at: base + k * PAUSE_WINDOW.reminderEveryMin * MINUTE,
          date,
          tag,
          activityId: item.id,
        });
      }
    }

    const main = record.plan.activities.find((item) => item.kind === 'main');
    if (main && isOpen(main) && main.startedAt === undefined) {
      planned.push({
        // A new time is a new reminder.
        id: `main:${main.id}:${main.currentScheduledAt}`,
        kind: 'main',
        at: main.currentScheduledAt,
        date,
        tag: `main:${main.id}`,
        activityId: main.id,
      });
    }
    if (main?.status === 'completed' && main.startedAt !== undefined && main.completedAt) {
      planned.push({
        id: `main-done:${main.id}`,
        kind: 'main_done',
        at: main.completedAt,
        date,
        tag: `main:${main.id}`,
        activityId: main.id,
      });
    }
  }

  return planned.sort((a, b) => a.at - b.at);
}
