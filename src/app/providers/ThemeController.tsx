import { useEffect } from 'react';
import { localHints } from '@/services/storage';
import { useAppStore } from '@/state/store';
import { applyTheme, onSystemThemeChange, resolveTheme } from './theme';

/** Keeps <html data-theme> and <html lang> in sync with the user's preferences. */
export function ThemeController() {
  const theme = useAppStore((state) => state.prefs.theme);
  const locale = useAppStore((state) => state.prefs.locale);

  useEffect(() => {
    const sync = () => {
      const resolved = resolveTheme(theme);
      applyTheme(resolved);
      localHints.set('theme', resolved);
    };
    sync();
    return theme === 'system' ? onSystemThemeChange(sync) : undefined;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
