import type { LocaleCode } from '@/domain/types';
import { en } from './en';
import { es, type Messages } from './es';

export const LOCALES = ['es', 'en'] as const satisfies readonly LocaleCode[];
export type Locale = (typeof LOCALES)[number];

export const MESSAGES: Record<Locale, Messages> = { es, en };

interface PluralForms {
  one: string;
  other: string;
}

/** Dotted paths to every translatable leaf (strings and plural groups). */
export type MessageKey = LeafPaths<Messages>;

type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | PluralForms
    ? `${Prefix}${K}`
    : LeafPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageParams = Record<string, string | number>;

export function detectLocale(languages: readonly string[] = navigatorLanguages()): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    const match = LOCALES.find((locale) => locale === base);
    if (match) return match;
  }
  return 'es';
}

function navigatorLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

function lookup(messages: Messages, key: string): unknown {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

function isPlural(value: unknown): value is PluralForms {
  return typeof value === 'object' && value !== null && 'other' in value;
}

function interpolate(template: string, params: MessageParams | undefined): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}

/** Pure translation function, usable outside React (e.g. notification copy). */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const value = lookup(MESSAGES[locale], key);
  if (typeof value === 'string') return interpolate(value, params);
  if (isPlural(value)) {
    const count = Number(params?.count ?? 0);
    const form = new Intl.PluralRules(locale).select(count) === 'one' ? value.one : value.other;
    return interpolate(form, { ...params, count: formatNumber(locale, count) });
  }
  if (import.meta.env.DEV) console.warn(`[i18n] Missing key "${key}" for locale "${locale}"`);
  return key;
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Weekday name for an ISO weekday (1 = Monday). */
export function weekdayName(
  locale: Locale,
  weekday: number,
  width: 'narrow' | 'short' | 'long' = 'long',
): string {
  // 2026-10-05 is a Monday.
  return new Intl.DateTimeFormat(locale, { weekday: width }).format(new Date(2026, 9, 4 + weekday));
}

export function formatTime(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}
