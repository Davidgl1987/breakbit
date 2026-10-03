import { addDays, compareDateKeys } from '../time';
import {
  BODY_AREAS,
  type ActivityContent,
  type BodyArea,
  type Catalog,
  type DateKey,
  type DayRecord,
} from '../types';

export interface AreaStat {
  area: BodyArea;
  /** Exercises done that work it. */
  exercises: number;
  /** Time moved on them. */
  seconds: number;
}

/**
 * What the user actually moved, by body area, between two dates: each exercise of a
 * completed pause counts for every area it works, with its share of the time the pause
 * really took. Objective activity, never a claim of improvement.
 */
export function areaStats(
  from: DateKey,
  to: DateKey,
  days: Partial<Record<DateKey, DayRecord>>,
  catalog: Catalog,
): AreaStat[] {
  const totals = new Map<BodyArea, AreaStat>(
    BODY_AREAS.map((area) => [area, { area, exercises: 0, seconds: 0 }]),
  );
  for (let date = from; compareDateKeys(date, to) <= 0; date = addDays(date, 1)) {
    for (const item of days[date]?.plan?.activities ?? []) {
      if (item.kind !== 'micro' || item.status !== 'completed') continue;
      const moves = movesOf(item.content, catalog);
      const planned = moves.reduce((sum, move) => sum + move.seconds, 0);
      if (planned === 0) continue;
      const scale = (item.elapsedSec ?? item.durationSec) / planned;
      for (const move of moves) {
        for (const area of move.areas) {
          const stat = totals.get(area)!;
          stat.exercises++;
          stat.seconds += move.seconds * scale;
        }
      }
    }
  }
  return [...totals.values()]
    .filter((stat) => stat.exercises > 0)
    .map((stat) => ({ ...stat, seconds: Math.round(stat.seconds) }))
    .sort((a, b) => b.exercises - a.exercises || b.seconds - a.seconds);
}

function movesOf(
  content: ActivityContent,
  catalog: Catalog,
): { areas: readonly BodyArea[]; seconds: number }[] {
  const exercise = (id: string) => catalog.exercises.find((item) => item.id === id);
  if (content.kind === 'exercises') {
    return content.exerciseIds.flatMap((id) => {
      const found = exercise(id);
      return found ? [{ areas: found.areas, seconds: found.durationSec }] : [];
    });
  }
  if (content.kind === 'routine') {
    const routineId = content.routineId;
    const routine = catalog.routines.find((item) => item.id === routineId);
    return (routine?.steps ?? []).flatMap((step) => {
      const found = exercise(step.exerciseId);
      return found ? [{ areas: found.areas, seconds: step.seconds }] : [];
    });
  }
  return [];
}
