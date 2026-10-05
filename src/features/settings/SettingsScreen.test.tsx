import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { ROUTES, settingsPath } from '@/app/routes';
import { ToastHost } from '@/app/ToastHost';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { clock } from '@/services/clock';
import { historyScenarioState } from '@/app/dev/historyScenario';
import { logEvent, readEvents, clearEvents } from '@/services/eventLog';
import { exportBackup, resetAllData } from '@/state/backup';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { SAMPLE_DATE, sampleAt, sampleDay } from '@/test/sampleDay';

const store = () => useAppStore.getState();
const ui = (route: string = ROUTES.settings) =>
  renderWithRouter(
    <>
      <AppRoutes />
      <ToastHost />
    </>,
    { route },
  );
const stubNotifications = (permission: NotificationPermission, answer = permission) => {
  const requestPermission = vi.fn(async () => answer);
  vi.stubGlobal('Notification', { permission, requestPermission });
  return requestPermission;
};

beforeEach(async () => {
  await clearEvents();
  store().completeOnboarding(DEFAULT_SETTINGS);
  stubNotifications('default');
});
afterEach(() => {
  clock.setOffset(0);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Settings', () => {
  it('sums up the profile as in the onboarding summary, each part opening its editor', () => {
    ui();
    expect(screen.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument();
    const section = (name: string) => screen.getByRole('heading', { name }).closest('section')!;
    const editLink = (name: string) =>
      within(section(name)).getByRole('link', { name: `Editar ${name}` });

    expect(section('Jornada habitual')).toHaveTextContent('lun · mar · mié · jue · vie');
    expect(section('Jornada habitual')).toHaveTextContent('09:00–17:00');
    expect(section('Jornada habitual')).toHaveTextContent('Descanso 11:00–11:15');
    expect(section('Jornada habitual')).toHaveTextContent('Comida 14:00–15:00');
    expect(editLink('Jornada habitual')).toHaveAttribute('href', settingsPath('schedule'));

    expect(section('Molestias prioritarias')).toHaveTextContent(
      'Ninguna en especial: pausas variadas',
    );
    expect(editLink('Molestias prioritarias')).toHaveAttribute('href', settingsPath('discomfort'));

    expect(section('Equipamiento disponible')).toHaveTextContent(
      'Sin material: movimientos suaves y caminar',
    );
    expect(editLink('Equipamiento disponible')).toHaveAttribute('href', settingsPath('equipment'));

    expect(section('Intensidad')).toHaveTextContent(/Normal · \d+ pausas previstas · ~\d+ min/);
    expect(editLink('Intensidad')).toHaveAttribute('href', settingsPath('intensity'));
  });

  it('shows the rated areas as in the onboarding summary: icon, name and value', () => {
    store().updateSettings({ discomfort: { neck: 2, lower_back: 4 } });
    ui();
    const discomfort = screen
      .getByRole('heading', { name: 'Molestias prioritarias' })
      .closest('section')!;
    const tags = within(discomfort).getAllByRole('listitem');
    // Most bothersome first.
    expect(tags.map((tag) => tag.textContent)).toEqual([
      'Zona lumbar4nivel 4 de 5',
      'Cuello2nivel 2 de 5',
    ]);
  });

  it('edits the usual workday from the next one on, leaving today as it is', async () => {
    store().startDay(sampleDay());
    clock.travelTo(sampleAt('09:30'));
    const today = store().days[SAMPLE_DATE]!.plan;
    const { user } = ui(settingsPath('schedule'));
    expect(
      screen.getByText(
        'Se aplica desde tu próxima jornada; hoy mantienes el horario que confirmaste.',
      ),
    ).toBeInTheDocument();
    const hours = screen.getByRole('group', { name: 'Horario' });
    fireEvent.change(within(hours).getByLabelText('Fin'), { target: { value: '15:00' } });
    await user.click(screen.getByRole('button', { name: 'domingo' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(store().settings.schedule.workEnd).toBe('15:00');
    expect(store().settings.workDays).toContain(7);
    expect(store().days[SAMPLE_DATE]!.plan).toBe(today);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cambios guardados. Se aplican desde tu próxima jornada.',
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument();
  });

  it('says the hours apply from the next workday started when today has not started', () => {
    ui(settingsPath('schedule'));
    expect(
      screen.getByText(
        'Se aplicará a tus próximas jornadas, empezando por la siguiente que inicies.',
      ),
    ).toBeInTheDocument();
  });

  it('does not save invalid hours, nor anything on cancel', async () => {
    const { user } = ui(settingsPath('schedule'));
    const hours = screen.getByRole('group', { name: 'Horario' });
    fireEvent.change(within(hours).getByLabelText('Fin'), { target: { value: '08:00' } });
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(store().settings.schedule.workEnd).toBe('17:00');
  });

  it('re-plans what is left of today when the pauses should change', async () => {
    store().startDay(sampleDay());
    clock.travelTo(sampleAt('09:30'));
    const before = store().days[SAMPLE_DATE]!.plan;
    const { user } = ui(settingsPath('discomfort'));
    fireEvent.change(screen.getByRole('slider', { name: 'Cuello' }), { target: { value: '5' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(store().settings.discomfort.neck).toBe(5);
    expect(store().days[SAMPLE_DATE]!.plan).not.toBe(before);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cambios guardados. Tus pausas de hoy se han ajustado.',
    );
  });

  it('swaps a main activity whose equipment is gone for one that still fits', async () => {
    store().updateSettings({ equipment: ['kettlebell'] });
    const plan = sampleDay();
    store().startDay({
      ...plan,
      activities: plan.activities.map((item) =>
        item.kind === 'main'
          ? { ...item, content: { kind: 'main', activityId: 'kettlebell_block' }, durationSec: 600 }
          : item,
      ),
    });
    clock.travelTo(sampleAt('09:30'));
    const { user } = ui(settingsPath('equipment'));
    await user.click(screen.getByRole('checkbox', { name: /Kettlebell/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    const main = store().days[SAMPLE_DATE]!.plan!.activities.find((item) => item.kind === 'main');
    expect(main?.content).not.toEqual({ kind: 'main', activityId: 'kettlebell_block' });
    expect(main?.content.kind).toBe('main');
    expect(screen.getByRole('status')).toHaveTextContent('Tus pausas de hoy se han ajustado.');
  });

  it('saves equipment and pace', async () => {
    const { user } = ui(settingsPath('equipment'));
    await user.click(screen.getByRole('checkbox', { name: /Esterilla/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(store().settings.equipment).toEqual(['mat']);
    expect(screen.getByText('Esterilla')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Intensidad/ }));
    await user.click(screen.getByRole('radio', { name: 'Activo' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(store().settings.intensity).toBe('active');
  });

  it('changes appearance and language at once', async () => {
    const { user } = ui();
    await user.click(screen.getByRole('radio', { name: 'Oscuro' }));
    expect(store().prefs.theme).toBe('dark');
    await user.click(screen.getByRole('radio', { name: 'English' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
  });
});

describe('Settings notifications', () => {
  it('asks for permission only when tapped, then shows each reminder', async () => {
    useAppStore.setState((state) => ({
      settings: {
        ...state.settings,
        notifications: { ...state.settings.notifications, enabled: false },
      },
    }));
    const request = stubNotifications('default', 'granted');
    const { user } = ui();
    expect(request).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Activar notificaciones' }));
    expect(request).toHaveBeenCalledOnce();
    expect(store().settings.notifications.enabled).toBe(true);

    await user.click(screen.getByRole('switch', { name: 'Pausas y actividad principal' }));
    expect(store().settings.notifications.microbreaks).toBe(false);
    expect(screen.getByRole('switch', { name: 'Fin de jornada' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('explains how to turn them on when blocked', () => {
    stubNotifications('denied');
    ui();
    expect(
      screen.getByText(/Permítelas en la configuración de este sitio y vuelve aquí/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});

describe('Settings data', () => {
  it('exports a backup file', async () => {
    // jsdom has no object URLs: a stand-in for the test only.
    const createObjectURL = vi.fn(() => 'blob:breakbit');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      const { user } = ui();
      await user.click(screen.getByRole('button', { name: /Exportar copia/ }));
      // The events are read first: the download comes a moment later.
      expect(await screen.findByRole('status')).toHaveTextContent('Copia descargada.');
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(click).toHaveBeenCalledOnce();
    } finally {
      Reflect.deleteProperty(URL, 'createObjectURL');
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    }
  });

  it('imports a backup after checking it and asking, XP and events included', async () => {
    store().replaceData(historyScenarioState(store()));
    await logEvent('exercise_completed', { at: sampleAt('10:00'), activityId: 'p0' });
    const ledger = store().xpLedger;
    const events = await readEvents();
    const backup = await exportBackup();
    await resetAllData();
    store().completeOnboarding(DEFAULT_SETTINGS);
    backup.state = { ...backup.state, settings: { ...backup.state.settings, intensity: 'soft' } };
    const file = new File([JSON.stringify(backup)], 'copia.json', { type: 'application/json' });
    const { user } = ui();
    await user.upload(screen.getByLabelText('Importar copia', { selector: 'input' }), file);
    const sheet = await screen.findByRole('dialog', { name: '¿Importar esta copia?' });
    expect(store().settings.intensity).toBe('normal');
    await user.click(within(sheet).getByRole('button', { name: 'Importar' }));
    expect(await screen.findByText('Copia importada.')).toBeInTheDocument();
    expect(store().settings.intensity).toBe('soft');
    expect(store().xpLedger).toEqual(ledger);
    expect(await readEvents()).toEqual(events);
  });

  it('refuses a file that is not a backup', async () => {
    const file = new File(['{"hello":1}'], 'otro.json', { type: 'application/json' });
    const { user } = ui();
    await user.upload(screen.getByLabelText('Importar copia', { selector: 'input' }), file);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ese archivo no es una copia válida de Breakbit.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes everything after asking, keeping theme and language, back to the welcome', async () => {
    store().setTheme('dark');
    store().setLocale('en');
    store().replaceData({ ...historyScenarioState(store()) });
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: /Delete all data/ }));
    const sheet = screen.getByRole('dialog', { name: 'Delete all data?' });
    await user.click(within(sheet).getByRole('button', { name: 'Delete everything' }));
    expect(await screen.findByRole('button', { name: 'Get started' })).toBeInTheDocument();
    expect(store().onboardedAt).toBeUndefined();
    expect(store().days).toEqual({});
    expect(store().xpLedger).toEqual([]);
    expect(store().prefs).toEqual({ theme: 'dark', locale: 'en' });
  });

  it('deletes everything in Spanish too', async () => {
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: /Borrar todos los datos/ }));
    const sheet = screen.getByRole('dialog', { name: '¿Borrar todos los datos?' });
    await user.click(within(sheet).getByRole('button', { name: 'Borrar todo' }));
    expect(await screen.findByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
    expect(store().onboardedAt).toBeUndefined();
  });

  it('says what Breakbit is, and is not', async () => {
    const { user } = ui();
    await user.click(screen.getByRole('link', { name: 'Acerca de Breakbit' }));
    expect(screen.getByText('Versión 0.1.0')).toBeInTheDocument();
    expect(screen.getByText(/No es una herramienta médica/)).toBeInTheDocument();
    expect(screen.getByText(/no hay cuentas, ni servidor/)).toBeInTheDocument();
  });
});
