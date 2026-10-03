import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { ROUTES } from '@/app/routes';
import { ToastHost } from '@/app/ToastHost';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { atTime } from '@/domain/time';
import type { DateKey, DayPlan, HHmm, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { SAMPLE_DATE as MONDAY, sampleAt as at, sampleDay } from '@/test/sampleDay';

const TUESDAY: DateKey = '2026-10-06';
const store = () => useAppStore.getState();
const ids = { p0: `${MONDAY}:p0`, p1: `${MONDAY}:p1`, p2: `${MONDAY}:p2`, main: `${MONDAY}:main` };
const ui = (route: string = ROUTES.dayEnd) =>
  renderWithRouter(
    <>
      <AppRoutes />
      <ToastHost />
    </>,
    { route },
  );
/** The sample day with some activities done and others missed; the clock at `time`. */
function setUp(
  { done = [], missed = [] }: { done?: string[]; missed?: string[] },
  time: HHmm = '16:52',
) {
  const plan = sampleDay();
  const change = (item: ScheduledActivity): ScheduledActivity => {
    if (done.includes(item.id)) {
      return {
        ...item,
        status: 'completed',
        startedAt: at('10:00'),
        completedAt: at('10:01'),
        elapsedSec: item.kind === 'main' ? 1200 : 40,
        firstPrompt: true,
      };
    }
    if (missed.includes(item.id))
      return { ...item, status: 'missed', missReason: 'window_expired' };
    return item;
  };
  const day: DayPlan = { ...plan, activities: plan.activities.map(change) };
  store().startDay(day);
  clock.travelTo(at(time));
  // As the engine would have: pauses past their window are missed.
  store().reconcile(at(time));
}
const setTime = (group: string, field: 'Inicio' | 'Fin', value: string, root: HTMLElement) =>
  fireEvent.change(within(within(root).getByRole('group', { name: group })).getByLabelText(field), {
    target: { value },
  });

beforeEach(() => {
  store().completeOnboarding(DEFAULT_SETTINGS);
  useAppStore.setState({ onboardedAt: atTime('2026-10-02', '18:00') });
});
afterEach(() => clock.setOffset(0));

describe('end of the day on Today', () => {
  it('offers to close the day from 10 minutes before it ends', async () => {
    setUp({}, '16:40');
    ui('/');
    expect(screen.queryByRole('link', { name: 'Cerrar jornada' })).not.toBeInTheDocument();
    await act(() => clock.travelTo(at('16:51')));
    expect(screen.getByText('Tu jornada termina a las 17:00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cerrar jornada' })).toHaveAttribute(
      'href',
      ROUTES.dayEnd,
    );
  });
});

