import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { pausePath, pausePlayPath } from '@/app/routes';
import { ToastHost } from '@/app/ToastHost';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import type { ActivityContent, DateKey, ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { es } from '@/i18n/es';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { STEP_TAP_GUARD_MS } from './useStepTimer';

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
/** Moves the (simulated) clock on, as time passing during the exercise. */
const wait = (ms: number) => act(() => clock.setOffset(clock.offset() + ms));
const timer = () => screen.getByRole('progressbar', { name: 'Tiempo de la pausa' });
const clockText = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const ui = (route: string) =>
  renderWithRouter(
    <>
      <AppRoutes />
      <ToastHost />
    </>,
    { route },
  );

/** The day started, the first pause notified and, optionally, "Vamos" pressed. */
function setUp({ content, started = true }: { content?: ActivityContent; started?: boolean } = {}) {
  store().completeOnboarding(DEFAULT_SETTINGS);
  const withContent = content
    ? {
        ...plan,
        activities: plan.activities.map((item) =>
          item.id === first.id ? { ...item, content, durationSec: 120 } : item,
        ),
      }
    : plan;
  store().startDay(withContent);
  clock.travelTo(T + MIN);
  store().reconcile(T + MIN);
  if (started) store().startPause(DATE, first.id);
}

afterEach(() => clock.setOffset(0));

describe('exercise player', () => {
  beforeEach(() => setUp());

  it('counts the exercise down and completes it when time is up', async () => {
    ui(pausePlayPath(first.id));
    const seconds = first.durationSec;
    expect(timer()).toHaveTextContent(clockText(seconds));

    // Mid-second, clear of rounding at the edge.
    await wait(10_500);
    expect(timer()).toHaveTextContent(clockText(seconds - 10));

    await wait(seconds * 1000);
    expect(activity()).toMatchObject({ status: 'completed' });
    expect(screen.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeInTheDocument();
  });

  it('stops the clock while paused', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByText('En pausa')).toBeInTheDocument();
    const before = timer().textContent;

    await wait(5 * MIN);
    expect(timer().textContent).toBe(before);
    expect(activity().status).not.toBe('completed');

    await user.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(screen.queryByText('En pausa')).not.toBeInTheDocument();
  });

  it('can be finished early with "Hecho"', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await wait(5_000);
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(activity()).toMatchObject({ status: 'completed' });
    expect(activity().elapsedSec).toBeLessThan(first.durationSec);
  });

  it('shows the area the move works', () => {
    ui(pausePlayPath(first.id));
    const exercise = CATALOG.exercises.find(
      (item) => first.content.kind === 'exercises' && item.id === first.content.exerciseIds[0],
    )!;
    expect(screen.getByRole('heading', { level: 1, name: exercise.name.es })).toBeInTheDocument();
    for (const area of exercise.areas) expect(screen.getByText(es.areas[area])).toBeInTheDocument();
  });
});

