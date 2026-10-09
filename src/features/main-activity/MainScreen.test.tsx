import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { mainPath } from '@/app/routes';
import { ToastHost } from '@/app/ToastHost';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { planDay } from '@/domain/day/planDay';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan, HHmm, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const DATE: DateKey = '2026-10-05';
const MIN = 60_000;
const store = () => useAppStore.getState();
const main = (): ScheduledActivity =>
  store().days[DATE]!.plan!.activities.find((item) => item.kind === 'main')!;
const travel = (time: HHmm) => clock.travelTo(atTime(DATE, time));
/** Moves the (simulated) clock on, as time passing. */
const wait = (ms: number) => act(() => clock.setOffset(clock.offset() + ms));
const ring = () => screen.getByRole('progressbar', { name: 'Tiempo de la actividad' });
const ui = (route = mainPath(`${DATE}:main`)) =>
  renderWithRouter(
    <>
      <AppRoutes />
      <ToastHost />
    </>,
    { route },
  );

/** The day started with this main activity; the clock at `time`. */
function setUp(mainActivity: MainActivityChoice, time: HHmm = '12:30') {
  store().completeOnboarding(DEFAULT_SETTINGS);
  store().startDay(
    planDay({
      date: DATE,
      schedule: DEFAULT_SETTINGS.schedule,
      settings: DEFAULT_SETTINGS,
      catalog: CATALOG,
      now: atTime(DATE, '08:30'),
      mainActivity,
    }),
  );
  travel(time);
}
const WALK: MainActivityChoice = { activityId: 'walk_outside', start: '13:00', durationMin: 20 };
const STANDING: MainActivityChoice = {
  activityId: 'standing_work',
  start: '10:00',
  durationMin: 30,
};
const MOBILITY: MainActivityChoice = {
  activityId: 'mobility_routine',
  start: '11:00',
  durationMin: 5,
};

afterEach(() => clock.setOffset(0));

describe('main activity, before starting', () => {
  it('shows what it is, when, and how', () => {
    setUp(WALK);
    ui();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Paseo por la calle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Continua · 20 min')).toBeInTheDocument();
    expect(screen.getByText('13:00 · en horario de trabajo')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Cómo hacerlo' })).toBeInTheDocument();
  });

  it('starts the session', async () => {
    setUp(WALK);
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(ring()).toHaveTextContent('20:00');
    expect(ring()).toHaveTextContent('quedan');
    expect(main().startedAt).toBeDefined();
    expect(screen.getByText('Puedes salir de aquí: el tiempo sigue contando.')).toBeInTheDocument();
  });

  it('asks before counting "Ya la he hecho", then celebrates', async () => {
    setUp(WALK, '16:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Ya la he hecho' }));
    const sheet = screen.getByRole('dialog', { name: '¿Ya la has hecho?' });
    expect(sheet).toHaveTextContent('La apuntamos como hecha, con sus 20 min.');
    await user.click(within(sheet).getByRole('button', { name: 'Sí, ya la he hecho' }));

    expect(
      screen.getByRole('heading', { level: 1, name: '¡Actividad hecha!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+300 XP')).toBeInTheDocument();
    expect(screen.getByText('+300 actividad principal')).toBeInTheDocument();
    expect(screen.getByText('Actividad principal completada')).toBeInTheDocument();
    expect(main()).toMatchObject({ status: 'completed', elapsedSec: 1200 });
  });

  it('changes the activity or its time, keeping the pauses', async () => {
    setUp(WALK, '09:10');
    const pauseIds = (plan: DayPlan) =>
      plan.activities.filter((item) => item.kind === 'micro').map((item) => item.id);
    const before = pauseIds(store().days[DATE]!.plan!);
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Cambiar actividad u hora' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    await user.click(within(sheet).getByRole('radio', { name: /Paseo por casa u oficina/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Paseo por casa u oficina' }),
    ).toBeInTheDocument();
    expect(main().content).toEqual({ kind: 'main', activityId: 'walk_indoors' });
    expect(pauseIds(store().days[DATE]!.plan!)).toEqual(before);
  });
});

