import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { sampleAt, sampleDay } from '@/test/sampleDay';
import { renderWithRouter } from '@/test/render';
import { AppRoutes } from './AppRoutes';

describe('AppRoutes before onboarding', () => {
  it.each(['/', '/progress', '/day/end'])('sends %s to the welcome step', (route) => {
    renderWithRouter(<AppRoutes />, { route });
    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
  });
});

describe('AppRoutes', () => {
  beforeEach(() => {
    useAppStore.getState().completeOnboarding(DEFAULT_SETTINGS);
  });
  afterEach(() => clock.setOffset(0));

  it('sends onboarded users away from onboarding', () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/welcome' });
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    ['/progress', 'Tu progreso'],
    ['/settings', 'Ajustes'],
  ])('renders %s inside the tabs layout', (route, heading) => {
    renderWithRouter(<AppRoutes />, { route });
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
  });

  it('opens "Tengo un hueco" as a modal over the tabs and closes back to where it was', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppRoutes />, { route: '/progress' });
    await user.click(screen.getByRole('link', { name: 'Tengo un hueco' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Tengo un hueco' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Cerrar' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Tu progreso' })).toBeInTheDocument();
  });

  it('keeps the original tab mounted behind the time sheet and restores focus on Escape', async () => {
    useAppStore.getState().startDay(sampleDay());
    clock.travelTo(sampleAt('09:20'));
    const { user } = renderWithRouter(<AppRoutes />, { route: '/progress' });
    const title = screen.getByRole('heading', { level: 1, name: 'Progreso' });
    const fab = screen.getByRole('link', { name: 'Tengo un hueco' });
    await user.click(fab);
    expect(screen.getByRole('dialog', { name: 'Tengo un hueco' })).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Progreso' })).toBe(title);
    expect(fab).toHaveFocus();
  });

  it('returns from a proposal to time choice over the originating Settings tab', async () => {
    useAppStore.getState().startDay(sampleDay());
    clock.travelTo(sampleAt('09:20'));
    const { user } = renderWithRouter(<AppRoutes />, { route: '/settings' });
    await user.click(screen.getByRole('link', { name: 'Tengo un hueco' }));
    await user.click(screen.getByRole('link', { name: /^3 minutos/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Volver' }));
    expect(screen.getByRole('dialog', { name: 'Tengo un hueco' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ajustes' })).toHaveAttribute('aria-current', 'page');
  });

  it('closes "Tengo un hueco" to Today when opened directly', () => {
    renderWithRouter(<AppRoutes />, { route: '/gap' });
    expect(screen.getByRole('link', { name: 'Cerrar' })).toHaveAttribute('href', '/');
  });

  it('renders the end of day full screen, without bottom navigation', () => {
    useAppStore.getState().startDay(sampleDay());
    clock.travelTo(sampleAt('16:55'));
    renderWithRouter(<AppRoutes />, { route: '/day/end' });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Así ha ido tu día' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cerrar' })).toHaveAttribute('href', '/');
  });

  it('redirects unknown URLs to Today', () => {
    renderWithRouter(<AppRoutes />, { route: '/nope' });
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });
});
