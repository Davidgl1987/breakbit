import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { weekPath } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { CATALOG } from '@/content/catalog';
import { generateDayPlan } from '@/domain/planner/generateDayPlan';
import { addDays, atTime } from '@/domain/time';
import type { DailySummary, DateKey, DayRecord, EvolutionPhase } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const store = () => useAppStore.getState();
const MONDAY = atTime('2026-10-12', '09:00');
/** Monday 5 – Friday 9 October with `good` good days; judged on Monday 12. */
function weekWith(good: number, phase: EvolutionPhase = 1) {
  const days: Partial<Record<DateKey, DayRecord>> = {};
  for (let i = 0; i < 5; i++) {
    const date = addDays('2026-10-05', i);
    days[date] = {
      date,
      status: 'closed',
      returnBonus: false,
      recoveryUsed: false,
      summary: {
        isGood: i < good,
        completed: 0,
        planned: 0,
        xp: 0,
      } as DailySummary,
    };
  }
  useAppStore.setState((state) => ({
    onboardedAt: atTime('2026-10-05', '08:00'),
    days,
    progress: { ...state.progress, evolutionPhase: phase },
  }));
  clock.travelTo(MONDAY);
  store().evaluateWeeks(MONDAY);
}

beforeEach(() => store().completeOnboarding(DEFAULT_SETTINGS));
afterEach(() => clock.setOffset(0));

function recordedExercises() {
  const date = '2026-10-05';
  const plan = generateDayPlan({
    date,
    schedule: DEFAULT_SETTINGS.schedule,
    settings: DEFAULT_SETTINGS,
    meetings: [],
    catalog: CATALOG,
  });
  const template = plan.activities.find((item) => item.kind === 'micro')!;
  const counts = { neck: 6, upper_back: 2, hips_legs: 12 };
  const activities = Object.entries(counts).flatMap(([area, count]) => {
    const exercise = CATALOG.exercises.find(
      (item) => item.areas.length === 1 && item.areas[0] === area,
    )!;
    return Array.from({ length: count }, (_, index) => ({
      ...template,
      id: `${date}:${area}:${index}`,
      status: 'completed' as const,
      content: { kind: 'exercises' as const, exerciseIds: [exercise.id] },
      durationSec: exercise.durationSec,
      elapsedSec: exercise.durationSec,
    }));
  });
  const pending = { ...activities[0]!, id: `${date}:pending`, status: 'pending' as const };
  useAppStore.setState((state) => ({
    settings: { ...state.settings, discomfort: { neck: 3, upper_back: 2, hips_legs: 3, eyes: 0 } },
    days: {
      ...state.days,
      [date]: { ...state.days[date]!, plan: { ...plan, activities: [...activities, pending] } },
    },
  }));
}

