import type { AreaStat } from '../stats/areas';
import type { BodyArea, DiscomfortLevel, DiscomfortLevels } from '../types';

export interface PriorityChange {
  area: BodyArea;
  from: DiscomfortLevel;
  to: DiscomfortLevel;
  exercises: number;
}

/**
 * Redistributes one point between active priorities using completed exercise counts.
 * Counts describe movement, never symptoms or recovery. Zero stays zero, active zones
 * stay within 1–5, and the total priority stays the same. Sparse/tied activity gives no
 * suggestion: at least three exercises in one active zone and a gap of two are needed.
 */
export function proposePriorityRebalance(
  priorities: DiscomfortLevels,
  stats: readonly AreaStat[],
  areas: readonly BodyArea[],
): readonly [PriorityChange, PriorityChange] | undefined {
  const counts = new Map(stats.map((stat) => [stat.area, stat.exercises]));
  const active = areas
    .filter((area) => (priorities[area] ?? 0) > 0)
    .map((area, index) => ({
      area,
      index,
      value: priorities[area]!,
      exercises: counts.get(area) ?? 0,
    }))
    .sort((a, b) => a.exercises - b.exercises || a.index - b.index);
  if (active.length < 2 || !active.some((zone) => zone.exercises >= 3)) return;

  const less = active.find((zone) => zone.value < 5);
  const more = [...active].reverse().find((zone) => zone.value > 1);
  if (!less || !more || less.area === more.area || more.exercises - less.exercises < 2) return;
  return [
    {
      area: less.area,
      from: less.value,
      to: (less.value + 1) as DiscomfortLevel,
      exercises: less.exercises,
    },
    {
      area: more.area,
      from: more.value,
      to: (more.value - 1) as DiscomfortLevel,
      exercises: more.exercises,
    },
  ];
}