describe('continuous session', () => {
  it('counts down, and stands still while paused', async () => {
    setUp(WALK, '13:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await wait(30_000);
    // The clock ticks by the second: either side of it.
    expect(ring()).toHaveTextContent(/^19:3[01]quedan$/);

    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(ring()).toHaveTextContent('En pausa');
    const paused = ring().textContent;
    await wait(10 * MIN);
    expect(ring().textContent).toBe(paused);

    await user.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(ring()).toHaveTextContent('quedan');
  });

  it('completes on its own when the time adds up', async () => {
    setUp(WALK, '13:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await wait(20 * MIN + 2_000);
    expect(main()).toMatchObject({ status: 'completed', elapsedSec: 1200 });
    expect(
      screen.getByRole('heading', { level: 1, name: '¡Actividad hecha!' }),
    ).toBeInTheDocument();
  });

  it('asks before "Terminar" ends it early', async () => {
    setUp(WALK, '13:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    // The clock ticks by the second: clearly past the 5 minutes.
    await wait(5 * MIN + 1_500);
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    const sheet = screen.getByRole('dialog', { name: '¿Terminar ya?' });
    expect(sheet).toHaveTextContent('Llevas 5 min de 20 min. Contará como hecha.');
    expect(main().status).not.toBe('completed');
    // "Seguir": nothing changes, and the time goes on.
    await user.click(within(sheet).getByRole('button', { name: 'Seguir' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(main().status).not.toBe('completed');
    expect(main().runningSince).toBeDefined();
  });

  it('"Terminar" ends it early with the time actually done, once confirmed', async () => {
    setUp(WALK, '13:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await wait(5 * MIN);
    await user.click(screen.getByRole('button', { name: 'Terminar' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, terminar' }),
    );
    expect(main().status).toBe('completed');
    expect(main().elapsedSec).toBeGreaterThanOrEqual(300);
    expect(main().elapsedSec).toBeLessThanOrEqual(301);
    expect(screen.getByText('+300 XP')).toBeInTheDocument();
  });

  it('keeps counting after leaving the screen', async () => {
    setUp(WALK, '13:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('link', { name: 'Cerrar' }));

    // Today's clock moves in 5 s steps: clearly past the 5 minutes.
    await wait(5 * MIN + 6_000);
    const card = screen.getByRole('heading', { name: 'Actividad de hoy' }).parentElement!;
    expect(card).toHaveTextContent('En curso');
    expect(card).toHaveTextContent('5 de 20 min');
    await user.click(within(card).getByRole('link', { name: 'Continuar' }));
    expect(ring()).toHaveTextContent(/^1[45]:\d\dquedan$/);
  });
});

describe('accumulated session', () => {
  it('adds up blocks until the time is done', async () => {
    setUp(STANDING, '10:00');
    const { user } = ui();
    expect(screen.getByText('En bloques · 30 min')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Empezar un bloque' }));
    expect(screen.getByText(/^Bloque en marcha · 0:0\d$/)).toBeInTheDocument();

    await wait(10 * MIN);
    await user.click(screen.getByRole('button', { name: 'Parar bloque' }));
    expect(ring()).toHaveTextContent(/^10:0\dde 30 min$/);
    expect(screen.getByText('Ningún bloque en marcha')).toBeInTheDocument();

    // Between blocks, nothing adds up.
    await wait(60 * MIN);
    expect(main().accumulatedSec).toBeLessThanOrEqual(601);
    await user.click(screen.getByRole('button', { name: 'Otro bloque' }));
    await wait(20 * MIN + 2_000);
    expect(main()).toMatchObject({ status: 'completed', elapsedSec: 1800 });
    expect(
      screen.getByRole('heading', { level: 1, name: '¡Actividad hecha!' }),
    ).toBeInTheDocument();
  });
});

describe('guided activity', () => {
  it('follows the moves as time goes by', async () => {
    setUp(MOBILITY, '11:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(screen.getByText('Movimiento 1 de 5')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Retracción cervical suave' }),
    ).toBeInTheDocument();

    // Each move lasts a minute.
    await wait(61_000);
    expect(screen.getByText('Movimiento 2 de 5')).toBeInTheDocument();
  });

  it('goes through its sequence again in a longer block, never stretching the last move', async () => {
    setUp({ activityId: 'band_block', start: '11:00', durationMin: 10 }, '11:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(screen.getByText('Movimiento 1 de 5')).toBeInTheDocument();

    // The fifth move, and the first one next: the block goes on.
    await wait(4 * MIN + 30_000);
    expect(screen.getByText('Movimiento 5 de 5')).toBeInTheDocument();
    expect(screen.getByText('Después: Apertura con banda')).toBeInTheDocument();
    await wait(MIN);
    expect(screen.getByText('Vuelta 2 · Movimiento 1 de 5')).toBeInTheDocument();

    // The block's last move: nothing after it.
    await wait(4 * MIN);
    expect(screen.getByText('Vuelta 2 · Movimiento 5 de 5')).toBeInTheDocument();
    expect(screen.queryByText(/^Después:/)).not.toBeInTheDocument();
  });
});

describe('the activity on Today', () => {
  const card = () => screen.getByRole('heading', { name: 'Actividad de hoy' }).parentElement!;

  it('is a preview before its time and the way in once it comes', async () => {
    setUp(WALK, '09:10');
    ui('/');
    expect(card()).toHaveTextContent('Hoy a las 13:00');
    expect(within(card()).getByRole('button', { name: 'Ver actividad' })).toBeInTheDocument();

    await act(() => travel('13:01'));
    expect(card()).toHaveTextContent('Es la hora');
    expect(within(card()).getByRole('link', { name: 'Vamos' })).toBeInTheDocument();
  });

  it('shows it done', async () => {
    setUp(WALK, '16:00');
    ui('/');
    await act(() => store().completeMain(DATE, `${DATE}:main`));
    expect(within(card()).getByText('Completada')).toBeInTheDocument();
    expect(within(card()).queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('activity done', () => {
  it('leads with the main activity, then the pauses and the level', async () => {
    setUp(WALK, '16:00');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Ya la he hecho' }));
    await user.click(screen.getByRole('button', { name: 'Sí, ya la he hecho' }));

    const mainLine = screen.getByText('Actividad principal completada');
    const pauses = screen.getByText('Pausas de hoy');
    const level = screen.getByText('Nivel 1');
    const before = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(before(mainLine, pauses)).toBe(true);
    expect(before(pauses, level)).toBe(true);
    expect(screen.queryByText(/de \d+ pausas$/)).not.toBeInTheDocument();
  });
});

describe('from a notification', () => {
  it('keeps where it came from, so going back can close the tab', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    setUp(WALK, '13:00');
    const { user } = ui(`${mainPath(`${DATE}:main`)}?src=notif`);
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('button', { name: 'Terminar' }));
    await user.click(screen.getByRole('button', { name: 'Sí, terminar' }));
    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));
    expect(close).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Listo. Vuelve a lo tuyo.');
    close.mockRestore();
  });
});
