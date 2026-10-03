import type { StoreApi } from 'zustand';
import { CATALOG } from '@/content/catalog';
import * as session from '@/domain/main/session';
import { rebalance } from '@/domain/planner/rebalance';
import { completionXp, withAwards } from '@/domain/progress/awards';
import type { ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import type { AppState, MainActions } from '../types';
import { activityUpdater, contentContext, log, withActivity } from './activities';

function mainActivityInfoOf(item: ScheduledActivity) {
  const activityId = item.content.kind === 'main' ? item.content.activityId : undefined;
  return CATALOG.mainActivities.find((activity) => activity.id === activityId);
}

/** Today's main activity: start, pause and complete. The rules live in domain/main. */
export function mainActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): MainActions {
  const updateActivity = activityUpdater(set, get);

  return {
    startMain: (date, id) => {
      const firstStart =
        get().days[date]?.plan?.activities.find((item) => item.id === id)?.startedAt === undefined;
      const updated = updateActivity(date, id, (item, plan, now) => {
        const started = session.startMain(item, now);
        if (started === item) return item;
        // It now happens at its real time: pauses that would clash with it move.
        return item.startedAt === undefined
          ? rebalance(withActivity(plan, started), now, contentContext(get().settings))
          : started;
      });
      if (updated && firstStart) log('exercise_started', { activityId: id });
    },

    pauseMain: (date, id) => {
      updateActivity(date, id, (item, _plan, now) => session.pauseMain(item, now));
    },

    shortenMain: (date, id) => {
      updateActivity(date, id, (item) => {
        // Only activities that declare a short version have one.
        const short = mainActivityInfoOf(item)?.shortVersionMin;
        return short === undefined ? item : session.shortenMain(item, short);
      });
    },

    completeMain: (date, id) => {
      const updated = updateActivity(date, id, (item, plan, now) => {
        const completed = session.completeMain(item, now);
        if (completed === item) return item;
        // Pauses too close after it move later.
        return rebalance(withActivity(plan, completed), now, contentContext(get().settings));
      });
      if (!updated) return;
      const record = get().days[date];
      const awards = completionXp(
        updated,
        { returnBonus: record?.returnBonus ?? false },
        clock.now(),
      );
      set((state) => ({ xpLedger: withAwards(state.xpLedger, awards) }));
      log('main_activity_completed', {
        activityId: id,
        data: { elapsedSec: updated.elapsedSec ?? 0, withTimer: updated.startedAt !== undefined },
      });
    },
  };
}
