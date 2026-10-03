import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { addDays, atTime } from '@/domain/time';
import type {
  DailySummary,
  DateKey,
  DayRecord,
  EvolutionPhase,
  WeeklyResult,
  XpEntry,
} from '@/domain/types';
import type { PersistedState } from '@/state/types';

/**
 * Dev-only sample data to review the weekly result: a finished week (Monday 5 – Sunday
 * 11 October 2026, ISO week 41) and its history, judged on Monday 12 by the real engine.
 */
export type WeekScenario = 'evolve' | 'stable' | 'room';

export const SCENARIO_WEEK = '2026-W41';
const START: DateKey = '2026-10-05';
/** When to look at it: the Monday after, in the morning. */
export const SCENARIO_NOW = atTime('2026-10-12', '09:00');

interface ScenarioShape {
  phase: EvolutionPhase;
  /** Good days among Monday–Friday. */
  good: number;
  history: WeeklyResult[];
  unlocked: string[];
}

const past = (
  week: string,
  start: DateKey,
  phaseBefore: EvolutionPhase,
  phaseAfter: EvolutionPhase,
  unlocked?: string,
): WeeklyResult => ({
  week,
  start,
  planned: 5,
  good: 4,
  result: 'good',
  phaseBefore,
  phaseAfter,
  ...(unlocked && { unlocked }),
});

const SHAPES: Record<WeekScenario, ScenarioShape> = {
  // Two good weeks in a row: Sedentario → Activo.
  evolve: {
    phase: 3,
    good: 4,
    history: [past('2026-W40', '2026-09-28', 2, 3)],
    unlocked: [],
  },
  // 3 of 5 good days (60 %): the avatar stays.
  stable: {
    phase: 3,
    good: 3,
    history: [past('2026-W40', '2026-09-28', 2, 3)],
    unlocked: [],
  },
  // Already at the top with two items: a perfect week brings the third (the lamp).
  room: {
    phase: 5,
    good: 5,
    history: [
      past('2026-W39', '2026-09-21', 5, 5, 'plant'),
      past('2026-W40', '2026-09-28', 5, 5, 'picture'),
    ],
    unlocked: ['plant', 'picture'],
  },
};

/** The sample data for a scenario, keeping the user's theme and language. */
export function weekScenarioState(scenario: WeekScenario, current: PersistedState): PersistedState {
  const shape = SHAPES[scenario];
  const days: Partial<Record<DateKey, DayRecord>> = {};
  const xpLedger: XpEntry[] = [];
  for (let i = 0; i < 5; i++) {
    const date = addDays(START, i);
    const isGood = i < shape.good;
    const completed = isGood ? 5 : 3;
    const xp = completed * 100 + (isGood ? 300 + 200 : 0);
    days[date] = {
      date,
      status: 'closed',
      returnBonus: false,
      recoveryUsed: false,
      openedAt: atTime(date, '09:00'),
      closedAt: atTime(date, '17:00'),
      summary: {
        planned: 6,
        completed,
        firstPrompt: completed - 1,
        postponed: 1,
        ignored: 1,
        skipped: 0,
        missed: 6 - completed,
        extras: 0,
        mainCompleted: isGood,
        microSec: completed * 45,
        movementSec: completed * 45 + (isGood ? 1200 : 0),
        interruptionSec: completed * 45,
        xp,
        isGood,
        isPerfect: false,
      } satisfies DailySummary,
    };
    xpLedger.push({
      key: `sample:${date}`,
      amount: xp,
      at: atTime(date, '17:00'),
      date,
      reason: 'microbreak',
    });
  }
  return {
    prefs: current.prefs,
    onboardedAt: atTime('2026-09-21', '09:00'),
    settings: { ...DEFAULT_SETTINGS, notifications: current.settings.notifications },
    dayOverrides: {},
    days,
    progress: {
      evolutionPhase: shape.phase,
      lastEvaluatedWeek: '2026-W40',
      lastSeenWeek: '2026-W40',
      weeklyResults: shape.history,
      unlockedRoomItems: shape.unlocked,
    },
    xpLedger,
    meta: current.meta,
  };
}
