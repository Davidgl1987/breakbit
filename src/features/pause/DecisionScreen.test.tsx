import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { pausePath } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import type { DateKey, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

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
const T = first.scheduledAt;
const activity = (): ScheduledActivity =>
  store().days[DATE]!.plan!.activities.find((item) => item.id === first.id)!;

/** Real time keeps running during a test: instants are compared to the second. */
const near = (expected: number) => ({
  asymmetricMatch: (actual: unknown) =>
    typeof actual === 'number' && Math.abs(actual - expected) < 1000,
  toString: () => `near ${expected}`,
});

/** The app at `minutes` after the first pause's time, with the engine caught up. */
function openAt(minutes: number, route = pausePath(first.id)) {
  clock.travelTo(T + minutes * MIN);
  store().reconcile(T + minutes * MIN);
  return renderWithRouter(<AppRoutes />, { route });
}

beforeEach(() => {
  store().completeOnboarding(DEFAULT_SETTINGS);
  store().startDay(plan);
});
afterEach(() => clock.setOffset(0));

describe('decision screen', () => {
  it('offers "Vamos" first, then the postpones that fit, then discarding', () => {
    openAt(1);
    const go = screen.getByRole('button', { name: 'Vamos' });
    const notNow = screen.getByRole('heading', { name: 'Ahora no puedo' });
    const discard = screen.getByRole('button', { name: 'Descartar pausa · −50 XP' });
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(go, notNow) && follows(notNow, discard)).toBe(true);
    expect(screen.getByRole('img', { name: 'Tu avatar te anima a moverte' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Es hora de moverte' }),
    ).toBeInTheDocument();
    for (const minutes of [5, 10, 15]) {
      expect(
        screen.getByRole('button', { name: `Aplazar ${minutes} minutos` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Vamos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar pausa · −50 XP' })).toBeInTheDocument();
  });

  it('measures a notification open without taking it as an answer', () => {
    openAt(2, `${pausePath(first.id)}?src=notif`);
    expect(activity().notificationOpenedAt).toEqual(near(T + 2 * MIN));
    // No action: the next reminder still comes.
    store().reconcile(T + 11 * MIN);
    expect(activity()).toMatchObject({ status: 'notification_sent', remindersSent: 1 });
  });

  it('changes nothing when opened from inside the app', () => {
    openAt(2);
    expect(activity().notificationOpenedAt).toBeUndefined();
  });

  it('starts the pause with "Vamos" and opens the exercise', async () => {
    const { user } = openAt(1);
    await user.click(screen.getByRole('button', { name: 'Vamos' }));
    expect(activity()).toMatchObject({ startedAt: near(T + MIN), firstPrompt: true });

    // The exercise: the avatar showing the move, the timer ring, then the steps.
    expect(screen.getByRole('img', { name: 'Demostración del ejercicio' })).toBeInTheDocument();
    const timer = screen.getByRole('progressbar', { name: 'Tiempo de la pausa' });
    const seconds = activity().durationSec;
    expect(timer).toHaveTextContent(
      `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    );
    expect(screen.getByRole('list', { name: 'Cómo hacerlo' })).toBeInTheDocument();
    expect(screen.queryByText(/próxima fase/)).not.toBeInTheDocument();
  });

  it('postpones and goes back to Today, where it shows as postponed', async () => {
    const { user } = openAt(3);
    await user.click(screen.getByRole('button', { name: 'Aplazar 10 minutos' }));
    expect(activity()).toMatchObject({
      status: 'postponed',
      currentScheduledAt: near(T + 13 * MIN),
    });
    expect(screen.getByText('en 10 min')).toBeInTheDocument();
    expect(screen.getAllByText('Aplazada').length).toBeGreaterThan(0);
    // Still the way in, as before postponing.
    expect(screen.getByRole('link', { name: 'Vamos' })).toHaveAttribute(
      'href',
      pausePath(first.id),
    );
  });

  it('keeps "Vamos" on a postponed pause before it comes back', async () => {
    const view = openAt(2);
    await view.user.click(screen.getByRole('button', { name: 'Aplazar 10 minutos' }));
    view.unmount();

    const { user } = openAt(5);
    expect(screen.getByText(/^Te la volvemos a proponer a las \d\d:\d\d$/)).toBeInTheDocument();
    expect(screen.getByText('Ya la has aplazado 10 min')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Aplazar/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Vamos' }));
    expect(activity()).toMatchObject({ startedAt: near(T + 5 * MIN), firstPrompt: false });
  });

  it('never calls unanswered time "postponed"', () => {
    const view = openAt(16);
    expect(screen.queryByText(/aplazados/)).not.toBeInTheDocument();
    expect(screen.getByText('Quedan 14 min para hacerla')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aplazar 15 minutos' })).not.toBeInTheDocument();
    view.unmount();

    openAt(26);
    expect(screen.getByText('Ya no puedes aplazarla más.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vamos' })).toBeInTheDocument();
  });

  it('shows only the minutes explicitly postponed', async () => {
    const view = openAt(2);
    await view.user.click(screen.getByRole('button', { name: 'Aplazar 10 minutos' }));
    view.unmount();

    // Notified again at +12, left unanswered until +20.
    openAt(20);
    expect(
      screen.getByText('Ya la has aplazado 10 min · Quedan 10 min para hacerla'),
    ).toBeInTheDocument();
    expect(activity().postponeMinutes).toBe(10);
  });

  it("counts each pause's own postpones, not the day's", async () => {
    const view = openAt(2);
    await view.user.click(screen.getByRole('button', { name: 'Aplazar 10 minutos' }));
    view.unmount();

    const second = store().days[DATE]!.plan!.activities.filter((item) => item.kind === 'micro')[1]!;
    clock.travelTo(second.currentScheduledAt + MIN);
    store().reconcile(second.currentScheduledAt + MIN);
    renderWithRouter(<AppRoutes />, { route: pausePath(second.id) });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Es hora de moverte' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/aplazado/)).not.toBeInTheDocument();
  });

  it('discards with an optional reason and −50 XP', async () => {
    const { user } = openAt(1);
    await user.click(screen.getByRole('button', { name: 'Descartar pausa · −50 XP' }));
    const sheet = screen.getByRole('dialog', { name: '¿Descartar esta pausa?' });
    await user.click(within(sheet).getByRole('button', { name: 'En una reunión' }));
    await user.click(within(sheet).getByRole('button', { name: 'Descartar · −50 XP' }));

    expect(activity()).toMatchObject({ status: 'skipped', skipReason: 'meeting' });
    expect(store().xpLedger.map((entry) => entry.amount)).toEqual([-50]);
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
  });

  it('shows where a pause stands when it is not waiting for an answer', () => {
    const early = openAt(-30);
    expect(
      screen.getByRole('heading', { level: 1, name: /Tu pausa es a las/ }),
    ).toBeInTheDocument();
    early.unmount();

    openAt(31);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Se pasó su momento' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a Hoy' })).toHaveAttribute('href', '/');
  });

  it('sends unknown pauses back to Today', () => {
    openAt(1, pausePath('2026-10-05:nope'));
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('due pause in the app', () => {
  it('shows a banner on other tabs, and the next-pause card on Today', async () => {
    const progress = openAt(1, '/progress');
    expect(screen.getByRole('status')).toHaveTextContent('Es hora de moverte');
    expect(within(screen.getByRole('status')).getByRole('link', { name: 'Vamos' })).toHaveAttribute(
      'href',
      pausePath(first.id),
    );
    progress.unmount();

    openAt(1, '/');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Ahora')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vamos' })).toHaveAttribute(
      'href',
      pausePath(first.id),
    );
  });

  it('offers to continue a pause under way', () => {
    clock.travelTo(T + MIN);
    store().reconcile(T + MIN);
    store().startPause(DATE, first.id);
    renderWithRouter(<AppRoutes />);
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toHaveAttribute(
      'href',
      `${pausePath(first.id)}/play`,
    );
  });
});
