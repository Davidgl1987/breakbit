import type { StoreApi } from 'zustand';
import { advanceDay } from '@/domain/pause/advance';
import * as lifecycle from '@/domain/pause/lifecycle';
import {
  completionXp,
  extraBreakXp,
  pauseCompletionXp,
  withAwards,
} from '@/domain/progress/awards';
import { rebalance } from '@/domain/planner/rebalance';
import { compareDateKeys, toDateKey } from '@/domain/time';
import type { DateKey, DayRecord, XpEntry } from '@/domain/types';
import { clock } from '@/services/clock';
import type { AppState, PauseActions } from '../types';
import { activityUpdater, contentContext, log, withActivity } from './activities';

/** The engine and the user's answers to a microbreak. The rules live in domain/pause. */
export function pauseActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): PauseActions {
  const updateActivity = activityUpdater(set, get);

  return {
    reconcile: (now) => {
      const { days, settings } = get();
      const today = toDateKey(now);
      const changed: Partial<Record<DateKey, DayRecord>> = {};
      const awards: XpEntry[] = [];
      for (const record of Object.values(days)) {
        if (!record?.plan || record.status !== 'active') continue;
        if (compareDateKeys(record.date, today) > 0) continue;
        const { plan, events } = advanceDay(record.plan, now, contentContext(settings));
        if (plan === record.plan) continue;
        changed[record.date] = { ...record, plan };
        for (const event of events) {
          log(event.type, { activityId: event.activityId, at: event.at });
          // A main activity whose time added up while the app looked elsewhere.
          const completed = plan.activities.find((item) => item.id === event.activityId);
          if (event.type === 'main_activity_completed' && completed) {
            awards.push(...completionXp(completed, { returnBonus: record.returnBonus }, now));
          }
        }
      }
      if (Object.keys(changed).length > 0) {
        set((state) => ({
          days: { ...state.days, ...changed },
          ...(awards.length > 0 && { xpLedger: withAwards(state.xpLedger, awards) }),
        }));
      }
    },

    notificationOpened: (date, id) => {
      const updated = updateActivity(date, id, (item, _plan, now) =>
        lifecycle.markNotificationOpened(item, now),
      );
      if (updated) log('notification_opened', { activityId: id });
    },

    postponePause: (date, id, minutes) => {
      const updated = updateActivity(date, id, (item, plan, now) => {
        const postponed = lifecycle.postpone(item, minutes, now);
        if (postponed === item) return plan;
        // Pauses that now come too close afterwards move later.
        return rebalance(withActivity(plan, postponed), now, contentContext(get().settings));
      });
      if (updated) log('exercise_postponed', { activityId: id, data: { minutes } });
    },

    startPause: (date, id) => {
      const updated = updateActivity(date, id, (item, _plan, now) => lifecycle.start(item, now));
      if (updated) log('exercise_started', { activityId: id });
    },

    completePause: (date, id, elapsedSec) => {
      const updated = updateActivity(date, id, (item, _plan, now) =>
        lifecycle.complete(item, now, elapsedSec),
      );
      if (!updated) return;
      const record = get().days[date];
      const now = clock.now();
      const awards = [
        ...pauseCompletionXp(updated, { returnBonus: record?.returnBonus ?? false }, now),
        ...(record?.plan ? extraBreakXp(updated, record.plan, get().xpLedger, now) : []),
      ];
      set((state) => ({ xpLedger: withAwards(state.xpLedger, awards) }));
      log('exercise_completed', { activityId: id, data: { elapsedSec: updated.elapsedSec ?? 0 } });
      if (updated.firstPrompt) log('exercise_completed_first_prompt', { activityId: id });
    },

    discardPause: (date, id, reason) => {
      const updated = updateActivity(date, id, (item) => lifecycle.discard(item, reason));
      if (!updated) return;
      const penalty = lifecycle.discardPenalty(updated, clock.now());
      set((state) => ({ xpLedger: withAwards(state.xpLedger, [penalty]) }));
      log('exercise_skipped', { activityId: id, data: reason ? { reason } : undefined });
    },
  };
}
