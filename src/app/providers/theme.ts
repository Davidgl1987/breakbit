import type { ThemePreference } from '@/state/store';

export type ResolvedTheme = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function systemTheme(): ResolvedTheme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference;
}

/** Applies the theme to <html> and keeps the browser chrome color in sync. */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  const background = getComputedStyle(root).getPropertyValue('--color-bg').trim();
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta && background) meta.content = background;
}

export function onSystemThemeChange(listener: () => void): () => void {
  const media = window.matchMedia?.(DARK_QUERY);
  if (!media) return () => {};
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
