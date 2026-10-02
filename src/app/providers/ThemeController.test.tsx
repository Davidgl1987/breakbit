import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppStore } from '@/state/store';
import { setSystemDark } from '@/test/matchMedia';
import { ThemeController } from './ThemeController';

const theme = () => document.documentElement.dataset.theme;

describe('ThemeController', () => {
  it('applies an explicit preference', async () => {
    useAppStore.setState({ prefs: { theme: 'dark', locale: 'es' } });
    render(<ThemeController />);
    expect(theme()).toBe('dark');

    await act(async () => useAppStore.getState().setTheme('light'));
    expect(theme()).toBe('light');
  });

  it('follows the system preference live when set to "system"', async () => {
    render(<ThemeController />);
    expect(theme()).toBe('light');
    await act(async () => setSystemDark(true));
    expect(theme()).toBe('dark');
  });

  it('keeps <html lang> in sync with the locale', async () => {
    render(<ThemeController />);
    expect(document.documentElement.lang).toBe('es');
    await act(async () => useAppStore.getState().setLocale('en'));
    expect(document.documentElement.lang).toBe('en');
  });
});
