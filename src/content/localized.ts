import type { Localized } from '@/domain/types';

/** Shorthand for authoring bilingual content: `l('Hola', 'Hello')`. */
export function l(es: string, en: string): Localized {
  return { es, en };
}
