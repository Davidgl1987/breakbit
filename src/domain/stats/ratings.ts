import { contentExerciseIds } from '../planner/pauseContent';
import type { Catalog, DateKey, DayRecord, ExerciseRating } from '../types';

export type ExerciseLikes = { exerciseId: string } & Record<ExerciseRating, number>;

/**
 * How the user rated the exercises of their pauses ("¿Qué te ha parecido?"): each rated
 * pause counts for every exercise in it (a routine, for all its moves).
 */
export function exerciseRatings(
  days: Partial<Record<DateKey, DayRecord>>,
  catalog: Catalog,
): ExerciseLikes[] {
  const totals = new Map<string, ExerciseLikes>();
  for (const record of Object.values(days)) {
    for (const item of record?.plan?.activities ?? []) {
      if (item.kind !== 'micro' || !item.rating) continue;
      for (const exerciseId of new Set(contentExerciseIds(item.content, catalog))) {
        const stat = totals.get(exerciseId) ?? { exerciseId, liked: 0, okay: 0, disliked: 0 };
        stat[item.rating]++;
        totals.set(exerciseId, stat);
      }
    }
  }
  return [...totals.values()];
}

/** Likes minus dislikes. */
export function likeScore(stat: ExerciseLikes): number {
  return stat.liked - stat.disliked;
}

/** The exercises liked more than disliked, best first (more ratings break ties). */
export function favouriteExercises(stats: readonly ExerciseLikes[], limit = 3): ExerciseLikes[] {
  return stats
    .filter((stat) => likeScore(stat) > 0)
    .sort((a, b) => likeScore(b) - likeScore(a) || b.liked - a.liked)
    .slice(0, limit);
}

/** The exercises disliked more than liked, least liked first. */
export function leastLikedExercises(stats: readonly ExerciseLikes[], limit = 3): ExerciseLikes[] {
  return stats
    .filter((stat) => likeScore(stat) < 0)
    .sort((a, b) => likeScore(a) - likeScore(b) || b.disliked - a.disliked)
    .slice(0, limit);
}
