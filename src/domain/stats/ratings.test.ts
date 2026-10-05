import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { createActivity } from '../planner/activities';
import { atTime } from '../time';
import type { ActivityContent, DayRecord, ExerciseRating } from '../types';
import { exerciseRatings, favouriteExercises, leastLikedExercises } from './ratings';

const DATE = '2026-10-05';
let n = 0;
const rated = (content: ActivityContent, rating?: ExerciseRating) => ({
  ...createActivity({
    id: `${DATE}:p${n++}`,
    kind: 'micro',
    content,
    slot: 'work',
    durationSec: 40,
    at: atTime(DATE, '10:00'),
  }),
  status: 'completed' as const,
  ...(rating && { rating }),
});
const day = (activities: ReturnType<typeof rated>[]): Partial<Record<string, DayRecord>> => ({
  [DATE]: {
    date: DATE,
    status: 'closed',
    returnBonus: false,
    recoveryUsed: false,
    plan: {
      date: DATE,
      schedule: { workStart: '09:00', workEnd: '17:00', breaks: [] },
      meetings: [],
      rerollCount: 0,
      targetMicroCount: activities.length,
      activities,
    },
  },
});
const one = (id: string) => ({ kind: 'exercises' as const, exerciseIds: [id] });

describe('exercise ratings', () => {
  it('counts each rated pause for every exercise in it, routines included', () => {
    const routine = CATALOG.routines[0]!;
    const stats = exerciseRatings(
      day([
        rated(one('chin_tuck'), 'liked'),
        rated(one('chin_tuck'), 'liked'),
        rated(one('chin_tuck'), 'disliked'),
        rated(one('far_gaze')),
        rated({ kind: 'routine', routineId: routine.id }, 'okay'),
      ]),
      CATALOG,
    );
    expect(stats.find((stat) => stat.exerciseId === 'chin_tuck')).toEqual({
      exerciseId: 'chin_tuck',
      liked: 2,
      okay: 0,
      disliked: 1,
    });
    // Unrated pauses don't count.
    expect(stats.find((stat) => stat.exerciseId === 'far_gaze')).toBeUndefined();
    for (const step of routine.steps) {
      expect(stats.find((stat) => stat.exerciseId === step.exercise)?.okay).toBe(1);
    }
  });

  it('lists the favourites and the least liked', () => {
    const stats = exerciseRatings(
      day([
        rated(one('march'), 'liked'),
        rated(one('march'), 'liked'),
        rated(one('chin_tuck'), 'liked'),
        rated(one('lunge'), 'disliked'),
        rated(one('wave'), 'liked'),
        rated(one('wave'), 'disliked'),
      ]),
      CATALOG,
    );
    expect(favouriteExercises(stats).map((stat) => stat.exerciseId)).toEqual([
      'march',
      'chin_tuck',
    ]);
    expect(leastLikedExercises(stats).map((stat) => stat.exerciseId)).toEqual(['lunge']);
  });
});
