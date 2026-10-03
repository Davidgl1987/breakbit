import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { planDay } from '@/domain/day/planDay';
import { atTime } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const MONDAY: DateKey = '2026-10-05';
const store = () => useAppStore.getState();
const travel = (date: DateKey, time: `${number}:${number}`) => clock.travelTo(atTime(date, time));

function startMonday() {
  store().startDay(
    planDay({
      date: MONDAY,
      schedule: DEFAULT_SETTINGS.schedule,
      settings: DEFAULT_SETTINGS,
      catalog: CATALOG,
      now: atTime(MONDAY, '08:30'),
    }),
  );
}

beforeEach(() => store().completeOnboarding(DEFAULT_SETTINGS));
afterEach(() => clock.setOffset(0));

describe('Today', () => {
  it('offers to start a workday that has no plan yet', () => {
    travel(MONDAY, '08:40');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByRole('heading', { name: 'Tu jornada de hoy' })).toBeInTheDocument();
    expect(screen.getByText(/09:00–17:00 · 5 pausas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar jornada' })).toHaveAttribute(
      'href',
      '/day/start',
    );
  });

  it('shows the day under way: next pause, activity, progress and timeline', () => {
    startMonday();
    travel(MONDAY, '09:10');
    renderWithRouter(<AppRoutes />);

    expect(screen.getByText('Te quedan 7 h 50 min de jornada')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
    expect(screen.getByText(/^en \d+/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Actividad de hoy' })).toBeInTheDocument();
    expect(screen.getByText('0/5 pausas')).toBeInTheDocument();
    const timeline = screen.getByRole('heading', { name: 'Tu jornada' }).parentElement!;
    expect(within(timeline).getByText('Empieza tu jornada')).toBeInTheDocument();
    expect(within(timeline).getByText('Comida · hasta las 15:00')).toBeInTheDocument();
    expect(within(timeline).getAllByText(/^Pausa · /)).toHaveLength(5);
  });

  it('shows the next exercise step by step', async () => {
    startMonday();
    travel(MONDAY, '09:10');
    const { user } = renderWithRouter(<AppRoutes />);
    await user.click(screen.getByRole('button', { name: 'Ver ejercicio' }));
    const sheet = screen.getByRole('dialog');
    expect(within(sheet).getByRole('list', { name: 'Cómo hacerlo' })).toBeInTheDocument();
  });

  it('changes the activity from Today, keeping the rest of the plan', async () => {
    startMonday();
    travel(MONDAY, '09:10');
    const before = store().days[MONDAY]!.plan!;
    const { user } = renderWithRouter(<AppRoutes />);
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    await user.click(within(sheet).getByRole('radio', { name: /Paseo por casa u oficina/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));

    const after = store().days[MONDAY]!.plan!;
    const main = after.activities.find((item) => item.kind === 'main');
    expect(main?.content).toEqual({ kind: 'main', activityId: 'walk_indoors' });
    const pauseIds = (plan: typeof after) =>
      plan.activities.filter((item) => item.kind === 'micro').map((item) => item.id);
    expect(pauseIds(after)).toEqual(pauseIds(before));
  });

  it('marks the day off and brings it back', async () => {
    startMonday();
    travel(MONDAY, '09:10');
    const { user } = renderWithRouter(<AppRoutes />);
    await user.click(screen.getByRole('button', { name: 'Hoy no trabajo' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Hoy no trabajo' }),
    );
    expect(screen.getByRole('heading', { name: 'Hoy no trabajas' })).toBeInTheDocument();
    expect(screen.getByText('Próxima jornada: martes, a las 09:00.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deshacer: hoy sí trabajo' }));
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
  });

  it('rests on days off work, showing the next workday', () => {
    travel('2026-10-10', '10:00');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByRole('heading', { name: 'Hoy descansas' })).toBeInTheDocument();
    expect(screen.getByText('Próxima jornada: lunes, a las 09:00.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hoy sí trabajo' })).toHaveAttribute(
      'href',
      '/day/start',
    );
  });

  it('knows when the hours are over', () => {
    travel(MONDAY, '18:00');
    renderWithRouter(<AppRoutes />);
    expect(
      screen.getByRole('heading', { name: 'Tu horario de hoy ya ha terminado' }),
    ).toBeInTheDocument();

    act(() => startMonday());
    expect(screen.getByRole('heading', { name: 'Jornada terminada' })).toBeInTheDocument();
  });

  it('previews the exercise without starting the pause', async () => {
    startMonday();
    travel(MONDAY, '09:10');
    const plan = store().days[MONDAY]!.plan!;
    const { user } = renderWithRouter(<AppRoutes />);
    await user.click(screen.getByRole('button', { name: 'Ver ejercicio' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store().days[MONDAY]!.plan).toBe(plan);
    expect(plan.activities.every((item) => item.status === 'pending' && !item.startedAt)).toBe(
      true,
    );
    expect(store().xpLedger).toEqual([]);
  });

  it('hides "A mano hoy" when the plan needs no gear', () => {
    startMonday();
    travel(MONDAY, '09:10');
    renderWithRouter(<AppRoutes />);
    expect(screen.queryByText('A mano hoy')).not.toBeInTheDocument();
  });

  it('shows only the gear the plan needs', () => {
    const settings = { ...DEFAULT_SETTINGS, equipment: ['mat', 'kettlebell'] as const };
    store().updateSettings({ equipment: [...settings.equipment] });
    store().startDay(
      planDay({
        date: MONDAY,
        schedule: settings.schedule,
        settings: { ...settings, equipment: [...settings.equipment] },
        catalog: CATALOG,
        now: atTime(MONDAY, '08:30'),
        mainActivity: { activityId: 'mat_mobility', start: '11:00', durationMin: 15 },
      }),
    );
    travel(MONDAY, '09:10');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByText('A mano hoy')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Esterilla' })).toBeInTheDocument();
  });
});
