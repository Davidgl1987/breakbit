import { fromMinutes, isValidHHmm, toMinutes } from '@/domain/time';
import type { HHmm, TimeBlock } from '@/domain/types';

/** A block as the form shows it: two times, either of which may be empty while editing. */
export interface TimeRange {
  start: string;
  end: string;
}

/** start–end for a stored block (start + duration). Unknown parts come back empty. */
export function rangeFromBlock(block: TimeBlock): TimeRange {
  if (!isValidHHmm(block.start)) return { start: '', end: '' };
  const end = toMinutes(block.start) + block.durationMin;
  const validEnd = Number.isInteger(end) && end >= 0 && end < 24 * 60;
  return { start: block.start, end: validEnd ? fromMinutes(end) : '' };
}

/**
 * The block to store for what the form shows. An end at or before the start gives a
 * duration ≤ 0 and a missing time gives NaN: schedule validation reports both.
 */
export function blockFromRange(range: TimeRange): TimeBlock {
  const durationMin =
    isValidHHmm(range.start) && isValidHHmm(range.end)
      ? toMinutes(range.end) - toMinutes(range.start)
      : Number.NaN;
  return { start: range.start as HHmm, durationMin };
}
