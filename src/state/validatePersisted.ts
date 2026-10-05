import { validateSchedule } from '@/domain/calendar/validation';
import { isValidDateKey, isValidHHmm } from '@/domain/time';
import { EVENT_TYPES } from '@/domain/types';
import { LOCALES } from '@/i18n/translate';

/**
 * Structural validation of data coming from outside (backup files). Every field the app
 * reads is checked for type, allowed values and coherence, so a damaged or hand-edited
 * file can never put the store in a state the app can't handle. Returns the paths of
 * the problems found (empty when valid).
 */
export function validatePersistedState(value: unknown): string[] {
  const issues: string[] = [];
  const v = new Validator(issues);
  if (!v.record(value, 'state')) return issues;

  if (v.record(value.prefs, 'prefs')) {
    v.oneOf(value.prefs.theme, ['light', 'dark', 'system'], 'prefs.theme');
    v.oneOf(value.prefs.locale, LOCALES, 'prefs.locale');
  }
  v.optional(value.onboardedAt, 'onboardedAt', (item, path) => v.instant(item, path));
  validateSettings(v, value.settings, 'settings');

  if (v.dateMap(value.dayOverrides, 'dayOverrides')) {
    for (const [date, override] of Object.entries(value.dayOverrides)) {
      const path = `dayOverrides.${date}`;
      if (!v.record(override, path)) continue;
      v.equals(override.date, date, `${path}.date`);
      v.boolean(override.working, `${path}.working`);
      v.oneOf(override.source, ['repeated', 'custom', 'day_off'], `${path}.source`);
      v.optional(override.schedule, `${path}.schedule`, (item, itemPath) =>
        validateSchedule_(v, item, itemPath),
      );
    }
  }

  if (v.dateMap(value.days, 'days')) {
    for (const [date, day] of Object.entries(value.days)) validateDay(v, day, date, `days.${date}`);
  }

  if (v.record(value.progress, 'progress')) {
    const { progress } = value;
    v.integer(progress.evolutionPhase, 'progress.evolutionPhase', 1, 5);
    for (const key of ['lastEvaluatedWeek', 'lastSeenWeek'] as const) {
      v.optional(progress[key], `progress.${key}`, (item, path) => v.string(item, path));
    }
    v.array(progress.weeklyResults, 'progress.weeklyResults', (item, path) => {
      if (!v.record(item, path)) return;
      v.string(item.week, `${path}.week`);
      v.date(item.start, `${path}.start`);
      v.integer(item.planned, `${path}.planned`, 0);
      v.integer(item.good, `${path}.good`, 0);
      v.oneOf(item.result, ['good', 'regular', 'bad', 'neutral'], `${path}.result`);
      v.integer(item.phaseBefore, `${path}.phaseBefore`, 1, 5);
      v.integer(item.phaseAfter, `${path}.phaseAfter`, 1, 5);
      v.optional(item.unlocked, `${path}.unlocked`, (value, valuePath) =>
        v.string(value, valuePath),
      );
    });
    v.array(progress.unlockedRoomItems, 'progress.unlockedRoomItems', (item, path) =>
      v.string(item, path),
    );
  }

  v.array(value.xpLedger, 'xpLedger', (entry, path) => {
    if (!v.record(entry, path)) return;
    v.string(entry.key, `${path}.key`);
    v.number(entry.amount, `${path}.amount`);
    v.instant(entry.at, `${path}.at`);
    v.date(entry.date, `${path}.date`);
    v.oneOf(
      entry.reason,
      [
        'microbreak',
        'main_activity',
        'first_prompt',
        'extra_break',
        'good_day',
        'perfect_day',
        'discard',
      ],
      `${path}.reason`,
    );
  });

  if (v.record(value.meta, 'meta')) {
    v.instant(value.meta.installedAt, 'meta.installedAt');
    v.optional(value.meta.lastReconciledAt, 'meta.lastReconciledAt', (item, path) =>
      v.instant(item, path),
    );
  }
  return issues;
}

export function validateEvents(value: unknown): string[] {
  const issues: string[] = [];
  const v = new Validator(issues);
  v.array(value, 'events', (event, path) => {
    if (!v.record(event, path)) return;
    v.string(event.id, `${path}.id`);
    v.oneOf(event.type, EVENT_TYPES, `${path}.type`);
    v.instant(event.at, `${path}.at`);
    v.date(event.date, `${path}.date`);
    v.optional(event.activityId, `${path}.activityId`, (item, itemPath) =>
      v.string(item, itemPath),
    );
    v.optional(event.data, `${path}.data`, (data, dataPath) => {
      if (!v.record(data, dataPath)) return;
      for (const [key, item] of Object.entries(data)) {
        if (!['string', 'number', 'boolean'].includes(typeof item)) v.fail(`${dataPath}.${key}`);
      }
    });
  });
  return issues;
}

// ---------- Sections ----------

