import { useCallback, useEffect, useRef, useState } from 'react';
import { readReviews, saveReview } from './reviewStorage';
import { applyReview, type ReviewMap, type ReviewPatch } from './reviews';

export interface ExerciseReviews {
  /** Null until the saved reviews are read. */
  reviews: ReviewMap | null;
  update: (exerciseId: string, patch: ReviewPatch) => void;
  /** The last save failed (storage unavailable): changes only live in this tab. */
  saveFailed: boolean;
}

/** The saved reviews, and every change saved as it happens. */
export function useExerciseReviews(): ExerciseReviews {
  const [reviews, setReviews] = useState<ReviewMap | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  // The latest map, so changes in a row build on each other.
  const latest = useRef<ReviewMap>({});

  useEffect(() => {
    let active = true;
    readReviews()
      .catch(() => ({}))
      .then((saved) => {
        if (!active) return;
        latest.current = saved;
        setReviews(saved);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((exerciseId: string, patch: ReviewPatch) => {
    // Wall-clock time, not the dev clock (which may be simulated).
    const review = applyReview(
      latest.current[exerciseId],
      exerciseId,
      patch,
      new Date().toISOString(),
    );
    latest.current = { ...latest.current, [exerciseId]: review };
    setReviews(latest.current);
    saveReview(review).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
  }, []);

  return { reviews, update, saveFailed };
}
