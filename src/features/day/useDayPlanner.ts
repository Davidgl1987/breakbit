import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import {
  changeMainActivity,
  planDay,
  recentExerciseIds,
  type PlanDayRequest,
} from '@/domain/day/planDay';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import type { DayPlan, Instant } from '@/domain/types';
import { useAppStore } from '@/state/store';

export type TodayPlanRequest = Pick<
  PlanDayRequest,
  'date' | 'schedule' | 'meetings' | 'mainActivity' | 'previous' | 'now'
>;

export interface DayPlanner {
  /** Plans (or re-plans) a day. */
  plan: (request: TodayPlanRequest) => DayPlan;
  /** Swaps only the main activity of a plan. */
  changeMain: (plan: DayPlan, choice: MainActivityChoice, now: Instant) => DayPlan;
}

/** Planning with the user's settings, the catalog and recent history. */
export function useDayPlanner(): DayPlanner {
  const settings = useAppStore((state) => state.settings);
  const days = useAppStore((state) => state.days);
  return useMemo(() => {
    const context = {
      catalog: CATALOG,
      discomfort: settings.discomfort,
      equipment: settings.equipment,
    };
    return {
      plan: (request) =>
        planDay({
          ...request,
          settings,
          catalog: CATALOG,
          rerollCount: request.previous?.rerollCount ?? 0,
          recentExerciseIds: recentExerciseIds(days, request.date, CATALOG),
        }),
      changeMain: (plan, choice, now) => changeMainActivity(plan, choice, now, context),
    };
  }, [settings, days]);
}
