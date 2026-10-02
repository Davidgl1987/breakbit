import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { clock } from '@/services/clock';
import { clearEvents } from '@/services/eventLog';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';
import { DevPanel } from './DevPanel';
import { formatOffset, toDateTimeLocal } from './devFormat';

describe('DevPanel', () => {
  afterEach(async () => {
    clock.setOffset(0);
    await clearEvents();
  });

  it('moves the simulated clock forward and back to real time', async () => {
    const { user } = renderWithRouter(<DevPanel />);
    await user.click(screen.getByRole('button', { name: 'Abrir herramientas de desarrollo' }));
    expect(screen.getByRole('dialog', { name: 'Herramientas de desarrollo' })).toBeInTheDocument();
    expect(screen.getByText('Hora real')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+1 h' }));
    await user.click(screen.getByRole('button', { name: '+15 min' }));
    expect(clock.offset()).toBe(75 * 60_000);
    expect(screen.getByText('Simulado: +1 h 15 min')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver a la hora real' }));
    expect(clock.offset()).toBe(0);
  });

  it('travels to a chosen date and time', async () => {
    const { user } = renderWithRouter(<DevPanel />);
    await user.click(screen.getByRole('button', { name: 'Abrir herramientas de desarrollo' }));
    // The native picker sets the whole value at once.
    fireEvent.change(screen.getByLabelText('Ir a fecha y hora'), {
      target: { value: '2026-10-05T16:50' },
    });
    await user.click(screen.getByRole('button', { name: 'Ir' }));
    expect(toDateTimeLocal(clock.now())).toBe('2026-10-05T16:50');
  });

  it('shows data counts and deletes everything after confirming', async () => {
    useAppStore.getState().completeOnboarding(DEFAULT_SETTINGS);
    useAppStore.getState().markDayOff('2026-10-05');
    const { user } = renderWithRouter(<DevPanel />);
    await user.click(screen.getByRole('button', { name: 'Abrir herramientas de desarrollo' }));
    await waitFor(() =>
      expect(screen.getByText('Excepciones de calendario').nextSibling).toHaveTextContent('1'),
    );

    await user.click(screen.getByRole('button', { name: 'Borrar datos' }));
    expect(useAppStore.getState().onboardedAt).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Pulsa otra vez para borrar todo' }));
    await waitFor(() => expect(useAppStore.getState().onboardedAt).toBeUndefined());
    expect(useAppStore.getState().dayOverrides).toEqual({});
  });
});

describe('formatOffset', () => {
  it('formats offsets compactly', () => {
    expect(formatOffset(0)).toBe('+0 min');
    expect(formatOffset(-30 * 60_000)).toBe('−30 min');
    expect(formatOffset((26 * 60 + 5) * 60_000)).toBe('+1 d 2 h 5 min');
  });
});
