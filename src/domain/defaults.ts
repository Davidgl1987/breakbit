import type { UserSettings } from './types';

/** Starting point before onboarding; every value is editable by the user. */
export const DEFAULT_SETTINGS: UserSettings = {
  workDays: [1, 2, 3, 4, 5],
  schedule: {
    workStart: '09:00',
    workEnd: '17:00',
    breaks: [{ start: '11:00', durationMin: 15 }],
    lunch: { start: '14:00', durationMin: 60 },
  },
  intensity: 'normal',
  discomfort: { neck: 0, back: 0, shoulders: 0, wrists: 0, eyes: 0, sedentary: 0 },
  equipment: [],
  preferredMainActivityMin: 20,
  notifications: { enabled: true, dayStart: true, microbreaks: true, dayEnd: true },
};
