import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import {
  applyReview,
  filterExercises,
  nextPending,
  NO_FILTERS,
  reviewExport,
  summarizeReviews,
  type ExerciseReview,
  type ReviewMap,
} from './reviews';

const AT = '2026-10-06T09:00:00.000Z';
const review = (exerciseId: string, patch: Partial<ExerciseReview> = {}): ExerciseReview => ({
  exerciseId,
  tested: false,
  decision: 'pending',
  updatedAt: AT,
  ...patch,
});
const byId = (id: string) => CATALOG.exercises.find((exercise) => exercise.id === id)!;

describe('applyReview', () => {
  it('starts pending and untried, and stamps the change', () => {
    expect(applyReview(undefined, 'chin_tuck', { rating: 4 }, AT)).toEqual({
      exerciseId: 'chin_tuck',
      tested: false,
      decision: 'pending',
      rating: 4,
      updatedAt: AT,
    });
  });

  it('keeps what was there and drops blank notes', () => {
    const before = review('chin_tuck', { decision: 'keep', notes: 'Muy bueno' });
    const after = applyReview(before, 'chin_tuck', { notes: '  ' }, '2026-10-06T10:00:00.000Z');
    expect(after).toEqual({
      exerciseId: 'chin_tuck',
      tested: false,
      decision: 'keep',
      updatedAt: '2026-10-06T10:00:00.000Z',
    });
  });
});

describe('summarizeReviews', () => {
  it('counts decisions over the given ids only', () => {
    const reviews: ReviewMap = {
      a: review('a', { decision: 'keep', tested: true }),
      b: review('b', { decision: 'delete' }),
      c: review('c', { tested: true }),
      gone: review('gone', { decision: 'keep' }),
    };
    expect(summarizeReviews(['a', 'b', 'c', 'd'], reviews)).toEqual({
      total: 4,
      reviewed: 2,
      tested: 2,
      pending: 2,
      keep: 1,
      rework: 0,
      delete: 1,
    });
  });
});

describe('filterExercises', () => {
  const exercises = CATALOG.exercises;

  it('finds names without minding accents or case', () => {
    const [first] = exercises;
    const query = first!.name.es
      .toUpperCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
    const found = filterExercises(exercises, { ...NO_FILTERS, query }, {}, 'es');
    expect(found).toContain(first);
  });

  it('filters by decision, with no review meaning pending', () => {
    const [first, second] = exercises;
    const reviews: ReviewMap = { [first!.id]: review(first!.id, { decision: 'rework' }) };
    expect(filterExercises(exercises, { ...NO_FILTERS, status: 'rework' }, reviews, 'es')).toEqual([
      first,
    ]);
    const pending = filterExercises(exercises, { ...NO_FILTERS, status: 'pending' }, reviews, 'es');
    expect(pending).not.toContain(first);
    expect(pending).toContain(second);
  });

  it('filters by equipment, or by none at all', () => {
    const none = filterExercises(exercises, { ...NO_FILTERS, equipment: 'none' }, {}, 'es');
    expect(none.length).toBeGreaterThan(0);
    expect(none.every((exercise) => exercise.equipment.length === 0)).toBe(true);
    const mat = filterExercises(exercises, { ...NO_FILTERS, equipment: 'mat' }, {}, 'es');
    expect(mat.length).toBeGreaterThan(0);
    expect(mat.every((exercise) => exercise.equipment.includes('mat'))).toBe(true);
  });

  it('filters by main area only', () => {
    const neck = filterExercises(exercises, { ...NO_FILTERS, area: 'neck' }, {}, 'es');
    expect(neck.length).toBeGreaterThan(0);
    expect(neck.every((exercise) => exercise.areas[0] === 'neck')).toBe(true);
  });
});

describe('nextPending', () => {
  const order = ['a', 'b', 'c', 'd'];
  const pendingIn = (ids: string[]) => (id: string) => ids.includes(id);

  it('starts from the top without a current one', () => {
    expect(nextPending(order, undefined, pendingIn(['b', 'd']))).toBe('b');
  });

  it('goes on after the current one and wraps round', () => {
    expect(nextPending(order, 'b', pendingIn(['a', 'b', 'd']))).toBe('d');
    expect(nextPending(order, 'd', pendingIn(['a', 'b', 'd']))).toBe('a');
  });

  it('never returns the current one', () => {
    expect(nextPending(order, 'c', pendingIn(['c']))).toBeUndefined();
  });
});

describe('reviewExport', () => {
  it('summarises the catalog and lists reviewed exercises in catalog order', () => {
    const [first, second] = CATALOG.exercises;
    const reviews: ReviewMap = {
      [second!.id]: review(second!.id, { decision: 'delete', notes: 'Acabo sudando' }),
      [first!.id]: review(first!.id, {
        decision: 'keep',
        tested: true,
        rating: 4,
        exerciseQuality: 4,
        microbreakQuality: 5,
      }),
    };
    const file = reviewExport(CATALOG.exercises, reviews, AT);
    expect(file.reviewedAt).toBe(AT);
    expect(file.summary).toMatchObject({
      total: CATALOG.exercises.length,
      reviewed: 2,
      keep: 1,
      delete: 1,
    });
    expect(file.exercises.map((entry) => entry.exerciseId)).toEqual([first!.id, second!.id]);
    expect(file.exercises[0]).toMatchObject({
      name: byId(first!.id).name.es,
      tested: true,
      rating: 4,
      exerciseQuality: 4,
      microbreakQuality: 5,
      decision: 'keep',
    });
    expect(file.exercises[1]).toMatchObject({ decision: 'delete', notes: 'Acabo sudando' });
  });
});
