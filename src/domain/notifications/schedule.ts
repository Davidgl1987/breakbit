import { DAY_END_LATE_MIN, DAY_END_LEAD_MIN, PAUSE_WINDOW } from '../config';
import { isOpen, windowEnd } from '../pause/window';
import { atTime } from '../time';
import type {
  DateKey,
  DayPlan,
  DayRecord,
  DaySchedule,
  Instant,
  NotificationPrefs,
  TimeBlock,
} from '../types';

const MINUTE = 60_000;

export type NotificationKind =
  'pause' | 'pause_reminder' | 'day_start' | 'day_end' | 'main' | 'main_done' | 'break';

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
  /**
   * Still worth showing until then if it comes late (after a sleep or a frozen tab).
   * Without it, a channel drops notifications that are a few minutes old.
   */
  until?: Instant;
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
 * - the start of the workday, while the day hasn't been started (late, until it ends);
 * - each open microbreak when its (possibly postponed) time comes;
 * - a reminder every 10 min while it gets no answer ("Vamos", postpone or discard) and its
 *   window is open. Just opening the screen is not an answer;
 * - the main activity at its time, while it hasn't started (late, until its planned end),
 *   and once a session completes on its own (a walk with the phone away);
 * - each of the day's breaks as it starts (late, until it ends), unless the main activity
 *   is in it (its own notice says so) or a meeting takes part of it. The main activity and
 *   the breaks follow the pauses preference;
 * - the end of the workday, 10 min before it, while the day is under way (late, up to two
 *   hours after it ends).
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
      until: atTime(date, schedule.workEnd),
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
        until: main.currentScheduledAt + main.durationSec * 1000,
      });
    }

    for (const block of record.plan.schedule.breaks) {
      if (!breakIsFree(record.plan, block)) continue;
      const start = atTime(date, block.start);
      planned.push({
        id: `break:${date}:${block.start}`,
        kind: 'break',
        at: start,
        date,
        tag: 'break',
        until: start + block.durationMin * MINUTE,
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

  if (prefs.dayEnd && record?.status === 'active' && record.plan) {
    const end = atTime(date, record.plan.schedule.workEnd);
    planned.push({
      id: `day-end:${date}`,
      kind: 'day_end',
      at: end - DAY_END_LEAD_MIN * MINUTE,
      date,
      tag: 'day-end',
      until: end + DAY_END_LATE_MIN * MINUTE,
    });
  }

  return planned.sort((a, b) => a.at - b.at);
}

/**
 * A break worth announcing: the main activity still to do isn't in it (its own notice
 * comes then) and no meeting takes any of it.
 */
function breakIsFree(plan: DayPlan, block: TimeBlock): boolean {
  const start = atTime(plan.date, block.start);
  const end = start + block.durationMin * MINUTE;
  const overlaps = (from: Instant, to: Instant) => from < end && to > start;
  const main = plan.activities.find((item) => item.kind === 'main');
  if (
    main &&
    isOpen(main) &&
    overlaps(main.currentScheduledAt, main.currentScheduledAt + main.durationSec * 1000)
  ) {
    return false;
  }
  return !plan.meetings.some((meeting) =>
    overlaps(atTime(plan.date, meeting.start), atTime(plan.date, meeting.end)),
  );
}
