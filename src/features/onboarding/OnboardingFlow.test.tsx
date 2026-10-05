import { act, fireEvent, screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { CATALOG } from '@/content/catalog';
import type { UserSettings } from '@/domain/types';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { readOnboardingDraft } from './draftStorage';

/** A browser Notification API with a fixed permission and the answer to the prompt. */
function stubNotifications(
  permission: NotificationPermission,
  answer: NotificationPermission = permission,
) {
  const requestPermission = vi.fn(async () => answer);
  vi.stubGlobal('Notification', { permission, requestPermission });
  return requestPermission;
}

const nextButton = () => screen.getByRole('button', { name: 'Siguiente' });
const next = (user: UserEvent) => user.click(nextButton());

/** Sets a time inside a labelled group of fields ("Horario", "Descanso habitual"…). */
function setTime(group: string, field: 'Inicio' | 'Fin', value: string) {
  const fields = within(screen.getByRole('group', { name: group }));
  fireEvent.change(fields.getByLabelText(field), { target: { value } });
}

const draft = (): UserSettings => readOnboardingDraft()!;

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('onboarding', () => {
  it('walks the six steps and saves the settings only on "Empezar"', async () => {
    stubNotifications('default');
    const { user } = renderWithRouter(<AppRoutes />, { route: '/' });

    // 1. Welcome
    await user.click(screen.getByRole('button', { name: 'Comenzar' }));

    // 2. Workday
    expect(screen.getByRole('heading', { level: 1, name: 'Tu jornada' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'sábado' }));
    setTime('Horario', 'Fin', '18:00');
    setTime('Descanso habitual', 'Fin', '11:30');
    await next(user);

    // 3. Discomfort
    expect(screen.getByRole('heading', { level: 1, name: 'Tus molestias' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: 'Hombros' }), { target: { value: '2' } });
    fireEvent.change(screen.getByRole('slider', { name: 'Cuello' }), { target: { value: '4' } });
    await next(user);

    // 4. Equipment
    expect(screen.getByRole('heading', { level: 1, name: 'Tu material' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Mancuernas/ }));
    await next(user);

    // 5. Pace
    expect(screen.getByRole('heading', { level: 1, name: 'Tu ritmo' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Activo' }));
    expect(screen.getByText('Al día, con tu horario de 09:00 a 18:00')).toBeInTheDocument();
    await next(user);

    // 6. Summary
    expect(screen.getByRole('heading', { level: 1, name: 'Todo listo' })).toBeInTheDocument();
    expect(screen.getByText('lun · mar · mié · jue · vie · sáb')).toBeInTheDocument();
    expect(screen.getByText('09:00–18:00')).toBeInTheDocument();
    expect(screen.getByText('Descanso 11:00–11:30')).toBeInTheDocument();
    // Most bothersome first, each with its value.
    const areas = screen.getByText('Molestias prioritarias').closest('section')!;
    expect(
      within(areas)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Cuello4nivel 4 de 5', 'Hombros2nivel 2 de 5']);
    expect(screen.getByText('Mancuernas')).toBeInTheDocument();
    expect(screen.getByText(/^Activo · \d+ pausas previstas · ~\d+ min$/)).toBeInTheDocument();
    expect(useAppStore.getState().onboardedAt).toBeUndefined();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));

    const state = useAppStore.getState();
    expect(state.onboardedAt).toBeDefined();
    expect(state.settings).toMatchObject({
      workDays: [1, 2, 3, 4, 5, 6],
      schedule: {
        workStart: '09:00',
        workEnd: '18:00',
        breaks: [{ start: '11:00', durationMin: 30 }],
        lunch: { start: '14:00', durationMin: 60 },
      },
      discomfort: { neck: 4 },
      equipment: ['dumbbells'],
      intensity: 'active',
      notifications: { enabled: false },
    });
    expect(readOnboardingDraft()).toBeNull();
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the draft across a reload until it is saved', async () => {
    const first = renderWithRouter(<AppRoutes />, { route: '/onboarding/schedule' });
    setTime('Horario', 'Inicio', '08:00');
    first.unmount();

    renderWithRouter(<AppRoutes />, { route: '/onboarding/summary' });
    expect(screen.getByText('08:00–17:00')).toBeInTheDocument();
  });

  it('links each summary section back to its step', () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/summary' });
    expect(screen.getByRole('link', { name: 'Editar: Jornada' })).toHaveAttribute(
      'href',
      '/onboarding/schedule',
    );
    expect(screen.getByRole('link', { name: 'Editar: Ritmo' })).toHaveAttribute(
      'href',
      '/onboarding/intensity',
    );
  });
});

describe('onboarding: workday', () => {
  beforeEach(() => renderWithRouter(<AppRoutes />, { route: '/onboarding/schedule' }));

  it('edits break and lunch as start and end, storing a duration', () => {
    setTime('Descanso habitual', 'Inicio', '10:30');
    setTime('Comida', 'Fin', '14:45');
    expect(draft().schedule).toMatchObject({
      breaks: [{ start: '10:30', durationMin: 45 }],
      lunch: { start: '14:00', durationMin: 45 },
    });
  });

  it('blocks Next while a block ends before it starts', () => {
    setTime('Descanso habitual', 'Fin', '10:45');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El descanso debe terminar después de empezar.',
    );
    expect(nextButton()).toBeDisabled();

    setTime('Descanso habitual', 'Fin', '11:20');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
  });

  it('reports blocks outside the workday and overlaps', () => {
    setTime('Comida', 'Inicio', '11:00');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El descanso y la comida no pueden coincidir.',
    );
    setTime('Comida', 'Inicio', '14:00');
    setTime('Comida', 'Fin', '17:30');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'La comida debe estar dentro de tu jornada.',
    );
    expect(nextButton()).toBeDisabled();
  });

  it('does not accept a workday that crosses midnight', () => {
    setTime('Horario', 'Fin', '02:00');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'La jornada debe terminar después de empezar.',
    );
    expect(nextButton()).toBeDisabled();
  });

  it('keeps a cleared time empty without losing the other one', () => {
    setTime('Descanso habitual', 'Inicio', '');
    const fields = within(screen.getByRole('group', { name: 'Descanso habitual' }));
    expect(fields.getByLabelText('Fin')).toHaveValue('11:15');
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa las horas.');
  });

  it('switches the break off and back on, restoring its times', async () => {
    setTime('Descanso habitual', 'Fin', '11:30');
    fireEvent.click(screen.getByRole('switch', { name: 'Descanso habitual' }));
    expect(screen.queryByRole('group', { name: 'Descanso habitual' })).not.toBeInTheDocument();
    expect(draft().schedule.breaks).toEqual([]);

    await act(async () => {
      fireEvent.click(screen.getByRole('switch', { name: 'Descanso habitual' }));
    });
    expect(draft().schedule.breaks).toEqual([{ start: '11:00', durationMin: 30 }]);
  });

  it('needs at least one workday', () => {
    for (const day of ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']) {
      fireEvent.click(screen.getByRole('button', { name: day }));
    }
    expect(screen.getByRole('alert')).toHaveTextContent('Elige al menos un día de trabajo.');
    expect(nextButton()).toBeDisabled();
  });
});

