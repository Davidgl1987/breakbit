import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '@/app/AppRoutes';
import { ROUTES } from '@/app/routes';
import { ToastHost } from '@/app/ToastHost';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { initInstallPrompt } from '@/services/pwa/install';
import { useAppStore } from '@/state/store';
import { renderWithRouter } from '@/test/render';

const ui = () =>
  renderWithRouter(
    <>
      <AppRoutes />
      <ToastHost />
    </>,
    { route: ROUTES.settings },
  );
/** Chromium offering its install dialog, answered with `outcome`. */
function offerInstall(outcome: 'accepted' | 'dismissed') {
  const prompt = vi.fn(async () => {});
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return prompt;
}

beforeAll(() => initInstallPrompt());
beforeEach(() => useAppStore.getState().completeOnboarding(DEFAULT_SETTINGS));
afterEach(() => {
  Reflect.deleteProperty(navigator, 'standalone');
  Reflect.deleteProperty(navigator, 'storage');
});

describe('installing Breakbit', () => {
  it('explains how, where the browser has no dialog of its own', () => {
    ui();
    expect(screen.getByRole('heading', { name: 'Instalar Breakbit' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Desde el menú del navegador, elige «Instalar» o «Añadir a pantalla de inicio».',
      ),
    ).toBeInTheDocument();
  });

  it("uses the browser's own dialog when it offers one", async () => {
    const { user } = ui();
    const prompt = offerInstall('dismissed');
    await user.click(screen.getByRole('button', { name: 'Instalar' }));
    expect(prompt).toHaveBeenCalledOnce();
    // The dialog can only be shown once: back to the steps.
    expect(screen.queryByRole('button', { name: 'Instalar' })).not.toBeInTheDocument();
  });

  it('disappears once installed', () => {
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });
    ui();
    expect(screen.queryByRole('heading', { name: 'Instalar Breakbit' })).not.toBeInTheDocument();
  });
});

describe('protecting the data', () => {
  it('asks the browser to keep the data, when it does not yet', async () => {
    const persist = vi.fn(async () => true);
    Object.defineProperty(navigator, 'storage', {
      value: { persisted: async () => false, persist },
      configurable: true,
    });
    const { user } = ui();
    await user.click(await screen.findByRole('button', { name: /Proteger tus datos/ }));
    expect(persist).toHaveBeenCalledOnce();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Tus datos quedan protegidos en este navegador.',
    );
    expect(
      screen.getByText('Este navegador los conserva aunque le falte espacio.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Proteger tus datos/ })).not.toBeInTheDocument();
  });

  it('just says so when the data is already kept', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: { persisted: async () => true, persist: vi.fn() },
      configurable: true,
    });
    ui();
    expect(
      await screen.findByText('Este navegador los conserva aunque le falte espacio.'),
    ).toBeInTheDocument();
  });
});