describe('Fin de jornada', () => {
  it('celebrates a perfect day with its XP and streak', () => {
    setUp({ done: [ids.p0, ids.p1, ids.p2, ids.main] });
    ui();
    expect(screen.getByRole('heading', { level: 1, name: 'Fin de jornada' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByText('¡Buen trabajo hoy!')).toBeInTheDocument();
    expect(screen.getByText('+300 XP')).toBeInTheDocument();
    expect(screen.getByText('¡Día perfecto!')).toBeInTheDocument();
    expect(screen.getByText('+200 día bueno · +100 día perfecto')).toBeInTheDocument();
    expect(screen.getByText('Objetivo diario completado')).toBeInTheDocument();
    expect(screen.getByText('¡Racha mantenida! 1 día seguido')).toBeInTheDocument();
    expect(screen.getByText('3/3 pausas')).toBeInTheDocument();
    expect(screen.getByText('Ninguna perdida')).toBeInTheDocument();
    expect(screen.getByText('3 a la primera')).toBeInTheDocument();
    expect(screen.getByText(/de movimiento con solo/)).toBeInTheDocument();
  });

  it('says what is missing, plainly', () => {
    // Closing early, before the 16:00 pause.
    setUp({ done: [ids.p0] }, '15:50');
    ui();
    expect(screen.getByText('Así ha ido tu día.')).toBeInTheDocument();
    expect(screen.getByText('Hoy te has movido menos de lo previsto')).toBeInTheDocument();
    expect(screen.getByText('Objetivo diario pendiente')).toBeInTheDocument();
    expect(
      screen.getByText('Te faltan 2 pausas · Te falta la actividad principal'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\+0 XP$/)).not.toBeInTheDocument();
    expect(screen.queryByText('0 aplazadas')).not.toBeInTheDocument();
    expect(screen.queryByText('0 a la primera')).not.toBeInTheDocument();
  });

  it('offers a short version of a pending main activity', async () => {
    setUp({ done: [ids.p0] });
    const { user } = ui();
    expect(screen.getByText('Tu actividad sigue pendiente')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Versión corta · 10 min' }));
    expect(screen.getByText('Continua · 10 min')).toBeInTheDocument();
    expect(
      store().days[MONDAY]!.plan!.activities.find((item) => item.id === ids.main)?.durationSec,
    ).toBe(600);
  });

  it('recovers one missed pause, then comes back to close', async () => {
    setUp({ done: [ids.p0, ids.p2, ids.main], missed: [ids.p1] });
    const { user } = ui();
    expect(screen.getByText('Hazla ahora: con ella, tu día será bueno.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Recuperar pausa' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    expect(screen.getByText('+100 pausa')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Fin de jornada' })).toBeInTheDocument();
    expect(screen.queryByText('Recupera una pausa')).not.toBeInTheDocument();
    expect(screen.getByText('Objetivo diario completado')).toBeInTheDocument();
    expect(screen.getByText('3/3 pausas')).toBeInTheDocument();
  });

  it('closes the day with the mood and the same hours tomorrow', async () => {
    setUp({ done: [ids.p0, ids.p1, ids.p2, ids.main] }, '17:05');
    const { user } = ui();
    expect(screen.getByText('¿Mañana tienes el mismo horario?')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Muy bien' }));
    await user.click(screen.getByRole('radio', { name: 'Sí' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));

    expect(store().days[MONDAY]).toMatchObject({
      status: 'closed',
      mood: 'great',
      nextDayDecision: 'repeat',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Jornada cerrada. ¡Hasta la próxima!');
    expect(screen.getByText('Día cerrado')).toBeInTheDocument();
    expect(screen.getByText('Día perfecto · 3/3 pausas · +300 XP')).toBeInTheDocument();
    // Usual hours: nothing to note on the calendar.
    expect(store().dayOverrides).toEqual({});
  });

  it('changes the next workday’s hours only', async () => {
    setUp({}, '17:05');
    const { user } = ui();
    await user.click(screen.getByRole('radio', { name: 'Cambiar' }));
    const sheet = screen.getByRole('dialog', { name: 'Horario del martes' });
    setTime('Horario', 'Fin', '15:00', sheet);
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    expect(
      screen.getByRole('button', { name: 'Horario del martes: 09:00–15:00' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));
    expect(store().dayOverrides[TUESDAY]).toMatchObject({
      working: true,
      schedule: { workEnd: '15:00' },
    });
    expect(store().settings.schedule.workEnd).toBe('17:00');
  });

  it('skips the days off until the chosen workday', async () => {
    setUp({}, '17:05');
    const { user } = ui();
    await user.click(screen.getByRole('radio', { name: 'No trabajo' }));
    const back = screen.getByRole('radiogroup', { name: '¿Cuándo vuelves?' });
    expect(within(back).getByRole('radio', { name: 'mié 7' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(within(back).getByRole('radio', { name: 'jue 8' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));

    expect(store().dayOverrides[TUESDAY]).toMatchObject({ working: false });
    expect(store().dayOverrides['2026-10-07' as DateKey]).toMatchObject({ working: false });
    expect(store().dayOverrides['2026-10-08' as DateKey]).toBeUndefined();
  });

  it('asks before closing ahead of time, saying what is left', async () => {
    setUp({ done: [ids.p0] }, '15:50');
    const { user } = ui();
    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));
    const sheet = screen.getByRole('dialog', { name: '¿Cerrar ya la jornada?' });
    expect(sheet).toHaveTextContent('Quedan 1 h 10 min de jornada.');
    expect(sheet).toHaveTextContent('Aún tienes 1 pausa por hacer.');
    expect(sheet).toHaveTextContent('Tu actividad principal sigue pendiente.');
    expect(sheet).toHaveTextContent('Lo que quede pendiente no contará para hoy.');

    await user.click(within(sheet).getByRole('button', { name: 'Seguir con la jornada' }));
    expect(store().days[MONDAY]?.status).toBe('active');

    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar jornada' }),
    );
    expect(store().days[MONDAY]?.status).toBe('closed');
    // Not a good day: just the facts.
    expect(screen.getByText('1/3 pausas · +0 XP')).toBeInTheDocument();
  });

  it('only offers a short version the activity declares', () => {
    store().completeOnboarding(DEFAULT_SETTINGS);
    const plan = sampleDay();
    store().startDay({
      ...plan,
      activities: plan.activities.map((item) =>
        item.kind === 'main'
          ? { ...item, content: { kind: 'main', activityId: 'walk_indoors' }, durationSec: 600 }
          : item,
      ),
    });
    clock.travelTo(at('16:52'));
    ui();
    expect(screen.getByText('Tu actividad sigue pendiente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Versión corta/ })).not.toBeInTheDocument();
  });

  it('recounts the whole day after a recovery that makes it good', async () => {
    // Four pauses: two and the walk done, two missed. One more is 3 of 4 (75 %).
    const plan = sampleDay();
    const extra = {
      ...plan.activities[0]!,
      id: `${MONDAY}:p3`,
      scheduledAt: at('15:30'),
      currentScheduledAt: at('15:30'),
    };
    store().startDay({
      ...plan,
      targetMicroCount: 4,
      activities: [...plan.activities, extra].map((item): ScheduledActivity => {
        if ([ids.p0, ids.p2, ids.main].includes(item.id)) {
          return { ...item, status: 'completed', startedAt: at('10:00'), completedAt: at('10:01') };
        }
        if ([ids.p1, `${MONDAY}:p3`].includes(item.id)) {
          return { ...item, status: 'missed', missReason: 'window_expired' };
        }
        return item;
      }),
    });
    clock.travelTo(at('17:05'));
    const { user } = ui();
    expect(screen.getByText('Objetivo diario pendiente')).toBeInTheDocument();
    expect(screen.getByText('Hazla ahora: con ella, tu día será bueno.')).toBeInTheDocument();
    expect(screen.getByText('2/4 pausas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Recuperar pausa' }));
    await user.click(screen.getByRole('button', { name: 'Hecho' }));
    await user.click(screen.getByRole('button', { name: 'Volver a lo mío' }));

    // Everything recounted: goal, verdict, closing XP, tiles and streak.
    expect(screen.getByText('Objetivo diario completado')).toBeInTheDocument();
    expect(screen.getByText('¡Día bueno!')).toBeInTheDocument();
    expect(screen.getByText('+200 día bueno')).toBeInTheDocument();
    expect(screen.getByText('+300 XP')).toBeInTheDocument();
    expect(screen.getByText('3/4 pausas')).toBeInTheDocument();
    expect(screen.getByText('1 perdida')).toBeInTheDocument();
    expect(screen.getByText('¡Racha mantenida! 1 día seguido')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar jornada' }));
    expect(store().days[MONDAY]?.summary).toMatchObject({
      isGood: true,
      isPerfect: false,
      completed: 3,
      missed: 1,
      xp: 300,
    });
    expect(
      store()
        .xpLedger.map((entry) => entry.key)
        .sort(),
    ).toEqual([`good:${MONDAY}`, `micro:${MONDAY}:p3`].sort());
    expect(screen.getByText('Día bueno · 3/4 pausas · +300 XP')).toBeInTheDocument();
  });
});
