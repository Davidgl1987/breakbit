import type { Area, Catalog, Equipment, LocaleCode, Localized } from '@/domain/types';
import data from './catalogo-breakbit.json';

/**
 * The bundled content, straight from catalogo-breakbit.json: the only source of areas,
 * equipment, exercises, routines and main activities, with their texts in es and en.
 * build/catalogCheck.ts validates the file on every build (and in dev), so here it is
 * trusted as is. Domain functions receive it as a parameter, never import it.
 */
export const CATALOG = data as Catalog;

/** A catalog text in the app's language. */
export function localize(value: Localized, locale: LocaleCode): string {
  return value[locale];
}

export function areaById(id: string): Area | undefined {
  return CATALOG.areas.find((area) => area.id === id);
}

export function equipmentById(id: string): Equipment | undefined {
  return CATALOG.equipment.find((item) => item.id === id);
}

/** Known equipment among `ids`, in catalog order (unknown ids are ignored). */
export function equipmentIn(ids: readonly string[]): Equipment[] {
  return CATALOG.equipment.filter((item) => ids.includes(item.id));
}
