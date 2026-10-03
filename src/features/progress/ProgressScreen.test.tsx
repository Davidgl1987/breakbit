import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { HISTORY_NOW, historyScenarioState } from '@/app/dev/historyScenario';
import { ROUTES } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { atTime } from '@/domain/time';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const store = () => useAppStore.getState();
const section = (title: string) =>
  screen.getByRole('heading', { level: 2, name: title }).closest('section')!;

beforeEach(() => store().completeOnboarding(DEFAULT_SETTINGS));
afterEach(() => clock.setOffset(0));

describe('Progress with some history', () => {
  beforeEach(() => {
    store().replaceData(historyScenarioState(store()));
    clock.travelTo(HISTORY_NOW);
  });

  it('shows the evolution and how this week is going, apart from XP', () => {
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const evolution = section('Tu evolución');
    const strip = within(evolution).getByRole('list', { name: 'Tu evolución' });
    expect(within(strip).getByRole('listitem', { current: 'step' })).toBeInTheDocument();
    expect(evolution).toHaveTextContent(/Esta semana: \d de \d días buenos/);
    expect(evolution).toHaveTextContent(/Racha\d+ días/);
    expect(evolution).toHaveTextContent('XP total');
  });

  it('draws the consistency grid, period by period', () => {
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const constancy = section('Tu constancia');
    expect(within(constancy).getByRole('img')).toHaveAccessibleName(
      /^\d+ días buenos de \d+ jornadas, de .+ a .+$/,
    );
    const next = within(constancy).getByRole('button', { name: 'Periodo siguiente' });
    const previous = within(constancy).getByRole('button', { name: 'Periodo anterior' });
    expect(next).toBeDisabled();
    // The history started within this period: nothing earlier to see.
    expect(previous).toBeDisabled();
  });

  it('opens earlier periods when the history is longer', async () => {
    useAppStore.setState({ onboardedAt: atTime('2026-01-05', '09:00') });
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const constancy = section('Tu constancia');
    const previous = within(constancy).getByRole('button', { name: 'Periodo anterior' });
    const next = within(constancy).getByRole('button', { name: 'Periodo siguiente' });
    const range = () => within(constancy).getByText(/2026/).textContent;
    const latest = range();
    await user.click(previous);
    expect(range()).not.toBe(latest);
    expect(next).toBeEnabled();
    await user.click(next);
    expect(range()).toBe(latest);
  });

  it('sums the week up, with the areas moved and what is worth telling', () => {
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const week = section('Resumen semanal');
    for (const label of [
      'Pausas completadas',
      'A la primera',
      'En movimiento',
      'Interrupción real',
    ]) {
      expect(within(week).getByText(label)).toBeInTheDocument();
    }
    for (const fact of [
      'Días buenos',
      'Aplazadas',
      'Ignoradas',
      'Descartadas',
      'XP de la semana',
    ]) {
      expect(within(week).getByText(fact)).toBeInTheDocument();
    }
    const areas = within(section('Molestias que más cuidas')).getAllByRole('listitem');
    expect(areas.length).toBeGreaterThan(0);
    expect(areas[0]).toHaveTextContent(/\d+ ejercicios · \d+ min/);
    const insights = within(section('Esta semana')).getAllByRole('listitem');
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.length).toBeLessThanOrEqual(3);
  });

  it('lists past weeks, newest first, each opening its result', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const weeks = within(section('Tus semanas')).getAllByRole('link');
    expect(weeks).toHaveLength(8);
    expect(weeks[0]).toHaveAttribute('href', '/week/2026-W41');
    await user.click(weeks[0]!);
    expect(screen.getByText('Tu semana')).toBeInTheDocument();
  });
});

describe('Progress on the first day', () => {
  it('invites to start instead of showing empty numbers', () => {
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByText('Aún no hay jornadas esta semana.')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando hagas tus pausas verás aquí qué zonas mueves más.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Haz tus primeras pausas y aquí verás cómo va tu semana.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tu primera semana se evaluará el lunes siguiente.'),
    ).toBeInTheDocument();
  });
});
