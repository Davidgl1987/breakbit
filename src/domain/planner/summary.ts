import type { Catalog, DayPlan, ScheduledActivity } from '../types';

export interface PlanSummary {
  microCount: number;
  main?: ScheduledActivity;
  /** Planned movement time. */
  movementSec: number;
  /** Planned time away from work: pauses in breaks or meetings, and main activities done
   * while working, don't interrupt it. */
  interruptionSec: number;
}

/** Day-start numbers: how many pauses, the mission and the estimated interruption. */
export function summarizePlan(plan: DayPlan, catalog: Catalog): PlanSummary {
  const planned = plan.activities.filter((item) => item.origin === 'plan');
  const micros = planned.filter((item) => item.kind === 'micro');
  const main = planned.find((item) => item.kind === 'main');
  const mainActivityId = main?.content.kind === 'main' ? main.content.activityId : undefined;
  const mainDefinition = catalog.mainActivities.find((activity) => activity.id === mainActivityId);

  const interrupts = (item: ScheduledActivity) => {
    if (item.slot !== 'work') return false;
    if (item.kind === 'main') return !mainDefinition?.whileWorking;
    return true;
  };

  return {
    microCount: micros.length,
    main,
    movementSec: planned.reduce((sum, item) => sum + item.durationSec, 0),
    interruptionSec: planned.filter(interrupts).reduce((sum, item) => sum + item.durationSec, 0),
  };
}
