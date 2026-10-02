import { PAUSES_PER_HOUR, PLANNER, SPACING } from '../config';
import type { Intensity } from '../types';
import { intervalLength, type Interval } from './timeline';

/** ~0.5 / 0.75 / 1 pauses per effective hour; the sliders never change this number. */
export function targetPauseCount(effectiveMin: number, intensity: Intensity): number {
  if (effectiveMin < PLANNER.minEffectiveMin) return 0;
  return Math.max(1, Math.round((effectiveMin / 60) * PAUSES_PER_HOUR[intensity]));
}

/** How many evenly spaced pauses a free stretch can hold without crowding them. */
export function windowCapacity(lengthMin: number): number {
  if (lengthMin < PLANNER.minWindowMin) return 0;
  return Math.max(1, Math.floor(lengthMin / SPACING.idealMinGapMin));
}

/**
 * Splits `count` pauses across free stretches in proportion to their length
 * (largest remainder), respecting each stretch's capacity.
 */
export function allocatePauses(windows: readonly Interval[], count: number): number[] {
  const lengths = windows.map(intervalLength);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total <= 0 || count <= 0) return windows.map(() => 0);

  const caps = lengths.map(windowCapacity);
  const quotas = lengths.map((length) => (count * length) / total);
  const allocation = quotas.map((quota, index) => Math.min(Math.floor(quota), caps[index]!));
  let remaining = count - allocation.reduce((sum, value) => sum + value, 0);

  while (remaining > 0) {
    let best = -1;
    for (let index = 0; index < windows.length; index++) {
      if (allocation[index]! >= caps[index]!) continue;
      const remainder = quotas[index]! - allocation[index]!;
      if (best < 0 || remainder > quotas[best]! - allocation[best]!) best = index;
    }
    if (best < 0) break; // the day is full
    allocation[best]!++;
    remaining--;
  }
  return allocation;
}

/**
 * Lays out `count` pauses inside a free stretch. Breaks inside it are preferred spots:
 * each one becomes a fixed pause (if the pauses around it can still be spaced at least
 * the minimum gap apart) and the remaining pauses are spread evenly around them, half a
 * gap from the stretch edges. Returns sorted minutes on 5-minute marks.
 */
export function layoutPauses(
  window: Interval,
  count: number,
  breaks: readonly Interval[] = [],
): number[] {
  if (count <= 0) return [];
  let pins: number[] = [];
  for (const pause of breaks) {
    if (pins.length >= count) break;
    if (pause.start < window.start || pause.start >= window.end) continue;
    const trial = [...pins, pause.start].sort((a, b) => a - b);
    if (smallestGap(layoutAround(window, count, trial)) >= SPACING.minGapAfterReplanMin)
      pins = trial;
  }
  return layoutAround(window, count, pins);
}

/** Evenly spread pauses with some positions fixed (`pins`). */
function layoutAround(window: Interval, count: number, pins: readonly number[]): number[] {
  const bounds = [window.start, ...pins, window.end];
  const runs = bounds.slice(0, -1).map((start, index) => ({
    start,
    end: bounds[index + 1]!,
    leftEdge: index === 0,
    rightEdge: index === bounds.length - 2,
  }));
  const free = allocateByLength(
    runs.map((run) => run.end - run.start),
    count - pins.length,
  );
  const positions = runs.flatMap((run, index) => {
    const pauses = free[index]!;
    if (pauses === 0) return [];
    // Edges of the stretch get half a gap; pinned pauses get a full gap.
    const units = pauses - 1 + (run.leftEdge ? 0.5 : 1) + (run.rightEdge ? 0.5 : 1);
    const gap = (run.end - run.start) / units;
    const first = run.start + (run.leftEdge ? gap / 2 : gap);
    return Array.from({ length: pauses }, (_, i) => first + i * gap);
  });
  return [...pins, ...positions]
    .map((time) => roundTo(time, PLANNER.roundToMin))
    .map((time) => Math.min(Math.max(time, window.start), window.end - 1))
    .sort((a, b) => a - b);
}

/** Largest-remainder split of `count` in proportion to `lengths`. */
function allocateByLength(lengths: readonly number[], count: number): number[] {
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total <= 0 || count <= 0) return lengths.map(() => 0);
  const quotas = lengths.map((length) => (count * length) / total);
  const result = quotas.map(Math.floor);
  let remaining = count - result.reduce((sum, value) => sum + value, 0);
  const byRemainder = quotas
    .map((quota, index) => ({ index, remainder: quota - result[index]! }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of byRemainder) {
    if (remaining <= 0) break;
    result[index]!++;
    remaining--;
  }
  return result;
}

function smallestGap(times: readonly number[]): number {
  let smallest = Infinity;
  for (let index = 1; index < times.length; index++) {
    smallest = Math.min(smallest, times[index]! - times[index - 1]!);
  }
  return smallest;
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
