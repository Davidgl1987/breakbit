import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { useAppStore } from '@/state/store';
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

  it('sends onboarded users away from onboarding', () => {
    renderWithRouter(<AppRoutes />, { route: '/onboarding/welcome' });
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    ['/progress', 'Progreso'],
    ['/settings', 'Ajustes'],
    ['/gap', 'Tengo un hueco'],
  ])('renders %s inside the tabs layout', (route, heading) => {
    renderWithRouter(<AppRoutes />, { route });
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
  });

  it('renders the end of day full screen, without bottom navigation', () => {
    renderWithRouter(<AppRoutes />, { route: '/day/end' });
    expect(screen.getByRole('heading', { level: 1, name: 'Fin de jornada' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cerrar' })).toHaveAttribute('href', '/');
  });

  it('redirects unknown URLs to Today', () => {
    renderWithRouter(<AppRoutes />, { route: '/nope' });
    expect(screen.getByRole('link', { name: 'Hoy' })).toHaveAttribute('aria-current', 'page');
  });
});
