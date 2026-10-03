import { CATALOG } from '@/content/catalog';
import { markDayOff } from '@/domain/calendar/overrides';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { atTime } from '@/domain/time';
import { initialState } from '@/state/initialState';
import type { PersistedState } from '@/state/types';

export const FIXTURE_DATE = '2026-10-05';
const DATE = FIXTURE_DATE;

/** A realistic saved state touching every section. */
export function fullState(): PersistedState {
  const plan = generateDayPlan({
    date: DATE,
    schedule: DEFAULT_SETTINGS.schedule,
    meetings: [{ id: 'm1', start: '10:00', end: '10:30', canMove: true }],
    settings: { ...DEFAULT_SETTINGS, equipment: ['mat'] },
    catalog: CATALOG,
  });
  return JSON.parse(
    JSON.stringify({
      ...initialState(atTime(DATE, '08:00'), { theme: 'dark', locale: 'en' }),
      onboardedAt: atTime(DATE, '08:05'),
      settings: { ...DEFAULT_SETTINGS, equipment: ['mat'] },
      dayOverrides: markDayOff({}, '2026-10-06'),
      days: {
        [DATE]: {
          date: DATE,
          status: 'active',
          plan,
          openedAt: atTime(DATE, '09:00'),
          returnBonus: false,
          recoveryUsed: false,
        },
        '2026-10-02': {
          date: '2026-10-02',
          status: 'closed',
          returnBonus: false,
          recoveryUsed: true,
          mood: 'good',
          nextDayDecision: 'repeat',
          summary: {
            planned: 5,
            completed: 4,
            firstPrompt: 2,
            postponed: 1,
            ignored: 0,
            skipped: 0,
            missed: 1,
            extras: 1,
            mainCompleted: true,
            microSec: 200,
            movementSec: 1400,
            interruptionSec: 200,
            xp: 820,
            isGood: true,
            isPerfect: false,
          },
        },
      },
      progress: {
        evolutionPhase: 2,
        lastEvaluatedWeek: '2026-W40',
        weeklyResults: [
          {
            week: '2026-W40',
            start: '2026-09-28',
            planned: 5,
            good: 4,
            result: 'good',
            phaseBefore: 1,
            phaseAfter: 2,
          },
        ],
        unlockedRoomItems: [],
      },
      xpLedger: [
        {
          key: `micro:${DATE}:p0`,
          amount: 100,
          at: atTime(DATE, '09:40'),
          date: DATE,
          reason: 'microbreak',
        },
      ],
    }),
  ) as PersistedState;
}
