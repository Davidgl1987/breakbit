import { createStore, set, values } from 'idb-keyval';
import type { ExerciseReview, ReviewMap } from './reviews';

/**
 * Exercise Lab's reviews, in their own IndexedDB store (one key per exercise, like the
 * event log). Apart from the app's data: resetting the app or loading a dev scenario
 * keeps them, and backups don't carry them.
 */
const reviewStore = createStore('breakbit-lab', 'reviews');

export async function readReviews(): Promise<ReviewMap> {
  const stored = await values<ExerciseReview>(reviewStore);
  return Object.fromEntries(
    stored
      .filter((review) => typeof review?.exerciseId === 'string')
      .map((review) => [review.exerciseId, review]),
  );
}

export function saveReview(review: ExerciseReview): Promise<void> {
  return set(review.exerciseId, review, reviewStore);
}
