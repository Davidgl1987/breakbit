import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import type { DateKey } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const MONDAY: DateKey = '2026-10-05';
const store = () => useAppStore.getState();
const startButton = () => screen.getByRole('button', { name: 'Empezar jornada' });

function setTime(group: string, field: 'Inicio' | 'Fin', value: string, root = document.body) {
  const fields = within(within(root).getByRole('group', { name: group }));
  fireEvent.change(fields.getByLabelText(field), { target: { value } });
}

beforeEach(() => {
  clock.travelTo(new Date(2026, 9, 5, 8, 40).getTime());
  store().completeOnboarding(DEFAULT_SETTINGS);
});
afterEach(() => clock.setOffset(0));

describe('day start', () => {
  it('proposes the day and starts it', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });

    expect(screen.getByRole('heading', { level: 1, name: 'Buenos días' })).toBeInTheDocument();
    expect(screen.getByText('lunes, 5 de octubre')).toBeInTheDocument();
    expect(screen.getByText('pausas previstas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Actividad de hoy' })).toBeInTheDocument();

    await user.click(startButton());

    const record = store().days[MONDAY];
    expect(record).toMatchObject({ status: 'active', date: MONDAY });
    expect(record?.plan?.activities.length).toBeGreaterThan(0);
    expect(screen.getByText('Próxima pausa')).toBeInTheDocument();
  });

  it("adds a meeting to today's plan", async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Añadir reunión' }));
    const sheet = screen.getByRole('dialog', { name: 'Añadir reunión' });
    setTime('Añadir reunión', 'Inicio', '10:00', sheet);
    setTime('Añadir reunión', 'Fin', '11:30', sheet);
    await user.click(within(sheet).getByRole('checkbox'));
    await user.click(within(sheet).getByRole('button', { name: 'Añadir' }));

    expect(screen.getByText('10:00–11:30')).toBeInTheDocument();
    expect(screen.getByText('Puedes moverte')).toBeInTheDocument();

    await user.click(startButton());
    expect(store().days[MONDAY]?.plan?.meetings).toEqual([
      { id: 'm1', start: '10:00', end: '11:30', canMove: true },
    ]);
  });

  it('rejects a meeting that ends before it starts', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Añadir reunión' }));
    const sheet = screen.getByRole('dialog', { name: 'Añadir reunión' });
    setTime('Añadir reunión', 'Inicio', '12:00', sheet);
    setTime('Añadir reunión', 'Fin', '11:00', sheet);
    expect(within(sheet).getByRole('alert')).toHaveTextContent(
      'La reunión debe terminar después de empezar.',
    );
    expect(within(sheet).getByRole('button', { name: 'Añadir' })).toBeDisabled();
  });

  it("changes only today's hours", async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    setTime('Horario', 'Fin', '15:00');
    await user.click(startButton());

    expect(store().days[MONDAY]?.plan?.schedule.workEnd).toBe('15:00');
    expect(store().dayOverrides[MONDAY]).toMatchObject({ working: true });
    expect(store().settings.schedule.workEnd).toBe('17:00');
  });

  it("can't start with invalid hours", () => {
    renderWithRouter(<AppRoutes />, { route: '/day/start' });
    setTime('Horario', 'Fin', '08:00');
    expect(screen.getByRole('alert')).toHaveTextContent('La jornada debe terminar');
    expect(startButton()).toBeDisabled();
  });

  it('lets the user pick the activity and its time', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    await user.click(within(sheet).getByRole('radio', { name: /Paseo por casa u oficina/ }));
    fireEvent.change(within(sheet).getByLabelText('Hora'), { target: { value: '16:00' } });
    expect(within(sheet).getByText('En horario de trabajo')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText(/Paseo por casa u oficina/)).toBeInTheDocument();
    expect(screen.getByText('16:00 · en horario de trabajo')).toBeInTheDocument();
  });

  it('warns about an activity outside the workday', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    fireEvent.change(within(sheet).getByLabelText('Hora'), { target: { value: '16:55' } });
    expect(within(sheet).getByRole('alert')).toHaveTextContent('Elige una hora dentro');
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('marks the day off', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Hoy no trabajo' }));
    const sheet = screen.getByRole('dialog', { name: '¿Hoy no trabajas?' });
    await user.click(within(sheet).getByRole('button', { name: 'Hoy no trabajo' }));

    expect(store().dayOverrides[MONDAY]).toMatchObject({ working: false });
    expect(screen.getByRole('heading', { name: 'Hoy no trabajas' })).toBeInTheDocument();
  });

  it('adjusts a day already under way', async () => {
    const first = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await first.user.click(startButton());
    first.unmount();
    const before = store().days[MONDAY]!.plan!;

    clock.travelTo(new Date(2026, 9, 5, 12, 0).getTime());
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    expect(screen.getByRole('heading', { level: 1, name: 'Ajusta tu día' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Añadir reunión' }));
    const sheet = screen.getByRole('dialog', { name: 'Añadir reunión' });
    setTime('Añadir reunión', 'Inicio', '15:00', sheet);
    setTime('Añadir reunión', 'Fin', '16:00', sheet);
    await user.click(within(sheet).getByRole('button', { name: 'Añadir' }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const after = store().days[MONDAY]!.plan!;
    expect(after.meetings).toHaveLength(1);
    // The morning is kept as it was.
    const noon = new Date(2026, 9, 5, 12, 0).getTime();
    const morning = (plan: typeof after) =>
      plan.activities.filter((item) => item.currentScheduledAt <= noon);
    expect(morning(after)).toEqual(morning(before));
    const ids = after.activities.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('saves nothing until "Empezar jornada"', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    setTime('Horario', 'Fin', '15:00');
    await user.click(screen.getByRole('button', { name: 'Añadir reunión' }));
    const sheet = screen.getByRole('dialog', { name: 'Añadir reunión' });
    await user.click(within(sheet).getByRole('button', { name: 'Añadir' }));
    await user.click(screen.getByRole('link', { name: 'Cerrar sin guardar' }));

    expect(store().days).toEqual({});
    expect(store().dayOverrides).toEqual({});
    expect(screen.getByRole('heading', { name: 'Tu jornada de hoy' })).toBeInTheDocument();
  });

  it('only offers activities the user has the equipment for', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    const offered = within(sheet)
      .getAllByRole('radio')
      .map((option) => option.querySelector('span span')?.textContent);
    const gearFree = CATALOG.mainActivities
      .filter((activity) => activity.equipment.length === 0)
      .map((activity) => activity.name.es);
    expect(offered).toEqual(gearFree);
    expect(offered).not.toContain('Trabajo de pie');
  });

  it('offers standing work only with a standing desk', async () => {
    store().updateSettings({ equipment: ['standing_desk'] });
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    expect(within(sheet).getByRole('radio', { name: /Trabajo de pie/ })).toBeInTheDocument();
  });

  it('says so when no gear is needed today', () => {
    renderWithRouter(<AppRoutes />, { route: '/day/start' });
    expect(screen.getByText('Hoy no necesitas preparar material.')).toBeInTheDocument();
    expect(screen.queryByText('A mano hoy')).not.toBeInTheDocument();
  });
});
