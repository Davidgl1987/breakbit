import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { weekPath } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
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
      summary: { isGood: i < good, completed: 0, planned: 0, xp: 0 } as DailySummary,
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

describe('weekly result', () => {
  it('is shown on Today until seen, and tells how the avatar evolved', async () => {
    weekWith(4);
    const { user } = renderWithRouter(<AppRoutes />, { route: '/' });
    expect(screen.getByText('¡Semana buena!')).toBeInTheDocument();
    expect(screen.getByText('4 de 5 días buenos')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ver mi semana' }));

    expect(screen.getByRole('heading', { level: 1, name: '¡Semana buena!' })).toBeInTheDocument();
    expect(screen.getByText('Tu avatar evoluciona a Erguido.')).toBeInTheDocument();
    const strip = screen.getByRole('list', { name: 'Tu evolución' });
    expect(within(strip).getByRole('listitem', { current: 'step' })).toHaveTextContent('Erguido');

    await user.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(screen.getByRole('heading', { level: 1, name: '¡Hola!' })).toBeInTheDocument();
    expect(screen.queryByText('¡Semana buena!')).not.toBeInTheDocument();
    expect(store().progress.lastSeenWeek).toBe('2026-W41');
  });

  it('says a weaker week plainly, without punishing below the first phase', () => {
    weekWith(1);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W41') });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Semana con menos movimiento' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 de 5 días buenos')).toBeInTheDocument();
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
    expect(screen.getByText('Tu habitación estrena: Planta')).toBeInTheDocument();
    const room = screen.getByRole('list', { name: 'Tu habitación' });
    const fresh = within(room).getByRole('img', { name: 'Planta' }).closest('li')!;
    expect(fresh).toHaveTextContent('Nuevo');
  });

  it('sends unknown weeks back to Today', () => {
    weekWith(4);
    renderWithRouter(<AppRoutes />, { route: weekPath('2026-W01') });
    expect(screen.getByRole('heading', { level: 1, name: '¡Hola!' })).toBeInTheDocument();
  });
});
