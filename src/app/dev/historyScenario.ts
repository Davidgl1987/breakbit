import { CATALOG } from '@/content/catalog';
import { ROOM_ITEMS } from '@/content/roomItems';
import { closePlan, dayGoalXp, summarizeDay } from '@/domain/day/closeDay';
import { dayProgress } from '@/domain/day/progress';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { contentExerciseIds } from '@/domain/planner/pauseContent';
import { completionXp } from '@/domain/progress/awards';
import { evaluateWeeks } from '@/domain/progress/weekly';
import { createRng } from '@/domain/rng';
import { addDays, atTime, compareDateKeys, weekdayOf } from '@/domain/time';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { DateKey, DayPlan, DayRecord, ScheduledActivity, XpEntry } from '@/domain/types';
import { INITIAL_PROGRESS } from '@/state/initialState';
import type { PersistedState } from '@/state/types';

/**
 * Dev-only: eight weeks of believable history to review Progress. Workdays Monday to
 * Friday, real plans from the planner, more pauses done as the weeks go by, one day off
 * and one missed day; today (Wednesday 14 October 2026) under way. Weeks are judged by
 * the real rules.
 */
const SINCE: DateKey = '2026-08-17';
const TODAY: DateKey = '2026-10-14';
export const HISTORY_NOW = atTime(TODAY, '12:30');
const DAY_OFF: DateKey = '2026-09-11';
const MISSED: DateKey = '2026-09-23';

export function historyScenarioState(current: PersistedState): PersistedState {
  const settings = { ...DEFAULT_SETTINGS, notifications: current.settings.notifications };
  const days: Partial<Record<DateKey, DayRecord>> = {};
  const dayOverrides: PersistedState['dayOverrides'] = {
    [DAY_OFF]: { date: DAY_OFF, working: false, source: 'day_off' },
  };
  let xpLedger: XpEntry[] = [];

  for (let date = SINCE; compareDateKeys(date, TODAY) <= 0; date = addDays(date, 1)) {
    if (weekdayOf(date) > 5 || date === DAY_OFF) continue;
    if (date === MISSED) {
      days[date] = { date, status: 'absent', returnBonus: false, recoveryUsed: false };
      continue;
    }
    const rng = createRng(`history#${date}`);
    // From about half the pauses in August to most of them in October.
    const week = Math.floor((Date.parse(date) - Date.parse(SINCE)) / (7 * 86_400_000));
    const chance = Math.min(0.95, 0.5 + week * 0.06);
    const plan = generateDayPlan({ date, schedule: settings.schedule, settings, catalog: CATALOG });
    const isToday = date === TODAY;
    const activities = plan.activities.map((item): ScheduledActivity => {
      // Today, only the morning so far.
      if (isToday && item.currentScheduledAt > HISTORY_NOW) return item;
      const done = rng.next() < (item.kind === 'main' ? chance + 0.05 : chance);
      if (!done) {
        const skipped = item.kind === 'micro' && rng.next() < 0.15;
        return {
          ...item,
          status: skipped ? 'skipped' : 'missed',
          ...(skipped ? {} : { missReason: 'window_expired' as const }),
          remindersSent: 2,
        };
      }
      // Stable preferences make populated favourites and disliked exercises reviewable.
      const preference =
        [...(contentExerciseIds(item.content, CATALOG)[0] ?? '')].reduce(
          (sum, letter) => sum + letter.charCodeAt(0),
          0,
        ) % 5;
      const firstPrompt = item.kind === 'micro' && rng.next() < 0.7;
      const postponed = !firstPrompt && rng.next() < 0.4;
      return {
        ...item,
        status: 'completed',
        ...(item.kind === 'micro'
          ? {
              rating:
                preference === 0
                  ? ('disliked' as const)
                  : preference === 1
                    ? ('okay' as const)
                    : ('liked' as const),
            }
          : {}),
        startedAt: item.currentScheduledAt,
        completedAt: item.currentScheduledAt + item.durationSec * 1000,
        elapsedSec: item.durationSec,
        firstPrompt,
        postponeCount: postponed ? 1 : 0,
        postponeMinutes: postponed ? 10 : 0,
        remindersSent: firstPrompt ? 0 : 1,
      };
    });
    const worked: DayPlan = { ...plan, activities };
    for (const item of activities) {
      xpLedger = [
        ...xpLedger,
        ...completionXp(item, { returnBonus: false }, item.completedAt ?? 0),
      ];
    }
    if (isToday) {
      days[date] = {
        date,
        status: 'active',
        plan: worked,
        returnBonus: false,
        recoveryUsed: false,
        openedAt: atTime(date, '09:00'),
      };
      continue;
    }
    const closed = closePlan(worked);
    xpLedger = [
      ...xpLedger,
      ...dayGoalXp(date, dayProgress(closed, CATALOG), atTime(date, '17:00')),
    ];
    const xp = xpLedger
      .filter((entry) => entry.date === date)
      .reduce((sum, entry) => sum + entry.amount, 0);
    days[date] = {
      date,
      status: 'closed',
      plan: closed,
      summary: summarizeDay(closed, CATALOG, xp),
      returnBonus: false,
      recoveryUsed: false,
      openedAt: atTime(date, '09:00'),
      closedAt: atTime(date, '17:00'),
      mood: (['great', 'good', 'loaded', 'good'] as const)[Math.floor(rng.next() * 4)],
    };
  }

  const progress = evaluateWeeks(
    INITIAL_PROGRESS,
    TODAY,
    {
      since: SINCE,
      days,
      isWorkday: (date) => weekdayOf(date) <= 5 && date !== DAY_OFF,
      catalog: CATALOG,
    },
    ROOM_ITEMS.map((item) => item.id),
  );
  return {
    prefs: current.prefs,
    onboardedAt: atTime(SINCE, '08:30'),
    settings,
    dayOverrides,
    days,
    progress: { ...progress, lastSeenWeek: progress.lastEvaluatedWeek },
    xpLedger,
    meta: current.meta,
  };
}
