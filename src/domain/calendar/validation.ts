import { isValidHHmm, toMinutes } from '../time';
import type { DaySchedule, TimeBlock } from '../types';

export type ScheduleIssue =
  | { code: 'invalid_time'; field: 'workStart' | 'workEnd' | 'lunch' | 'break'; index?: number }
  | { code: 'end_before_start' }
  | { code: 'invalid_duration'; field: 'lunch' | 'break'; index?: number }
  | { code: 'outside_work_hours'; field: 'lunch' | 'break'; index?: number }
  | { code: 'overlap'; blocks: [BlockRef, BlockRef] };

export type BlockRef = { kind: 'lunch' } | { kind: 'break'; index: number };

interface Interval {
  ref: BlockRef;
  start: number;
  end: number;
}

/**
 * Checks a day's hours. Overnight shifts are not supported in the MVP.
 * Returns an empty list when the schedule can be saved.
 */
export function validateSchedule(schedule: DaySchedule): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];
  if (!isValidHHmm(schedule.workStart)) issues.push({ code: 'invalid_time', field: 'workStart' });
  if (!isValidHHmm(schedule.workEnd)) issues.push({ code: 'invalid_time', field: 'workEnd' });
  if (issues.length > 0) return issues;

  const workStart = toMinutes(schedule.workStart);
  const workEnd = toMinutes(schedule.workEnd);
  if (workEnd <= workStart) return [{ code: 'end_before_start' }];

  const intervals: Interval[] = [];
  const checkBlock = (block: TimeBlock, ref: BlockRef) => {
    const field = ref.kind;
    const index = ref.kind === 'break' ? ref.index : undefined;
    if (!isValidHHmm(block.start)) {
      issues.push({ code: 'invalid_time', field, index });
      return;
    }
    if (!Number.isInteger(block.durationMin) || block.durationMin <= 0) {
      issues.push({ code: 'invalid_duration', field, index });
      return;
    }
    const start = toMinutes(block.start);
    const end = start + block.durationMin;
    if (start < workStart || end > workEnd) {
      issues.push({ code: 'outside_work_hours', field, index });
    }
    intervals.push({ ref, start, end });
  };

  if (schedule.lunch) checkBlock(schedule.lunch, { kind: 'lunch' });
  schedule.breaks.forEach((block, index) => checkBlock(block, { kind: 'break', index }));

  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i]!;
      const b = intervals[j]!;
      if (a.start < b.end && b.start < a.end) {
        issues.push({ code: 'overlap', blocks: [a.ref, b.ref] });
      }
    }
  }
  return issues;
}
