import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { areaById, CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { planDay } from '@/domain/day/planDay';
import { nextPause } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { contentAreas } from '@/features/day/contentItems';
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
  it('only offers closing the day while there is one under way', () => {
    travel(MONDAY, '08:40');
    const { unmount } = renderWithRouter(<AppRoutes />);
    expect(screen.queryByRole('link', { name: /Fin de jornada/ })).not.toBeInTheDocument();
    unmount();

    startMonday();
    travel(MONDAY, '10:00');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByRole('link', { name: /Fin de jornada/ })).toHaveAttribute(
      'href',
      '/day/end',
    );
  });

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

    // Next to the greeting: what's left of the workday.
    const dayClock = screen.getByText('Te quedan 7 h 50 min de jornada').closest('p')!;
    expect(dayClock).toHaveTextContent('Te quedan7 h 50 min');
    expect(screen.getByRole('banner')).toContainElement(dayClock);
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
    expect(screen.getByText(/^en \d+/)).toBeInTheDocument();
    // The areas the next pause works, by name for screen readers.
    const next = nextPause(store().days[MONDAY]!.plan!, clock.now())!;
    const card = screen.getByRole('heading', { name: 'Próxima pausa' }).parentElement!;
    const names = contentAreas(next.content).map((area) => areaById(area)!.name.es);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names.slice(0, 3)) {
      expect(within(card).getByRole('img', { name })).toBeInTheDocument();
    }
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

  it('marks the day off before starting it, and brings it back', async () => {
    travel(MONDAY, '09:10');
    const { user } = renderWithRouter(<AppRoutes />);
    await user.click(screen.getByRole('button', { name: 'Hoy no trabajo' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Hoy no trabajo' }),
    );
    expect(screen.getByRole('heading', { name: 'Hoy no trabajas' })).toBeInTheDocument();
    expect(screen.getByText('Próxima jornada: martes, a las 09:00.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deshacer: hoy sí trabajo' }));
    expect(screen.getByRole('link', { name: 'Empezar jornada' })).toBeInTheDocument();
  });

  it('says when the workday starts, next to the greeting, if it was started early', () => {
    startMonday();
    travel(MONDAY, '08:40');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByText('Tu jornada empieza a las 09:00').closest('p')).toHaveTextContent(
      'Empieza a las09:00',
    );
  });

  it('"Reuniones" lists today\'s meetings: add, change or remove them', async () => {
    startMonday();
    travel(MONDAY, '09:10');
    const meetings = () => store().days[MONDAY]!.plan!.meetings;
    const sheet = () => screen.getByRole('dialog', { name: 'Reuniones de hoy' });
    const { user } = renderWithRouter(<AppRoutes />);

    expect(screen.getByRole('button', { name: /Reuniones/ })).toHaveTextContent('Ninguna hoy');
    await user.click(screen.getByRole('button', { name: /Reuniones/ }));
    // Only the meetings: closing the day lives elsewhere.
    expect(within(sheet()).queryByRole('link', { name: 'Cerrar jornada' })).not.toBeInTheDocument();

    // A new meeting (the next half hour) re-plans the day: no pause during it.
    await user.click(within(sheet()).getByRole('button', { name: 'Añadir reunión' }));
    const add = screen.getByRole('dialog', { name: 'Añadir reunión' });
    await user.click(within(add).getByRole('button', { name: 'Añadir' }));
    expect(meetings()).toEqual([{ id: 'm1', start: '09:30', end: '10:00', canMove: false }]);
    const during = store()
      .days[MONDAY]!.plan!.activities.filter((item) => item.kind === 'micro')
      .filter((item) => {
        const at = new Date(item.currentScheduledAt);
        const minute = at.getHours() * 60 + at.getMinutes();
        return minute >= 9 * 60 + 30 && minute < 10 * 60;
      });
    expect(during).toEqual([]);

    // Changing it: "Puedo moverme".
    await user.click(within(sheet()).getByRole('button', { name: /09:30–10:00/ }));
    const edit = screen.getByRole('dialog', { name: 'Cambiar reunión' });
    await user.click(within(edit).getByRole('checkbox', { name: /Puedo moverme/ }));
    await user.click(within(edit).getByRole('button', { name: 'Guardar' }));
    expect(meetings()).toEqual([{ id: 'm1', start: '09:30', end: '10:00', canMove: true }]);

    // And removing it.
    await user.click(within(sheet()).getByRole('button', { name: /09:30–10:00/ }));
    await user.click(screen.getByRole('button', { name: 'Quitar reunión' }));
    expect(meetings()).toEqual([]);

    // No "Listo": it closes like any sheet.
    expect(within(sheet()).queryByRole('button', { name: 'Listo' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no longer offers "Hoy no trabajo" once the day has started', () => {
    startMonday();
    travel(MONDAY, '09:10');
    renderWithRouter(<AppRoutes />);
    expect(screen.getByRole('heading', { name: 'Próxima pausa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hoy no trabajo' })).not.toBeInTheDocument();
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
