import type { StoreApi } from 'zustand';
import { clock } from '@/services/clock';
import { initialState } from '../initialState';
import type { AppState, DataActions } from '../types';

export function dataActions(set: StoreApi<AppState>['setState']): DataActions {
  return {
    resetData: () => set((state) => initialState(clock.now(), state.prefs)),
    replaceData: (data) => set(data),
  };
}
