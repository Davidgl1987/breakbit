import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { PlannedNotification } from '@/domain/notifications/schedule';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { atTime } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { notificationContent } from './notificationContent';
import { runEngine } from './runEngine';

const DATE: DateKey = '2026-10-05';
const MIN = 60_000;
const store = () => useAppStore.getState();
const plan = generateDayPlan({
  date: DATE,
  schedule: DEFAULT_SETTINGS.schedule,
  settings: DEFAULT_SETTINGS,
  catalog: CATALOG,
});
const first = plan.activities.find((item) => item.kind === 'micro')!;

beforeEach(() => store().completeOnboarding(DEFAULT_SETTINGS));
// The store's actions read the app clock: keep it with the engine, not the real time.
afterEach(() => clock.setOffset(0));

describe('runEngine', () => {
  it('moves the day forward, hands over the reminders and flags a due pause', () => {
    store().startDay(plan);
    const sync = vi.fn();
    clock.travelTo(first.scheduledAt + MIN);
    runEngine(first.scheduledAt + MIN, { sync });

    const updated = store().days[DATE]!.plan!.activities.find((item) => item.id === first.id);
    expect(updated?.status).toBe('notification_sent');
    const agenda = sync.mock.calls[0]![0] as PlannedNotification[];
    expect(agenda.map((item) => item.id)).toContain(`pause:${first.id}:0`);
    expect(document.title).toBe('Pausa ahora · Breakbit');

    clock.travelTo(first.scheduledAt + 2 * MIN);
    store().startPause(DATE, first.id);
    runEngine(first.scheduledAt + 2 * MIN, { sync });
    expect(document.title).toBe('Breakbit');
  });

  it('announces the start of a workday that has no plan yet', () => {
    const sync = vi.fn();
    runEngine(atTime(DATE, '08:00'), { sync });
    const agenda = sync.mock.calls[0]![0] as PlannedNotification[];
    expect(agenda.map((item) => item.kind)).toEqual(['day_start']);
  });
});

describe('notificationContent', () => {
  beforeEach(() => store().startDay(plan));

  it('names the exercise and links to the decision screen', () => {
    const content = notificationContent(
      {
        id: `pause:${first.id}:0`,
        kind: 'pause',
        at: first.scheduledAt,
        date: DATE,
        tag: `pause:${first.id}`,
        activityId: first.id,
      },
      store(),
    );
    expect(content).toMatchObject({
      title: 'Hora de moverte',
      url: `/pause/${encodeURIComponent(first.id)}?src=notif`,
    });
  });

  it('says how long a reminded pause can still wait', () => {
    const content = notificationContent(
      {
        id: `pause:${first.id}:0:r1`,
        kind: 'pause_reminder',
        at: first.scheduledAt + 10 * MIN,
        date: DATE,
        tag: `pause:${first.id}`,
        activityId: first.id,
      },
      store(),
    );
    expect(content?.title).toBe('Tu pausa sigue esperando');
    expect(content?.body).toMatch(/quedan 20 min$/);
  });

  it('opens the start of the day', () => {
    const content = notificationContent(
      { id: `day-start:${DATE}`, kind: 'day_start', at: 0, date: DATE, tag: 'day-start' },
      store(),
    );
    expect(content).toMatchObject({ title: 'Empieza tu jornada', url: '/day/start?src=notif' });
  });
});
