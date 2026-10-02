import { validateSchedule } from '@/domain/calendar/validation';
import type { DaySchedule } from '@/domain/types';
import type { MessageKey } from '@/i18n/translate';

/** Messages follow the order of the fields on screen: workday, break, lunch. */
const ORDER: MessageKey[] = [
  'schedule.issues.endBeforeStart',
  'schedule.issues.invalid',
  'schedule.issues.breakEndBeforeStart',
  'schedule.issues.breakOutside',
  'schedule.issues.lunchEndBeforeStart',
  'schedule.issues.lunchOutside',
  'schedule.issues.overlap',
];

/** One message per kind of problem with the schedule. */
export function scheduleIssueMessages(schedule: DaySchedule): MessageKey[] {
  const keys = validateSchedule(schedule).map((issue): MessageKey => {
    switch (issue.code) {
      case 'end_before_start':
        return 'schedule.issues.endBeforeStart';
      case 'outside_work_hours':
        return issue.field === 'lunch'
          ? 'schedule.issues.lunchOutside'
          : 'schedule.issues.breakOutside';
      case 'overlap':
        return 'schedule.issues.overlap';
      case 'invalid_duration': {
        // The form edits start–end: a duration ≤ 0 means the end is not after the start.
        const block = issue.field === 'lunch' ? schedule.lunch : schedule.breaks[issue.index ?? 0];
        if (!Number.isFinite(block?.durationMin)) return 'schedule.issues.invalid';
        return issue.field === 'lunch'
          ? 'schedule.issues.lunchEndBeforeStart'
          : 'schedule.issues.breakEndBeforeStart';
      }
      case 'invalid_time':
        return 'schedule.issues.invalid';
    }
  });
  return ORDER.filter((key) => keys.includes(key));
}