function validateSettings(v: Validator, settings: unknown, path: string): void {
  if (!v.record(settings, path)) return;
  v.array(settings.workDays, `${path}.workDays`, (day, dayPath) => v.integer(day, dayPath, 1, 7));
  validateSchedule_(v, settings.schedule, `${path}.schedule`);
  v.oneOf(settings.intensity, ['soft', 'normal', 'active'], `${path}.intensity`);
  // Area and equipment ids come from the catalog; ids it doesn't have are ignored.
  if (v.record(settings.discomfort, `${path}.discomfort`)) {
    for (const [area, level] of Object.entries(settings.discomfort)) {
      v.integer(level, `${path}.discomfort.${area}`, 0, 5);
    }
  }
  v.array(settings.equipment, `${path}.equipment`, (item, itemPath) => v.string(item, itemPath));
  v.integer(settings.preferredMainActivityMin, `${path}.preferredMainActivityMin`, 1, 240);
  if (v.record(settings.notifications, `${path}.notifications`)) {
    for (const key of ['enabled', 'dayStart', 'microbreaks', 'dayEnd']) {
      v.boolean(settings.notifications[key], `${path}.notifications.${key}`);
    }
  }
}

function validateSchedule_(v: Validator, schedule: unknown, path: string): void {
  if (!v.record(schedule, path)) return;
  const before = v.count();
  const block = (item: unknown, itemPath: string) => {
    if (!v.record(item, itemPath)) return;
    v.time(item.start, `${itemPath}.start`);
    v.integer(item.durationMin, `${itemPath}.durationMin`, 1, 24 * 60);
  };
  v.time(schedule.workStart, `${path}.workStart`);
  v.time(schedule.workEnd, `${path}.workEnd`);
  v.array(schedule.breaks, `${path}.breaks`, block);
  v.optional(schedule.lunch, `${path}.lunch`, block);
  // Only check coherence once every field of this schedule has the right type.
  if (v.count() === before) {
    const problems = validateSchedule(schedule as never);
    if (problems.length > 0)
      v.fail(`${path} (${problems.map((problem) => problem.code).join(', ')})`);
  }
}

function validateDay(v: Validator, day: unknown, date: string, path: string): void {
  if (!v.record(day, path)) return;
  v.equals(day.date, date, `${path}.date`);
  v.oneOf(day.status, ['active', 'closed', 'day_off', 'absent'], `${path}.status`);
  v.optional(day.openedAt, `${path}.openedAt`, (item, itemPath) => v.instant(item, itemPath));
  v.optional(day.closedAt, `${path}.closedAt`, (item, itemPath) => v.instant(item, itemPath));
  v.boolean(day.returnBonus, `${path}.returnBonus`);
  v.boolean(day.recoveryUsed, `${path}.recoveryUsed`);
  v.optional(day.mood, `${path}.mood`, (item, itemPath) =>
    v.oneOf(item, ['great', 'good', 'loaded', 'bad'], itemPath),
  );
  v.optional(day.nextDayDecision, `${path}.nextDayDecision`, (item, itemPath) =>
    v.oneOf(item, ['repeat', 'change', 'day_off'], itemPath),
  );
  v.optional(day.summary, `${path}.summary`, (summary, summaryPath) => {
    if (!v.record(summary, summaryPath)) return;
    for (const key of [
      'planned',
      'completed',
      'firstPrompt',
      'postponed',
      'ignored',
      'skipped',
      'missed',
      'extras',
      'microSec',
      'movementSec',
      'interruptionSec',
    ]) {
      v.integer(summary[key], `${summaryPath}.${key}`, 0);
    }
    v.number(summary.xp, `${summaryPath}.xp`);
    for (const key of ['mainCompleted', 'isGood', 'isPerfect']) {
      v.boolean(summary[key], `${summaryPath}.${key}`);
    }
  });
  v.optional(day.plan, `${path}.plan`, (plan, planPath) => {
    if (!v.record(plan, planPath)) return;
    v.equals(plan.date, date, `${planPath}.date`);
    validateSchedule_(v, plan.schedule, `${planPath}.schedule`);
    v.array(plan.meetings, `${planPath}.meetings`, (meeting, meetingPath) => {
      if (!v.record(meeting, meetingPath)) return;
      v.string(meeting.id, `${meetingPath}.id`);
      v.time(meeting.start, `${meetingPath}.start`);
      v.time(meeting.end, `${meetingPath}.end`);
      v.boolean(meeting.canMove, `${meetingPath}.canMove`);
    });
    v.integer(plan.rerollCount, `${planPath}.rerollCount`, 0);
    v.integer(plan.targetMicroCount, `${planPath}.targetMicroCount`, 0);
    v.array(plan.activities, `${planPath}.activities`, (activity, activityPath) =>
      validateActivity(v, activity, activityPath),
    );
  });
}

