import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { BottomNav } from './BottomNav';

function From() {
  const { pathname, state } = useLocation();
  return <p data-testid="from">{`${pathname} ← ${(state as { from?: string } | null)?.from}`}</p>;
}

describe('BottomNav', () => {
  it('shows the three tabs and the raised gap action', () => {
    renderWithRouter(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Tengo un hueco',
      'Hoy',
      'Progreso',
      'Ajustes',
    ]);
    expect(within(nav).getByRole('link', { name: 'Tengo un hueco' })).toHaveAttribute(
      'href',
      '/gap',
    );
  });

  it.each([
    ['/', 'Hoy'],
    ['/progress', 'Progreso'],
    ['/settings', 'Ajustes'],
    ['/settings/about', 'Ajustes'],
  ])('marks the active destination on %s', (route, name) => {
    renderWithRouter(<BottomNav />, { route });
    expect(screen.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
    const others = screen.getAllByRole('link').filter((link) => link.textContent !== name);
    others.forEach((link) => expect(link).not.toHaveAttribute('aria-current'));
  });

  it('opens "Tengo un hueco" remembering where it was opened from', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <>
        <BottomNav />
        <Routes>
          <Route path="*" element={<From />} />
        </Routes>
      </>,
      { route: '/progress' },
    );
    await user.click(screen.getByRole('link', { name: 'Tengo un hueco' }));
    expect(screen.getByTestId('from')).toHaveTextContent('/gap ← /progress');
  });

  it('follows the language preference', async () => {
    const { useAppStore } = await import('@/state/store');
    useAppStore.setState({ prefs: { theme: 'system', locale: 'en' } });
    renderWithRouter(<BottomNav />);
    expect(screen.getByRole('link', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'I have a gap' })).toBeInTheDocument();
  });
});