describe('routines in the player', () => {
  const routine = CATALOG.routines[0]!;
  const total = routine.steps.length;
  const move = (n: number) =>
    screen.queryByText(`${routine.name.es} · Movimiento ${n} de ${total}`);
  const moveName = (n: number) =>
    CATALOG.exercises.find((item) => item.id === routine.steps[n - 1]!.exerciseId)!.name.es;
  const next = () => screen.getByRole('button', { name: 'Siguiente' });
  /** Past the guard that keeps a quick second tap from landing on the next move. */
  const settle = () => wait(STEP_TAP_GUARD_MS + 100);

  beforeEach(() => setUp({ content: { kind: 'routine', routineId: routine.id } }));

  it('"Siguiente" moves on one move at a time and "Hecho" only shows on the last', async () => {
    expect(total).toBeGreaterThan(2);
    const { user } = ui(pausePlayPath(first.id));

    for (let n = 1; n < total; n++) {
      expect(move(n)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: moveName(n) })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Hecho' })).not.toBeInTheDocument();
      await user.click(next());
      expect(move(n + 1)).toBeInTheDocument();
      expect(activity().status).not.toBe('completed');
      await settle();
    }

    expect(screen.getByRole('heading', { level: 1, name: moveName(total) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(activity()).toMatchObject({ status: 'completed' });
  });

  it('finishing the first move early only ends that move', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await wait(3_000);
    await user.click(next());

    expect(move(2)).toBeInTheDocument();
    expect(timer()).toHaveTextContent(clockText(routine.steps[1]!.seconds));
    expect(activity().status).not.toBe('completed');
    expect(activity().completedAt).toBeUndefined();
    expect(screen.queryByRole('heading', { name: '¡Pausa hecha!' })).not.toBeInTheDocument();
  });

  it('a double tap on "Siguiente" moves on only once', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await user.dblClick(next());
    expect(move(2)).toBeInTheDocument();
  });

  it("a double tap on the move before last doesn't finish the routine", async () => {
    const { user } = ui(pausePlayPath(first.id));
    for (let n = 1; n < total - 1; n++) {
      await user.click(next());
      await settle();
    }
    expect(move(total - 1)).toBeInTheDocument();

    // "Siguiente" turns into "Hecho" under the finger.
    await user.dblClick(next());
    expect(move(total)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hecho' })).toBeInTheDocument();
    expect(activity().status).not.toBe('completed');
  });

  it('a tap as a move runs out belongs to that move', async () => {
    const { user } = ui(pausePlayPath(first.id));
    // The clock ticks in quarter seconds: clearly past the end of the move.
    await wait(routine.steps[0]!.seconds * 1000 + 500);
    expect(move(2)).toBeInTheDocument();

    await user.click(next());
    expect(move(2)).toBeInTheDocument();
  });

  it('runs the moves out on their own and completes after the last one', async () => {
    ui(pausePlayPath(first.id));
    for (const [index, step] of routine.steps.entries()) {
      expect(move(index + 1)).toBeInTheDocument();
      await wait(step.seconds * 1000 + 1000);
    }
    expect(activity().status).toBe('completed');
    expect(screen.getByRole('heading', { level: 1, name: '¡Pausa hecha!' })).toBeInTheDocument();
  });

  it('counts only the time actually moved', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await wait(5_000);
    await user.click(next());
    for (let n = 2; n < total; n++) {
      await settle();
      await user.click(next());
    }
    await settle();
    await user.click(screen.getByRole('button', { name: 'Hecho' }));

    const moved = 5 + ((total - 1) * (STEP_TAP_GUARD_MS + 100)) / 1000;
    expect(activity().elapsedSec).toBeGreaterThanOrEqual(Math.floor(moved));
    expect(activity().elapsedSec).toBeLessThanOrEqual(Math.ceil(moved));
  });
});

describe('pause done', () => {
  beforeEach(() => setUp());

  it('celebrates with the XP earned and the day so far', async () => {
    const { user } = ui(pausePlayPath(first.id));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));

    expect(screen.getByRole('img', { name: 'Tu avatar lo celebra' })).toBeInTheDocument();
    // Just the name: the time actually moved is for the stats.
    expect(screen.getByText(contentName(first.content, 'es'))).toBeInTheDocument();
    expect(screen.getByText('+120 XP')).toBeInTheDocument();
    expect(screen.getByText('+100 pausa · +20 a la primera')).toBeInTheDocument();
    expect(screen.getByText('Pausas de hoy')).toBeInTheDocument();
    expect(screen.getByText('1 de 5')).toBeInTheDocument();
    // The pauses lead; the main activity comes after, still to do.
    const pauses = screen.getByText('Pausas de hoy');
    const mainLine = screen.getByText('Actividad principal pendiente');
    expect(
      pauses.compareDocumentPosition(mainLine) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
    expect(store().xpLedger.reduce((sum, entry) => sum + entry.amount, 0)).toBe(120);
  });

  it('shows the welcome-back bonus on the same line', async () => {
    useAppStore.setState((state) => ({
      days: { ...state.days, [DATE]: { ...state.days[DATE]!, returnBonus: true } },
    }));
    const { user } = ui(pausePlayPath(first.id));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));

    expect(screen.getByText('+170 XP')).toBeInTheDocument();
    expect(
      screen.getByText('+150 pausa con bonus de regreso · +20 a la primera'),
    ).toBeInTheDocument();
  });

  it('tries to close a tab opened from a notification', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    const { user } = ui(`${pausePlayPath(first.id)}?src=notif`);
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));
    expect(close).toHaveBeenCalled();
    // If the browser keeps it open: back to Today, with a word.
    expect(screen.getByRole('status')).toHaveTextContent('Listo. Vuelve a lo tuyo.');
    close.mockRestore();
  });
});

describe('confirmations', () => {
  beforeEach(() => setUp({ started: false }));

  it('confirms a postpone with the time it comes back', async () => {
    const { user } = ui(pausePath(first.id));
    await user.click(screen.getByRole('button', { name: 'Aplazar 10 minutos' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      /^Aplazada: te la volvemos a proponer a las \d\d:\d\d/,
    );
  });

  it('confirms a discard with its penalty', async () => {
    const { user } = ui(pausePath(first.id));
    await user.click(screen.getByRole('button', { name: 'Descartar pausa · −50 XP' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Descartar · −50 XP' }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Pausa descartada · −50 XP');
  });
});