describe('weekly result', () => {
  it('is shown on Today until seen, and tells how the avatar evolved', async () => {
    weekWith(4);
    const { user } = renderWithRouter(<AppRoutes />, { route: '/' });
    expect(screen.getByText('¡Semana buena!')).toBeInTheDocument();
    expect(screen.getByText('4 de 5 días buenos')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ver mi semana' }));

    expect(screen.getByRole('heading', { level: 1, name: '¡Una fase más!' })).toBeInTheDocument();
    expect(screen.getByText('Tu avatar evoluciona a Erguido.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar anterior: Encorvado' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar actual: Erguido' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Tu evolución' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ver fases' }));
    const strip = screen.getByRole('list', { name: 'Tu evolución' });
    expect(within(strip).getByRole('listitem', { current: 'step' })).toHaveTextContent('Erguido');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Tu plan de hoy' })).toBeInTheDocument();
    expect(screen.queryByText('¡Semana buena!')).not.toBeInTheDocument();
    expect(store().progress.lastSeenWeek).toBe('2026-W41');
  });

  it('says a weaker week plainly, without punishing below the first phase', () => {
    weekWith(1);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Volvemos a coger ritmo',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 de 5')).toBeInTheDocument();
    expect(screen.getByText('Tu avatar sigue en Encorvado.')).toBeInTheDocument();
  });

  it('says when a weaker week takes the avatar back a phase', () => {
    weekWith(1, 3);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    expect(
      screen.getByText('Tu avatar vuelve a Erguido. Con una semana buena, lo recupera.'),
    ).toBeInTheDocument();
  });

  it('brings a new room item at the top phase', () => {
    weekWith(5, 5);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    expect(screen.getByText('Tu avatar sigue en su mejor fase: Optimizado.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tu habitación crece' }),
    ).toBeInTheDocument();
    const room = screen.getByRole('list', { name: 'Tu habitación' });
    const fresh = within(room).getByRole('img', { name: 'Planta' }).closest('li')!;
    expect(fresh).toHaveTextContent('Nuevo');
  });

  it('sends unknown weeks back to Today', () => {
    weekWith(4);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W01') });
    expect(screen.getByRole('heading', { level: 1, name: 'Tu plan de hoy' })).toBeInTheDocument();
  });

  it('allows continuing without reviewing and closing keeps the weekly result available', async () => {
    weekWith(4);
    const { user } = renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    await user.click(screen.getByRole('link', { name: 'Cerrar' }));
    expect(store().progress.lastSeenWeek).toBeUndefined();
    expect(screen.getByRole('link', { name: 'Ver mi semana' })).toBeInTheDocument();
  });

  it('does not prompt again for historical or already seen weeks', () => {
    weekWith(4);
    store().markWeekSeen('2026-W41');
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    expect(screen.queryByRole('button', { name: 'Revisar molestias' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver fases' })).toBeInTheDocument();
  });

  it('keeps manual changes in a draft until saving, preserving today, XP and evolution', async () => {
    weekWith(4);
    const plan = generateDayPlan({
      date: '2026-10-12',
      schedule: DEFAULT_SETTINGS.schedule,
      settings: DEFAULT_SETTINGS,
      meetings: [],
      catalog: CATALOG,
    });
    useAppStore.setState((state) => ({
      days: {
        ...state.days,
        '2026-10-12': {
          date: '2026-10-12',
          status: 'active',
          returnBonus: false,
          recoveryUsed: false,
          plan,
        },
      },
    }));
    const before = store();
    const { user } = renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Cuello' }), { target: { value: '5' } });
    expect(store().settings.discomfort).toBe(before.settings.discomfort);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(store().settings.discomfort).toBe(before.settings.discomfort);
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Cuello' }), { target: { value: '5' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(store().settings.discomfort.neck).toBe(5);
    expect(store().days['2026-10-12']?.plan).toBe(plan);
    expect(store().xpLedger).toBe(before.xpLedger);
    expect(store().progress).toBe(before.progress);
    expect(screen.getByRole('status')).toHaveTextContent('próximas jornadas');
  });

  it('previews recorded exercise counts, applies once and saves only on confirmation', async () => {
    weekWith(4);
    recordedExercises();
    const { user } = renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    const rows = within(screen.getByRole('dialog')).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Espalda alta2 ejercicios · menos trabajada2 → 3');
    expect(rows[1]).toHaveTextContent('Cadera y piernas12 ejercicios · más trabajada3 → 2');
    expect(store().settings.discomfort.upper_back).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Aplicar propuesta' }));
    expect(screen.getByRole('slider', { name: 'Espalda alta' })).toHaveValue('3');
    expect(screen.getByRole('slider', { name: 'Cadera y piernas' })).toHaveValue('2');
    expect(screen.getByRole('slider', { name: 'Vista' })).toHaveValue('0');
    expect(store().settings.discomfort.hips_legs).toBe(3);
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    expect(screen.queryByRole('button', { name: 'Aplicar propuesta' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(store().settings.discomfort).toMatchObject({ upper_back: 3, hips_legs: 2, eyes: 0 });
    expect(store().progress.weeklyResults[0]?.prioritiesRebalanced).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    expect(screen.queryByRole('button', { name: 'Aplicar propuesta' })).not.toBeInTheDocument();
  });

  it('discards an applied draft on Escape and leaves the suggestion available', async () => {
    weekWith(4);
    recordedExercises();
    const before = store().settings.discomfort;
    const { user } = renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar propuesta' }));
    await user.keyboard('{Escape}');
    expect(store().settings.discomfort).toBe(before);
    expect(store().progress.weeklyResults[0]?.prioritiesRebalanced).toBeUndefined();
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    expect(screen.getByRole('button', { name: 'Aplicar propuesta' })).toBeInTheDocument();
  });

  it('offers manual review when no completed exercises are recorded', async () => {
    weekWith(4);
    const { user } = renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    await user.click(screen.getByRole('button', { name: 'Revisar molestias' }));
    await user.click(screen.getByRole('button', { name: 'Proponer reparto' }));
    expect(screen.getByText(/No hay actividad suficiente/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aplicar propuesta' })).not.toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Cuello' })).toBeEnabled();
  });
});
