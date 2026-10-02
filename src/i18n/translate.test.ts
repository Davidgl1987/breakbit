import { describe, expect, it } from 'vitest';
import { en } from './en';
import { es } from './es';
import { detectLocale, translate } from './translate';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') result.set(path, value);
    else for (const [childPath, text] of leaves(value, path)) result.set(childPath, text);
  }
  return result;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('messages', () => {
  const esLeaves = leaves(es as unknown as Tree);
  const enLeaves = leaves(en as unknown as Tree);

  it('es and en define exactly the same keys', () => {
    expect([...enLeaves.keys()].sort()).toEqual([...esLeaves.keys()].sort());
  });

  it('no message is empty', () => {
    for (const [key, text] of [...esLeaves, ...enLeaves]) {
      expect(text.trim(), key).not.toBe('');
    }
  });

  it('es and en use the same placeholders', () => {
    for (const [key, text] of esLeaves) {
      expect(placeholders(enLeaves.get(key) ?? ''), key).toEqual(placeholders(text));
    }
  });
});

describe('translate', () => {
  it('returns the message for the locale', () => {
    expect(translate('es', 'nav.today')).toBe('Hoy');
    expect(translate('en', 'nav.today')).toBe('Today');
  });

  it('interpolates parameters', () => {
    expect(translate('es', 'common.stepOf', { current: 1, total: 5 })).toBe('Paso 1 de 5');
  });

  it('selects plural forms per locale', () => {
    expect(translate('es', 'common.pauses', { count: 1 })).toBe('1 pausa');
    expect(translate('es', 'common.pauses', { count: 6 })).toBe('6 pausas');
    expect(translate('en', 'common.pauses', { count: 1 })).toBe('1 break');
    expect(translate('en', 'common.pauses', { count: 0 })).toBe('0 breaks');
  });
});

describe('detectLocale', () => {
  it('picks the first supported browser language', () => {
    expect(detectLocale(['fr-FR', 'en-GB', 'es'])).toBe('en');
    expect(detectLocale(['es-ES'])).toBe('es');
  });

  it('falls back to Spanish', () => {
    expect(detectLocale(['de-DE'])).toBe('es');
    expect(detectLocale([])).toBe('es');
  });
});
