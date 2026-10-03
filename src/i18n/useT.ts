import { useCallback } from 'react';
import { useAppStore } from '@/state/store';
import { translate, type MessageKey, type MessageParams } from './translate';

export type Translate = (key: MessageKey, params?: MessageParams) => string;

/** Translation hook bound to the user's locale preference. */
export function useT() {
  const locale = useAppStore((state) => state.prefs.locale);
  const t: Translate = useCallback(
    (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    [locale],
  );
  return { t, locale };
}
