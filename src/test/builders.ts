import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { DaySchedule, Exercise, UserSettings } from '@/domain/types';

export function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

export function makeSchedule(overrides: Partial<DaySchedule> = {}): DaySchedule {
  return { ...DEFAULT_SETTINGS.schedule, ...overrides };
}

export function makeExercise(overrides: Partial<Exercise> & Pick<Exercise, 'id'>): Exercise {
  return {
    name: { es: overrides.id, en: overrides.id },
    description: { es: '-', en: '-' },
    steps: [],
    areas: ['neck'],
    equipment: [],
    durationSec: 40,
    posture: 'either',
    meetingFriendly: 'yes',
    ...overrides,
  };
}