function validateActivity(v: Validator, activity: unknown, path: string): void {
  if (!v.record(activity, path)) return;
  v.string(activity.id, `${path}.id`);
  v.oneOf(activity.kind, ['micro', 'main'], `${path}.kind`);
  v.oneOf(activity.origin, ['plan', 'gap', 'recovery'], `${path}.origin`);
  if (v.record(activity.content, `${path}.content`)) {
    const content = activity.content;
    if (content.kind === 'exercises') {
      v.array(content.exerciseIds, `${path}.content.exerciseIds`, (id, idPath) =>
        v.string(id, idPath),
      );
    } else if (content.kind === 'routine') {
      v.string(content.routineId, `${path}.content.routineId`);
    } else if (content.kind === 'main') {
      v.string(content.activityId, `${path}.content.activityId`);
    } else {
      v.fail(`${path}.content.kind`);
    }
  }
  v.optional(activity.pauseType, `${path}.pauseType`, (item, itemPath) =>
    v.oneOf(item, ['micro', 'reset', 'active'], itemPath),
  );
  v.oneOf(activity.slot, ['work', 'break', 'meeting'], `${path}.slot`);
  v.integer(activity.durationSec, `${path}.durationSec`, 1);
  v.instant(activity.scheduledAt, `${path}.scheduledAt`);
  v.instant(activity.currentScheduledAt, `${path}.currentScheduledAt`);
  v.oneOf(
    activity.status,
    ['pending', 'notification_sent', 'postponed', 'completed', 'skipped', 'missed'],
    `${path}.status`,
  );
  for (const key of ['remindersSent', 'postponeMinutes', 'postponeCount']) {
    v.integer(activity[key], `${path}.${key}`, 0);
  }
  for (const key of [
    'notificationSentAt',
    'notificationOpenedAt',
    'startedAt',
    'completedAt',
    'runningSince',
  ]) {
    v.optional(activity[key], `${path}.${key}`, (item, itemPath) => v.instant(item, itemPath));
  }
  for (const key of ['elapsedSec', 'accumulatedSec']) {
    v.optional(activity[key], `${path}.${key}`, (item, itemPath) => v.integer(item, itemPath, 0));
  }
  v.optional(activity.skipReason, `${path}.skipReason`, (item, itemPath) =>
    v.oneOf(
      item,
      ['focused', 'meeting', 'no_time', 'not_in_mood', 'dislike_exercise', 'other'],
      itemPath,
    ),
  );
  v.optional(activity.missReason, `${path}.missReason`, (item, itemPath) =>
    v.oneOf(item, ['window_expired', 'no_room', 'day_closed'], itemPath),
  );
  v.optional(activity.firstPrompt, `${path}.firstPrompt`, (item, itemPath) =>
    v.boolean(item, itemPath),
  );
  v.optional(activity.completionMode, `${path}.completionMode`, (item, itemPath) =>
    v.oneOf(item, ['continuous', 'accumulated'], itemPath),
  );
}

// ---------- Primitive checks ----------

type Rec = Record<string, unknown>;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

class Validator {
  constructor(private readonly issues: string[]) {}

  count(): number {
    return this.issues.length;
  }

  fail(path: string): false {
    this.issues.push(path);
    return false;
  }

  /** Plain object without keys that could tamper with prototypes. */
  record(value: unknown, path: string): value is Rec {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return this.fail(path);
    if (Object.getPrototypeOf(value) !== Object.prototype) return this.fail(path);
    if (Object.keys(value).some((key) => UNSAFE_KEYS.has(key))) return this.fail(path);
    return true;
  }

  /** Object keyed by valid dates. */
  dateMap(value: unknown, path: string): value is Rec {
    if (!this.record(value, path)) return false;
    const invalid = Object.keys(value).filter((key) => !isValidDateKey(key));
    invalid.forEach((key) => this.fail(`${path}.${key}`));
    return invalid.length === 0;
  }

  array(value: unknown, path: string, each: (item: unknown, path: string) => void): void {
    if (!Array.isArray(value)) {
      this.fail(path);
      return;
    }
    value.forEach((item, index) => each(item, `${path}[${index}]`));
  }

  optional(value: unknown, path: string, check: (value: unknown, path: string) => void): void {
    if (value !== undefined) check(value, path);
  }

  string(value: unknown, path: string): void {
    if (typeof value !== 'string' || value.length === 0 || value.length > 200) this.fail(path);
  }

  boolean(value: unknown, path: string): void {
    if (typeof value !== 'boolean') this.fail(path);
  }

  number(value: unknown, path: string): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) this.fail(path);
  }

  integer(value: unknown, path: string, min = -Infinity, max = Infinity): void {
    if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
      this.fail(path);
    }
  }

  /** Epoch milliseconds within a sane range (years 2000–2200). */
  instant(value: unknown, path: string): void {
    this.integer(value, path, 946_684_800_000, 7_258_118_400_000);
  }

  date(value: unknown, path: string): void {
    if (typeof value !== 'string' || !isValidDateKey(value)) this.fail(path);
  }

  time(value: unknown, path: string): void {
    if (typeof value !== 'string' || !isValidHHmm(value)) this.fail(path);
  }

  equals(value: unknown, expected: unknown, path: string): void {
    if (value !== expected) this.fail(path);
  }

  oneOf(value: unknown, allowed: readonly unknown[], path: string): void {
    if (!allowed.includes(value)) this.fail(path);
  }
}
