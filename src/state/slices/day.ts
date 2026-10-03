import type { StoreApi } from 'zustand';
import { CATALOG } from '@/content/catalog';
import * as overrides from '@/domain/calendar/overrides';
import { isWorkday, resolveDaySchedule, sameSchedule } from '@/domain/calendar/schedule';
import { closeRecord, pastDaysToSettle, returnBonusFor } from '@/domain/day/closeDay';
import { recoverablePause, recoverPause } from '@/domain/day/recovery';
import { withAwards } from '@/domain/progress/awards';
import { toDateKey } from '@/domain/time';
import type {
  DateKey,
  DayOverrides,
  DayPlan,
  DayRecord,
  UserSettings,
  XpEntry,
} from '@/domain/types';
import { clock } from '@/services/clock';
import type { AppState, DayActions } from '../types';
import { log } from './activities';
import { assertValidSchedule } from './settings';

/** Today's plan and its life on the calendar. Plans are built by domain/day/planDay. */
export function dayActions(
  set: StoreApi<AppState>['setState'],
  get: StoreApi<AppState>['getState'],
): DayActions {
  const savePlan = (plan: DayPlan) => {
    assertValidSchedule(plan.schedule);
    set((state) => {
      const existing = state.days[plan.date];
      return {
        dayOverrides: withDayHours(state.dayOverrides, state.settings, plan),
        days: {
          ...state.days,
          [plan.date]: {
            // A new day after missing workdays: ×1.5 base XP, once per absence.
            returnBonus: existing ? existing.returnBonus : hasReturnBonus(state, plan.date),
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

    closeDay: (date, answers = {}) => {
      const record = get().days[date];
      if (record?.status !== 'active') return;
      const closed = closeRecord(
        { ...record, mood: answers.mood, nextDayDecision: answers.nextDay },
        clock.now(),
        CATALOG,
        get().xpLedger,
      );
      set((state) => ({
        days: { ...state.days, [date]: closed.record },
        xpLedger: withAwards(state.xpLedger, closed.awards),
      }));
      const summary = closed.record.summary;
      log('day_completed', {
        data: {
          date,
          good: summary?.isGood ?? false,
          perfect: summary?.isPerfect ?? false,
          ...(answers.nextDay && { nextDay: answers.nextDay }),
        },
      });
      if (answers.mood) log('mood_recorded', { data: { date, mood: answers.mood } });
    },

    closePastDays: (now) => {
      const state = get();
      if (state.onboardedAt === undefined) return;
      const { close, absent } = pastDaysToSettle({
        today: toDateKey(now),
        since: toDateKey(state.onboardedAt),
        days: state.days,
        isWorkday: (date) => isWorkday(date, state.settings, state.dayOverrides),
      });
      if (close.length === 0 && absent.length === 0) return;

      const changed: Partial<Record<DateKey, DayRecord>> = {};
      let ledger: XpEntry[] = state.xpLedger;
      for (const date of close) {
        const closed = closeRecord(state.days[date]!, now, CATALOG, ledger);
        changed[date] = closed.record;
        ledger = withAwards(ledger, closed.awards);
      }
      for (const date of absent) {
        changed[date] = { date, status: 'absent', returnBonus: false, recoveryUsed: false };
      }
      set((current) => ({
        days: { ...current.days, ...changed },
        xpLedger: withAwards(current.xpLedger, ledger),
      }));
      for (const date of close) {
        const summary = changed[date]?.summary;
        log('day_completed', {
          data: {
            date,
            good: summary?.isGood ?? false,
            perfect: summary?.isPerfect ?? false,
            lazy: true,
          },
        });
      }
    },

    recoverPause: (date) => {
      const record = get().days[date];
      const missed = record && recoverablePause(record);
      if (!record?.plan || !missed) return undefined;
      const recovered = recoverPause(missed, clock.now());
      const plan = {
        ...record.plan,
        activities: record.plan.activities.map((item) =>
          item.id === missed.id ? recovered : item,
        ),
      };
      set((state) => ({
        days: { ...state.days, [date]: { ...record, plan, recoveryUsed: true } },
      }));
      log('exercise_started', { activityId: missed.id, data: { recovery: true } });
      return missed.id;
    },
  };
}

function hasReturnBonus(state: AppState, date: DateKey): boolean {
  if (state.onboardedAt === undefined) return false;
  return returnBonusFor({
    today: date,
    since: toDateKey(state.onboardedAt),
    days: state.days,
    isWorkday: (day) => isWorkday(day, state.settings, state.dayOverrides),
  });
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
