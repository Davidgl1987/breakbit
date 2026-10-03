import type { StoreApi } from 'zustand';
import * as overrides from '@/domain/calendar/overrides';
import { isWorkday, resolveDaySchedule, sameSchedule } from '@/domain/calendar/schedule';
import type { DateKey, DayOverrides, DayPlan, UserSettings } from '@/domain/types';
import { clock } from '@/services/clock';
import type { AppState, DayActions } from '../types';
import { assertValidSchedule } from './settings';

/** Today's plan and its life on the calendar. Plans are built by domain/day/planDay. */
export function dayActions(set: StoreApi<AppState>['setState']): DayActions {
  const savePlan = (plan: DayPlan) => {
    assertValidSchedule(plan.schedule);
    set((state) => {
      const existing = state.days[plan.date];
      return {
        dayOverrides: withDayHours(state.dayOverrides, state.settings, plan),
        days: {
          ...state.days,
          [plan.date]: {
            returnBonus: false,
            recoveryUsed: false,
            openedAt: clock.now(),
            ...existing,
            date: plan.date,
            status: 'active',
            plan,
          },
        },
      };
    });
  };

  return {
    startDay: savePlan,
    updateDayPlan: savePlan,
    undoDayOff: (date) => {
      set((state) => {
        let dayOverrides = overrides.clearOverride(state.dayOverrides, date);
        const record = state.days[date];
        if (!record) return { dayOverrides };
        // A day that was under way goes on with its plan and hours.
        if (record.plan) dayOverrides = withDayHours(dayOverrides, state.settings, record.plan);
        return { dayOverrides, days: { ...state.days, [date]: { ...record, status: 'active' } } };
      });
    },
  };
}

/** The calendar keeps today's real hours: an override only when they differ from the template. */
function withDayHours(
  current: DayOverrides,
  settings: Pick<UserSettings, 'workDays' | 'schedule'>,
  plan: DayPlan,
): DayOverrides {
  const date: DateKey = plan.date;
  const scheduled = resolveDaySchedule(date, settings, current);
  if (scheduled && sameSchedule(scheduled, plan.schedule)) return current;
  const withoutDate = overrides.clearOverride(current, date);
  const template = isWorkday(date, settings, {}) ? settings.schedule : null;
  if (template && sameSchedule(template, plan.schedule)) return withoutDate;
  return overrides.setCustomSchedule(withoutDate, date, plan.schedule);
}
