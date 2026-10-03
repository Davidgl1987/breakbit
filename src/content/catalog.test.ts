import { describe, expect, it } from 'vitest';
import { BODY_AREAS, EQUIPMENT, type Localized } from '@/domain/types';
import { CATALOG } from './catalog';

const { exercises, routines, mainActivities } = CATALOG;

/** Breakbit builds habits; it never promises health outcomes. */
const MEDICAL_TERMS = [
  /\bcur(a|ar|e)\b/i,
  /\bdolor/i,
  /\bpain\b/i,
  /lesi[oó]n|injur/i,
  /rehab/i,
  /terap|therap/i,
  /tratamiento|treatment/i,
  /diagn/i,
];

function allTexts(): Localized[] {
  return [
    ...exercises.flatMap((item) => [item.name, item.description, ...item.steps]),
    ...routines.map((item) => item.name),
    ...mainActivities.flatMap((item) => [item.name, item.description, ...item.steps]),
  ];
}

describe('content catalog', () => {
  it('has unique ids', () => {
    const ids = [...exercises, ...routines, ...mainActivities].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is fully translated', () => {
    for (const text of allTexts()) {
      expect(text.es.trim(), JSON.stringify(text)).not.toBe('');
      expect(text.en.trim(), JSON.stringify(text)).not.toBe('');
    }
  });

  it('avoids medical language', () => {
    for (const text of allTexts()) {
      for (const term of MEDICAL_TERMS) {
        expect(text.es, `${term}`).not.toMatch(term);
        expect(text.en, `${term}`).not.toMatch(term);
      }
    }
  });

  it('keeps microbreak exercises short (20 s – 2 min) with steps', () => {
    for (const exercise of exercises) {
      expect(exercise.durationSec, exercise.id).toBeGreaterThanOrEqual(20);
      expect(exercise.durationSec, exercise.id).toBeLessThanOrEqual(120);
      expect(exercise.steps.length, exercise.id).toBeGreaterThanOrEqual(2);
      expect(exercise.areas.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it('offers at least two equipment-free exercises for every area', () => {
    for (const area of BODY_AREAS) {
      const count = exercises.filter(
        (exercise) => exercise.areas.includes(area) && exercise.equipment.length === 0,
      ).length;
      expect(count, area).toBeGreaterThanOrEqual(2);
    }
  });

  it('offers equipment-free options during work time and meetings', () => {
    const atDesk = exercises.filter(
      (item) => item.equipment.length === 0 && item.posture !== 'floor',
    );
    const inMeetings = atDesk.filter((item) => item.meetingFriendly !== 'no');
    expect(new Set(atDesk.flatMap((item) => item.areas)).size).toBe(BODY_AREAS.length);
    expect(new Set(inMeetings.flatMap((item) => item.areas)).size).toBe(BODY_AREAS.length);
  });

  it('uses every MVP equipment somewhere', () => {
    for (const item of EQUIPMENT) {
      const used =
        exercises.some((exercise) => exercise.equipment.includes(item)) ||
        mainActivities.some((activity) => activity.equipment.includes(item));
      expect(used, item).toBe(true);
    }
  });

  it('builds routines only from known exercises', () => {
    const ids = new Set(exercises.map((exercise) => exercise.id));
    for (const routine of routines) {
      for (const step of routine.steps)
        expect(ids.has(step.exerciseId), step.exerciseId).toBe(true);
    }
  });

  it('includes the master mini-routines with 30 s per movement', () => {
    const expected = {
      wake_up: ['march', 'arm_swing', 'trunk_twist', 'wave'],
      desk_reset: ['chest_opener', 'high_twist', 'golf_swing', 'wave'],
      active_legs: ['march', 'plie', 'push_side', 'kick_step'],
      active_reset: ['march', 'punch', 'lunge', 'high_twist', 'push_side', 'hop_rotate'],
    };
    for (const [id, steps] of Object.entries(expected)) {
      const routine = routines.find((item) => item.id === id);
      expect(
        routine?.steps.map((step) => step.exerciseId),
        id,
      ).toEqual(steps);
      expect(
        routine?.steps.every((step) => step.seconds === 30),
        id,
      ).toBe(true);
    }
  });

  it('keeps main activities between 5 and 30 minutes', () => {
    for (const activity of mainActivities) {
      expect(activity.durationMin.min, activity.id).toBeGreaterThanOrEqual(5);
      expect(activity.durationMin.max, activity.id).toBeLessThanOrEqual(30);
      expect(activity.durationMin.min, activity.id).toBeLessThanOrEqual(activity.durationMin.max);
    }
  });

  it('gives every main activity at least one slot', () => {
    for (const activity of mainActivities)
      expect(activity.slots.length, activity.id).toBeGreaterThan(0);
  });

  it('links main-activity routines that exist', () => {
    const ids = new Set(routines.map((routine) => routine.id));
    for (const activity of mainActivities) {
      if (activity.routineId) expect(ids.has(activity.routineId), activity.id).toBe(true);
    }
  });

  it('always offers walking outside without equipment', () => {
    const walk = mainActivities.find((activity) => activity.id === 'walk_outside');
    expect(walk?.equipment).toEqual([]);
  });

  it('keeps standing work for users with a standing desk', () => {
    const standing = mainActivities.filter((activity) => activity.id.startsWith('standing_work'));
    expect(standing.map((activity) => activity.id)).toEqual(['standing_work']);
    expect(standing[0]?.equipment).toEqual(['standing_desk']);
  });
});
