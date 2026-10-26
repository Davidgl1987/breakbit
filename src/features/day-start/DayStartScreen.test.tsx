import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { CATALOG } from '@/content/catalog';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { planDay } from '@/domain/day/planDay';
import { equipmentInPlan } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan } from '@/domain/types';
import { EquipmentTodayCard } from '@/features/day/EquipmentTodayCard';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { sampleDay } from '@/test/sampleDay';

const MONDAY: DateKey = '2026-10-05';
const store = () => useAppStore.getState();
const startButton = () => screen.getByRole('button', { name: 'Empezar jornada' });
const gearCard = () =>
  screen.getByRole('heading', { level: 3, name: 'Material de hoy' }).closest('section')!;

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
    expect(screen.getByRole('heading', { name: 'Todo listo para hoy' })).toBeInTheDocument();
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
    fireEvent.change(within(sheet).getByLabelText('Hora'), {
      target: { value: '16:00' },
    });
    expect(within(sheet).getByText('En horario de trabajo')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText(/Paseo por casa u oficina/)).toBeInTheDocument();
    expect(screen.getByText(/16:00 · en horario de trabajo/)).toBeInTheDocument();
  });

  it('warns about an activity outside the workday', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    fireEvent.change(within(sheet).getByLabelText('Hora'), {
      target: { value: '16:55' },
    });
    expect(within(sheet).getByRole('alert')).toHaveTextContent('Elige una hora dentro');
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('keeps the preparation focused on the plan, without avatar or day-off action', () => {
    renderWithRouter(<AppRoutes />, { route: '/day/start' });
    expect(screen.queryByRole('button', { name: 'Hoy no trabajo' })).not.toBeInTheDocument();
    expect(document.querySelector('img[src*="avatar/"]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar' })).toBeInTheDocument();
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

  it('rebuilds an untouched future-dated plan when saving the same hours at the actual time', async () => {
    clock.travelTo(atTime(MONDAY, '10:09'));
    store().startDay(
      planDay({
        date: MONDAY,
        schedule: DEFAULT_SETTINGS.schedule,
        settings: DEFAULT_SETTINGS,
        catalog: CATALOG,
        now: clock.now(),
      }),
    );
    const future = store().days[MONDAY]!;
    const ledger = store().xpLedger;
    clock.travelTo(atTime(MONDAY, '08:26'));
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const saved = store().days[MONDAY]!;
    expect(saved.openedAt).toBeLessThan(future.openedAt!);
    expect(saved.openedAt).toBeLessThanOrEqual(clock.now());
    expect(saved.plan!.schedule).toEqual(future.plan!.schedule);
    expect(saved.plan!.activities.filter((item) => item.kind === 'micro')).toHaveLength(5);
    expect(
      saved.plan!.activities.some((item) => item.currentScheduledAt < atTime(MONDAY, '10:09')),
    ).toBe(true);
    expect(store().xpLedger).toEqual(ledger);
    expect(screen.getByRole('heading', { name: 'Todo listo para hoy' })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: 'Tu día empieza aquí' })).toBeInTheDocument();
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

  it("shows the equipment the plan uses, and offers all of the user's to change it", async () => {
    store().updateSettings({ equipment: ['resistance_band', 'mat', 'kettlebell'] });
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    const proposed = within(gearCard()).getByRole('strong').textContent;

    await user.click(screen.getByRole('button', { name: 'Cambiar material de hoy' }));
    const sheet = screen.getByRole('dialog', { name: 'Material de hoy' });
    const boxes = within(sheet).getAllByRole('checkbox');
    // All of the user's equipment, ticked as the plan uses it.
    expect(boxes).toHaveLength(3);
    const ticked = boxes
      .filter((box) => (box as HTMLInputElement).checked)
      .map(
        (box) =>
          CATALOG.equipment.find((item) =>
            box.closest('label')?.textContent?.includes(item.name.es),
          )!.name.es,
      );
    expect(ticked.length > 0 ? ticked.join(', ') : 'Sin material').toBe(proposed);

    // Something else than the plan's proposal: only one piece it doesn't use.
    const owned = ['resistance_band', 'mat', 'kettlebell'];
    const target =
      CATALOG.equipment.find((item) => owned.includes(item.id) && !ticked.includes(item.name.es)) ??
      CATALOG.equipment.find((item) => item.id === 'kettlebell')!;
    for (const box of boxes) if ((box as HTMLInputElement).checked) await user.click(box);
    await user.click(within(sheet).getByRole('checkbox', { name: new RegExp(target.name.es) }));
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));

    // Chosen, so the plan uses it.
    expect(within(gearCard()).getByRole('strong')).toHaveTextContent(target.name.es);
    expect(within(gearCard()).getByText(/^Lo usarás/)).toBeInTheDocument();
    await user.click(startButton());
    const plan = store().days[MONDAY]!.plan!;
    expect(plan.equipment).toEqual([target.id]);
    expect(equipmentInPlan(plan, CATALOG)).toEqual([target.id]);
    // Only today: Settings keep the user's equipment.
    expect(store().settings.equipment).toEqual(owned);
  });

  it('replaces a chosen activity whose equipment is left out today', async () => {
    store().updateSettings({ equipment: ['resistance_band'] });
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    let sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    await user.click(within(sheet).getByRole('radio', { name: /Mini bloque con banda/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    expect(screen.getByText('Mini bloque con banda')).toBeInTheDocument();
    expect(within(gearCard()).getByRole('strong')).toHaveTextContent('Banda elástica');

    await user.click(screen.getByRole('button', { name: 'Cambiar material de hoy' }));
    sheet = screen.getByRole('dialog', { name: 'Material de hoy' });
    await user.click(within(sheet).getByRole('checkbox', { name: /Banda elástica/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    expect(within(gearCard()).getByRole('strong')).toHaveTextContent('Sin material');
    expect(screen.queryByText('Mini bloque con banda')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cambiar' }));
    sheet = screen.getByRole('dialog', { name: 'Actividad de hoy' });
    expect(within(sheet).queryByRole('radio', { name: /Mini bloque con banda/ })).toBeNull();
  });

  it('keeps the equipment chosen for the day when adjusting it', async () => {
    store().updateSettings({ equipment: ['resistance_band', 'mat'] });
    const first = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await first.user.click(screen.getByRole('button', { name: 'Cambiar material de hoy' }));
    const sheet = screen.getByRole('dialog', { name: 'Material de hoy' });
    for (const box of within(sheet).getAllByRole('checkbox')) {
      if ((box as HTMLInputElement).checked) await first.user.click(box);
    }
    await first.user.click(within(sheet).getByRole('checkbox', { name: /Esterilla/ }));
    await first.user.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    await first.user.click(startButton());
    first.unmount();
    expect(store().days[MONDAY]!.plan!.equipment).toEqual(['mat']);

    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    await user.click(screen.getByRole('button', { name: 'Cambiar material de hoy' }));
    const again = screen.getByRole('dialog', { name: 'Material de hoy' });
    expect(within(again).getByRole('checkbox', { name: /Banda elástica/ })).not.toBeChecked();
    expect(within(again).getByRole('checkbox', { name: /Esterilla/ })).toBeChecked();
  });

  it('says how to add equipment when the user has none', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/day/start' });
    expect(within(gearCard()).getByRole('strong')).toHaveTextContent('Sin material');
    expect(within(gearCard()).getByText('Movimientos sin material y caminar.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cambiar material de hoy' }));
    const sheet = screen.getByRole('dialog', { name: 'Material de hoy' });
    expect(within(sheet).getByText(/No tienes material en Ajustes/)).toBeInTheDocument();
    expect(within(sheet).queryByRole('checkbox')).toBeNull();
  });
});

describe("today's equipment card", () => {
  const withMat = (): DayPlan => {
    const plan = sampleDay();
    return {
      ...plan,
      activities: plan.activities.map((item) =>
        item.kind === 'main'
          ? { ...item, content: { kind: 'main', activityId: 'mat_mobility' } }
          : item,
      ),
    };
  };

  it('shows what the plan uses, and how often', () => {
    render(<EquipmentTodayCard plan={withMat()} used={['mat']} />);
    expect(screen.getByRole('strong')).toHaveTextContent('Esterilla');
    expect(screen.getByText('Lo usarás 1 vez hoy.')).toBeInTheDocument();
  });

  it('says which chosen piece found no room today', () => {
    render(<EquipmentTodayCard plan={sampleDay()} used={[]} chosen={['standing_desk']} />);
    expect(screen.getByRole('strong')).toHaveTextContent('Sin material');
    expect(screen.getByText('Hoy no hay sitio para: Escritorio elevable.')).toBeInTheDocument();
  });
});
