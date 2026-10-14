import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { HISTORY_NOW, historyScenarioState } from '@/app/dev/historyScenario';
import { ROUTES } from '@/app/routes';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { atTime } from '@/domain/time';
import type { DateKey, ExerciseRating, ScheduledActivity } from '@/domain/types';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { SAMPLE_DATE, sampleAt, sampleDay } from '@/test/sampleDay';

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

  it('shows the evolution separately from the single XP bar and expands its phases', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const evolution = section('Tu evolución').parentElement!;
    expect(within(evolution).getAllByRole('progressbar')).toHaveLength(1);
    await user.click(within(evolution).getByText('Ver fases y recompensas'));
    const strip = within(evolution).getByRole('list', { name: 'Tu evolución' });
    expect(within(strip).getByRole('listitem', { current: 'step' })).toBeInTheDocument();
    expect(evolution).toHaveTextContent(/Esta semana: \d de \d días buenos/);
    expect(evolution).toHaveTextContent(/Racha · \d+ días/);
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
    expect(previous).toBeEnabled();
    const grid = within(constancy).getByRole('img');
    expect(grid.children).toHaveLength(7 + 28);
  });

  it('opens earlier periods when the history is longer', async () => {
    useAppStore.setState({ onboardedAt: atTime('2026-01-05', '09:00') });
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const constancy = section('Tu constancia');
    const previous = within(constancy).getByRole('button', { name: 'Periodo anterior' });
    const next = within(constancy).getByRole('button', { name: 'Periodo siguiente' });
    const range = () => within(constancy).getByRole('img').getAttribute('aria-label');
    const latest = range();
    await user.click(previous);
    expect(range()).not.toBe(latest);
    expect(next).toBeEnabled();
    await user.click(next);
    expect(range()).toBe(latest);
  });

  it('sums the week up, with expandable rows and week comparison', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const week = section('Esta semana');
    await user.click(within(week).getByText('Más datos de esta semana'));
    await user.click(screen.getByText('Ver más'));
    expect(week).toHaveTextContent('Comparando los mismos días de la semana');
    for (const label of [
      'Pausas completadas',
      'A la primera',
      'En movimiento',
      'Interrupción real',
    ]) {
      expect(within(week).getAllByText(label)[0]).toBeInTheDocument();
    }
    for (const fact of [
      'Días buenos',
      'Aplazadas',
      'Ignoradas',
      'Descartadas',
      'XP de la semana',
    ]) {
      expect(within(week).getAllByText(fact)[0]).toBeInTheDocument();
    }
    const areas = within(section('Molestias que más cuidas')).getAllByRole('listitem');
    expect(areas.length).toBeGreaterThan(0);
    expect(areas[0]).toHaveTextContent(/\d+ ejercicios · \d+ min/);
    const insights = within(
      screen.getByRole('heading', { name: 'Sobre tu semana' }).closest('section')!,
    ).getAllByRole('listitem');
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.length).toBeLessThanOrEqual(3);
  });

  it('lists favourites and expands the least liked exercises', async () => {
    // Isolate these two votes from the rated demonstration history.
    useAppStore.setState((state) => ({
      days: Object.fromEntries(
        Object.entries(state.days).map(([date, day]) => [
          date,
          day?.plan
            ? {
                ...day,
                plan: {
                  ...day.plan,
                  activities: day.plan.activities.map((item) => ({ ...item, rating: undefined })),
                },
              }
            : day,
        ]),
      ),
    }));
    // Two pauses of the latest day with a plan: one liked, one disliked.
    const days = store().days;
    const date = (Object.keys(days) as DateKey[])
      .filter((key) => days[key]?.plan)
      .sort()
      .at(-1)!;
    const record = days[date]!;
    const [a, b] = record.plan!.activities.filter((item) => item.kind === 'micro');
    const rated = (item: ScheduledActivity, exerciseId: string, rating: ExerciseRating) => ({
      ...item,
      status: 'completed' as const,
      content: { kind: 'exercises' as const, exerciseIds: [exerciseId] },
      rating,
    });
    const changes = [rated(a!, 'march', 'liked'), rated(b!, 'lunge', 'disliked')];
    useAppStore.setState((state) => ({
      days: {
        ...state.days,
        [date]: {
          ...record,
          plan: {
            ...record.plan!,
            activities: record.plan!.activities.map(
              (item) => changes.find((other) => other.id === item.id) ?? item,
            ),
          },
        },
      },
    }));

    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    const likes = section('Tus favoritos');
    await user.click(within(likes).getByText('Te gustan menos'));
    expect(likes).toHaveTextContent('Marcha con palmada en rodilla1 voto');
    expect(likes).toHaveTextContent('Te gustan menosZancada1 voto');
  });

  it('lists past weeks, newest first, each opening its result', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    await user.click(within(section('Tus semanas')).getByText('Consultar historial'));
    const weeks = within(section('Tus semanas')).getAllByRole('link');
    expect(weeks).toHaveLength(8);
    expect(weeks[0]).toHaveAttribute('href', '/week/2026-W41');
    await user.click(weeks[0]!);
    expect(screen.getByText('Tu semana')).toBeInTheDocument();
  });
});

