import { useMemo } from 'react';
import { CATALOG } from '@/content/catalog';
import {
  changeMainActivity,
  planDay,
  recentExerciseIds,
  type PlanDayRequest,
} from '@/domain/day/planDay';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import { dayEquipment } from '@/domain/day/today';
import type { DayPlan, EquipmentId, Instant } from '@/domain/types';
import { useAppStore } from '@/state/store';

export type TodayPlanRequest = Pick<
  PlanDayRequest,
  'date' | 'schedule' | 'meetings' | 'mainActivity' | 'previous' | 'now'
> & {
  /**
   * "Material de hoy" chosen on the day-start screen. Without it, the choice of the day
   * being re-planned (`previous`), if any; otherwise the planner uses the user's equipment.
   */
  equipment?: readonly EquipmentId[];
};

export interface DayPlanner {
  /** Plans (or re-plans) a day. */
  plan: (request: TodayPlanRequest) => DayPlan;
  /** Swaps only the main activity of a plan (with that day's equipment). */
  changeMain: (plan: DayPlan, choice: MainActivityChoice, now: Instant) => DayPlan;
}

/** Planning with the user's settings, the catalog and recent history. */
export function useDayPlanner(): DayPlanner {
  const settings = useAppStore((state) => state.settings);
  const days = useAppStore((state) => state.days);
  return useMemo(() => {
    return {
      plan: ({ equipment, ...request }) =>
        planDay({
          ...request,
          settings,
          chosenEquipment: equipment ?? request.previous?.equipment,
          catalog: CATALOG,
          rerollCount: request.previous?.rerollCount ?? 0,
          recentExerciseIds: recentExerciseIds(days, request.date, CATALOG),
        }),
      changeMain: (plan, choice, now) =>
        changeMainActivity(plan, choice, now, {
          catalog: CATALOG,
          discomfort: settings.discomfort,
          equipment: dayEquipment(plan, settings),
        }),
    };
  }, [settings, days]);
}
