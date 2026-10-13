import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { CATALOG } from '@/content/catalog';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { summarizeDay } from '@/domain/day/closeDay';
import { addDays, atTime } from '@/domain/time';
import type {
  DailySummary,
  DateKey,
  DayRecord,
  EvolutionPhase,
  ScheduledActivity,
  WeeklyResult,
  XpEntry,
} from '@/domain/types';
import type { PersistedState } from '@/state/types';

/**
 * Dev-only sample data to review the weekly result: a finished week (Monday 5 – Sunday
 * 11 October 2026, ISO week 41) and its history, judged on Monday 12 by the real engine.
 */
export type WeekScenario = 'evolve' | 'stable' | 'bad' | 'neutral' | 'room';

export const SCENARIO_WEEK = '2026-W41';
const START: DateKey = '2026-10-05';
/** When to look at it: the Monday after, in the morning. */
export const SCENARIO_NOW = atTime('2026-10-12', '09:00');

interface ScenarioShape {
  phase: EvolutionPhase;
  /** Good days among Monday–Friday. */
  good: number;
  planned?: number;
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
  bad: { phase: 3, good: 1, history: [past('2026-W40', '2026-09-28', 2, 3)], unlocked: [] },
  neutral: {
    phase: 2,
    good: 2,
    planned: 2,
    history: [past('2026-W40', '2026-09-28', 1, 2)],
    unlocked: [],
  },
  // Already at the top with two items: a good week brings the third (the lamp).
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
  const settings = {
    ...DEFAULT_SETTINGS,
    discomfort: { neck: 3, upper_back: 2, hips_legs: 3 } as const,
    notifications: current.settings.notifications,
  };
  for (let i = 0; i < 5; i++) {
    const date = addDays(START, i);
    if (i >= (shape.planned ?? 5)) {
      days[date] = { date, status: 'day_off', returnBonus: false, recoveryUsed: false };
      continue;
    }
    const isGood = i < shape.good;
    const completed = isGood ? 5 : 3;
    const xp = completed * 100 + (isGood ? 300 + 200 : 0);
    const plan = generateDayPlan({
      date,
      schedule: settings.schedule,
      meetings: [],
      settings,
      catalog: CATALOG,
    });
    let microIndex = 0;
    const areaOrder = ['hips_legs', 'neck', 'hips_legs', 'upper_back', 'hips_legs'];
    plan.activities = plan.activities.map((item): ScheduledActivity => {
      if (item.kind === 'main')
        return {
          ...item,
          status: isGood ? 'completed' : 'missed',
          ...(isGood && {
            elapsedSec: item.durationSec,
            completedAt: item.currentScheduledAt + item.durationSec * 1000,
          }),
        };
      const index = microIndex++;
      const area = areaOrder[index % areaOrder.length];
      const exercise = CATALOG.exercises.find(
        (move) => move.areas.length === 1 && move.areas[0] === area && move.equipment.length === 0,
      )!;
      return {
        ...item,
        content: { kind: 'exercises', exerciseIds: [exercise.id] },
        status: index < completed ? 'completed' : 'missed',
        ...(index < completed && {
          elapsedSec: item.durationSec,
          completedAt: item.currentScheduledAt + item.durationSec * 1000,
          firstPrompt: index > 0,
        }),
      };
    });
    days[date] = {
      date,
      status: 'closed',
      returnBonus: false,
      recoveryUsed: false,
      openedAt: atTime(date, '09:00'),
      closedAt: atTime(date, '17:00'),
      plan,
      summary: summarizeDay(plan, CATALOG, xp) satisfies DailySummary,
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
    settings,
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