describe('Progress on the first day', () => {
  it('invites to start with one XP bar and goes to Today without starting a workday', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByText('Tu historia empieza hoy.')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByText('Aún no hay jornadas esta semana.')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /días buenos de/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ir a Hoy' }));
    expect(screen.getByRole('heading', { name: 'Tu plan de hoy' })).toBeInTheDocument();
    expect(Object.values(store().days).some((day) => day?.plan)).toBe(false);
  });

  it('opens the shared phases panel and closes with Escape without changing XP or phase', async () => {
    const { user } = renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    await user.click(screen.getByRole('button', { name: 'Ver fases y recompensas' }));
    const panel = screen.getByRole('dialog', { name: 'Tu evolución' });
    expect(within(panel).getAllByRole('listitem')).toHaveLength(5);
    expect(within(panel).getByRole('listitem', { current: 'step' })).toHaveTextContent('Encorvado');
    expect(panel).toHaveTextContent('El XP aumenta tu nivel');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store().progress.evolutionPhase).toBe(1);
    expect(store().xpLedger).toEqual([]);
    expect(screen.getByRole('button', { name: 'Ver fases y recompensas' })).toHaveFocus();
  });

  it.each(['absent', 'day_off'] as const)(
    'keeps the first step for a calendar-only %s record',
    (status) => {
      useAppStore.setState({
        days: {
          [SAMPLE_DATE]: { date: SAMPLE_DATE, status, returnBonus: false, recoveryUsed: false },
        },
      });
      renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
      expect(screen.getByText('Tu historia empieza hoy.')).toBeInTheDocument();
    },
  );

  it('keeps the approved placeholders after starting a day until something is completed', () => {
    clock.travelTo(sampleAt('09:30'));
    store().completeOnboarding(DEFAULT_SETTINGS);
    store().startDay(sampleDay());
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByText('Tu historia empieza hoy.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Esta semana' })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /días buenos de/ })).not.toBeInTheDocument();
    expect(within(section('Lo que verás aquí')).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Tu primera semana' })).toBeInTheDocument();
  });

  it('replaces constancy and areas independently while favourites wait for a rating', () => {
    clock.travelTo(sampleAt('10:10'));
    store().completeOnboarding(DEFAULT_SETTINGS);
    const plan = sampleDay();
    plan.activities[0] = { ...plan.activities[0]!, status: 'completed' };
    store().startDay(plan);
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByRole('img', { name: /días buenos de/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Molestias que más cuidas' })).toBeInTheDocument();
    const pending = section('Lo que verás aquí');
    expect(within(pending).getAllByRole('listitem')).toHaveLength(1);
    expect(pending).toHaveTextContent('Tus favoritosA partir de tus valoraciones.');
    expect(pending).not.toHaveTextContent('Tu constancia');
    expect(pending).not.toHaveTextContent('Las zonas que cuidas');
    expect(
      screen.queryByRole('heading', { name: 'Frente a la semana pasada' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tu primera semana' })).toBeInTheDocument();
  });

  it('removes the pending group when all its sections have data, keeping the first-week card', () => {
    clock.travelTo(sampleAt('10:10'));
    store().completeOnboarding(DEFAULT_SETTINGS);
    const plan = sampleDay();
    plan.activities[0] = { ...plan.activities[0]!, status: 'completed', rating: 'liked' };
    store().startDay(plan);
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByRole('heading', { name: 'Tus favoritos' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Lo que verás aquí' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tu primera semana' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tus semanas' })).not.toBeInTheDocument();
  });

  it('preserves old favourites, XP and weekly history while recent sections stay pending', () => {
    const imported = historyScenarioState(store());
    store().replaceData({
      ...imported,
      days: Object.fromEntries(
        Object.entries(imported.days).filter(([date]) => date <= '2026-09-09'),
      ),
      xpLedger: imported.xpLedger.filter((entry) => entry.date <= '2026-09-09'),
    });
    clock.travelTo(HISTORY_NOW);
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(section('Tus favoritos')).toHaveTextContent('Apertura de pecho');
    const pending = section('Lo que verás aquí');
    expect(within(pending).getAllByRole('listitem')).toHaveLength(2);
    expect(pending).toHaveTextContent('Tu constancia');
    expect(pending).toHaveTextContent('Las zonas que cuidas');
    expect(pending).not.toHaveTextContent('Tus favoritos');
    expect(screen.getByRole('heading', { name: 'Tus semanas' })).toBeInTheDocument();
    expect(screen.getByText(/XP total/)).toHaveTextContent('11.900');
    expect(screen.queryByRole('heading', { name: 'Esta semana' })).not.toBeInTheDocument();
  });

  it('uses imported summary-only movement for the calendar and weekly figures', () => {
    clock.travelTo(sampleAt('17:10'));
    store().completeOnboarding(DEFAULT_SETTINGS);
    useAppStore.setState({
      days: {
        [SAMPLE_DATE]: {
          date: SAMPLE_DATE,
          status: 'closed',
          returnBonus: false,
          recoveryUsed: false,
          summary: {
            planned: 1,
            completed: 1,
            firstPrompt: 1,
            postponed: 0,
            ignored: 0,
            skipped: 0,
            missed: 0,
            extras: 0,
            mainCompleted: false,
            microSec: 40,
            movementSec: 40,
            interruptionSec: 40,
            xp: 120,
            isGood: false,
            isPerfect: false,
          },
        },
      },
    });
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.getByRole('img', { name: /días buenos de/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Esta semana' })).toBeInTheDocument();
    const pending = section('Lo que verás aquí');
    expect(within(pending).getAllByRole('listitem')).toHaveLength(2);
    expect(pending).toHaveTextContent('Tus favoritos');
    expect(pending).toHaveTextContent('Las zonas que cuidas');
  });

  it('keeps imported progress visible even if there are no saved daily plans', () => {
    const imported = historyScenarioState(store());
    store().replaceData({ ...imported, days: {} });
    renderWithRouter(<AppRoutes />, { route: ROUTES.progress });
    expect(screen.queryByText('Tu historia empieza hoy.')).not.toBeInTheDocument();
    expect(screen.getByText('XP total', { exact: false })).toBeInTheDocument();
  });
});
