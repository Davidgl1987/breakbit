import type { BodyArea, EquipmentId, Exercise, LocaleCode } from '@/domain/types';

/**
 * Exercise Lab's reviews: what the team thinks of each catalog exercise after trying it.
 * Pure data and rules; nothing here changes the catalog.
 */

/** What to do with the exercise. Only collected: the catalog is edited by hand later. */
export type ReviewDecision = 'pending' | 'keep' | 'rework' | 'delete';
/** Overall impression: 1 👎 bad · 2 😐 meh · 3 👍 fine · 4 😍 great. */
export type ReviewRating = 1 | 2 | 3 | 4;
/** 1 (poor) to 5 (great). */
export type ReviewScore = 1 | 2 | 3 | 4 | 5;

export interface ExerciseReview {
  exerciseId: string;
  /** Done at least once from the lab (or marked by hand). */
  tested: boolean;
  rating?: ReviewRating;
  /** Is it a good exercise, physically? */
  exerciseQuality?: ReviewScore;
  /** Does it work as a microbreak during an office workday? */
  microbreakQuality?: ReviewScore;
  decision: ReviewDecision;
  notes?: string;
  /** ISO time of the last change. */
  updatedAt: string;
}

export type ReviewMap = Partial<Record<string, ExerciseReview>>;
export type ReviewPatch = Partial<Omit<ExerciseReview, 'exerciseId' | 'updatedAt'>>;

export const DECISIONS: readonly ReviewDecision[] = ['pending', 'keep', 'rework', 'delete'];

/** An exercise counts as reviewed once it has a decision. */
export function isReviewed(review: ExerciseReview | undefined): boolean {
  return review !== undefined && review.decision !== 'pending';
}

/** The review after a change. Blank notes are dropped. */
export function applyReview(
  previous: ExerciseReview | undefined,
  exerciseId: string,
  patch: ReviewPatch,
  updatedAt: string,
): ExerciseReview {
  const next: ExerciseReview = {
    exerciseId,
    tested: false,
    decision: 'pending',
    ...previous,
    ...patch,
    updatedAt,
  };
  if (!next.notes?.trim()) delete next.notes;
  return next;
}

export interface ReviewSummary {
  total: number;
  reviewed: number;
  tested: number;
  pending: number;
  keep: number;
  rework: number;
  delete: number;
}

/** How the review of `exerciseIds` is going (reviews of other ids are ignored). */
export function summarizeReviews(
  exerciseIds: readonly string[],
  reviews: ReviewMap,
): ReviewSummary {
  const summary: ReviewSummary = {
    total: exerciseIds.length,
    reviewed: 0,
    tested: 0,
    pending: 0,
    keep: 0,
    rework: 0,
    delete: 0,
  };
  for (const id of exerciseIds) {
    const review = reviews[id];
    summary[review?.decision ?? 'pending'] += 1;
    if (isReviewed(review)) summary.reviewed += 1;
    if (review?.tested) summary.tested += 1;
  }
  return summary;
}

export interface LabFilters {
  query: string;
  status: 'all' | ReviewDecision;
  /** 'none': exercises without equipment. */
  equipment: 'all' | 'none' | EquipmentId;
  /** Matched against the main area (the first one). */
  area: 'all' | BodyArea;
}

export const NO_FILTERS: LabFilters = { query: '', status: 'all', equipment: 'all', area: 'all' };

/** Lowercase and without accents, so "rotacion" finds "Rotación". */
function searchable(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** The exercises that match every filter, in catalog order. */
export function filterExercises(
  exercises: readonly Exercise[],
  filters: LabFilters,
  reviews: ReviewMap,
  locale: LocaleCode,
): Exercise[] {
  const query = searchable(filters.query.trim());
  return exercises.filter((exercise) => {
    if (query && !searchable(`${exercise.name[locale]} ${exercise.id}`).includes(query)) {
      return false;
    }
    if (
      filters.status !== 'all' &&
      (reviews[exercise.id]?.decision ?? 'pending') !== filters.status
    ) {
      return false;
    }
    if (filters.equipment === 'none' && exercise.equipment.length > 0) return false;
    if (
      filters.equipment !== 'all' &&
      filters.equipment !== 'none' &&
      !exercise.equipment.includes(filters.equipment)
    ) {
      return false;
    }
    return filters.area === 'all' || exercise.areas[0] === filters.area;
  });
}

/**
 * The first candidate after `currentId` in `order`, going round to the start; never the
 * current one. Without a current one (or if it isn't in `order`) it starts from the top.
 */
export function nextPending(
  order: readonly string[],
  currentId: string | undefined,
  isCandidate: (id: string) => boolean,
): string | undefined {
  const start = currentId === undefined ? -1 : order.indexOf(currentId);
  for (let step = 1; step <= order.length; step += 1) {
    const id = order[(start + step) % order.length];
    if (id !== undefined && id !== currentId && isCandidate(id)) return id;
  }
  return undefined;
}

/** How to read the numbers, for whoever edits the catalog from the export. */
const SCALES = {
  rating: '1 = 👎 Malo · 2 = 😐 Sin más · 3 = 👍 Está bien · 4 = 😍 Muy bueno',
  exerciseQuality: '1–5: ¿es un buen ejercicio físicamente?',
  microbreakQuality: '1–5: ¿encaja como micropausa en una jornada de oficina?',
  decision: 'pending (pendiente) · keep (mantener) · rework (revisar) · delete (eliminar)',
};

/**
 * The file to hand over with the catalog to improve it: the summary and every exercise
 * that has a review, in catalog order, with its Spanish name for easier reading.
 */
export function reviewExport(
  exercises: readonly Exercise[],
  reviews: ReviewMap,
  reviewedAt: string,
) {
  return {
    reviewedAt,
    scales: SCALES,
    summary: summarizeReviews(
      exercises.map((exercise) => exercise.id),
      reviews,
    ),
    exercises: exercises.flatMap((exercise) => {
      const review = reviews[exercise.id];
      if (!review) return [];
      return [
        {
          exerciseId: exercise.id,
          name: exercise.name.es,
          decision: review.decision,
          tested: review.tested,
          rating: review.rating,
          exerciseQuality: review.exerciseQuality,
          microbreakQuality: review.microbreakQuality,
          notes: review.notes,
          updatedAt: review.updatedAt,
        },
      ];
    }),
  };
}
