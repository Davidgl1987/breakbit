import type { StoreApi } from 'zustand';
import { addExtraPause, advancePause } from '@/domain/gap/gap';
import * as lifecycle from '@/domain/pause/lifecycle';
import { clock } from '@/services/clock';
import type { AppState, GapActions } from '../types';
import { activityUpdater, contentContext, log } from './activities';

/** "Tengo un hueco": a waiting pause, the next one done now, or an extra one. */
export function gapActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): GapActions {
  const updateActivity = activityUpdater(set, get);

  const started = (id: string, option: string, outcome: string) => {
    log('exercise_started', { activityId: id });
    log('spontaneous_break', { activityId: id, data: { option, outcome } });
    return id;
  };

  return {
    takeGap: (date, option, proposal) => {
      switch (proposal.kind) {
        case 'main':
          return undefined;
        case 'due': {
          const updated = updateActivity(date, proposal.activity.id, (item, _plan, now) =>
            lifecycle.start(item, now),
          );
          return updated && started(updated.id, option, 'due');
        }
        case 'advance': {
          const updated = updateActivity(date, proposal.target.id, (_item, plan, now) =>
            advancePause(plan, proposal, now, contentContext(get().settings)),
          );
          return updated && started(updated.id, option, 'advance');
        }
        case 'extra': {
          const record = get().days[date];
          if (record?.status !== 'active' || !record.plan) return undefined;
          const { plan, id } = addExtraPause(record.plan, proposal, clock.now());
          set((state) => ({ days: { ...state.days, [date]: { ...record, plan } } }));
          return started(id, option, 'extra');
        }
      }
    },
  };
}