describe('onboarding: discomfort', () => {
  it("rates exactly the catalog's areas, from 0 to 5", () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/discomfort' });
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(CATALOG.areas.length);
    CATALOG.areas.forEach((area, index) => {
      expect(sliders[index]).toHaveAccessibleName(area.name.es);
    });
    for (const slider of sliders) {
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '5');
      expect(slider).toHaveValue('0');
    }
    expect(screen.queryByRole('slider', { name: 'Tiempo sentado' })).not.toBeInTheDocument();
  });
});

describe('onboarding: equipment', () => {
  it("lists exactly the catalog's equipment, with its name and hint", () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/equipment' });
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(CATALOG.equipment.length);
    CATALOG.equipment.forEach((item, index) => {
      expect(boxes[index]).toHaveAccessibleName(`${item.name.es}${item.hint.es}`);
    });
    expect(screen.getByRole('checkbox', { name: /Banda elástica/ })).toBeInTheDocument();
  });

  it('has no "none" option: nothing ticked is an empty list', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: '/onboarding/equipment' });
    expect(screen.queryByRole('checkbox', { name: /Ninguno/ })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Si no tienes nada, déjalo así: Breakbit funciona igual de bien sin material.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Esterilla/ }));
    await user.click(screen.getByRole('checkbox', { name: /Kettlebell/ }));
    expect(draft().equipment).toEqual(['mat', 'kettlebell']);

    await user.click(screen.getByRole('checkbox', { name: /Esterilla/ }));
    await user.click(screen.getByRole('checkbox', { name: /Kettlebell/ }));
    expect(draft().equipment).toEqual([]);
  });

  it('shows an empty selection in the summary as gear-free moves', () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/summary' });
    expect(
      screen.getByText('Nada extra: tus pausas serán movimientos suaves sin material.'),
    ).toBeInTheDocument();
  });
});

describe('onboarding: notifications', () => {
  const route = '/onboarding/summary';

  it('asks the browser only after "Activar notificaciones"', async () => {
    const requestPermission = stubNotifications('default', 'granted');
    const { user } = renderWithRouter(<AppRoutes />, { route });
    expect(requestPermission).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Activar notificaciones' }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Notificaciones activadas')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Activar notificaciones' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(useAppStore.getState().settings.notifications.enabled).toBe(true);
  });

  it('keeps offering the button when the prompt is dismissed', async () => {
    stubNotifications('default', 'default');
    const { user } = renderWithRouter(<AppRoutes />, { route });
    await user.click(screen.getByRole('button', { name: 'Activar notificaciones' }));
    expect(screen.getByRole('button', { name: 'Activar notificaciones' })).toBeInTheDocument();
  });

  it('explains how to unblock them, without asking again, and lets the user start', async () => {
    const requestPermission = stubNotifications('denied');
    const { user } = renderWithRouter(<AppRoutes />, { route });

    expect(
      screen.queryByRole('button', { name: 'Activar notificaciones' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Las notificaciones están bloqueadas en este navegador.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Actívalas en los ajustes del navegador/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(requestPermission).not.toHaveBeenCalled();
    expect(useAppStore.getState().onboardedAt).toBeDefined();
    expect(useAppStore.getState().settings.notifications.enabled).toBe(false);
  });

  it('notices a permission granted from the browser settings', async () => {
    stubNotifications('denied');
    renderWithRouter(<AppRoutes />, { route });
    stubNotifications('granted');
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(screen.getByText('Notificaciones activadas')).toBeInTheDocument();
  });

  it('says so when the browser has no notifications', () => {
    renderWithRouter(<AppRoutes />, { route });
    expect(
      screen.getByText('Este navegador no permite avisos. Verás tus pausas al abrir Breakbit.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Activar notificaciones' }),
    ).not.toBeInTheDocument();
  });
});
