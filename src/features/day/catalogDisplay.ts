import { areaById, CATALOG, equipmentById } from '@/content/catalog';
import type {
  BodyArea,
  DiscomfortLevel,
  DiscomfortLevels,
  EquipmentId,
  LocaleCode,
} from '@/domain/types';
import { iconOr } from '@/ui/icons/domainIcons';
import type { IconName } from '@/ui/icons/iconNames';

/**
 * Names, hints and icons of catalog content, in the app's language. Everything comes
 * from catalogo-breakbit.json; an icon the set doesn't have yet falls back to a generic one.
 */

const GENERIC_ICON: IconName = 'exercise';

export function areaName(id: BodyArea, locale: LocaleCode): string {
  return areaById(id)?.name[locale] ?? id;
}

export function areaIcon(id: BodyArea): IconName {
  return iconOr(areaById(id)?.icon, GENERIC_ICON);
}

/** Areas the user rated above 0, highest first (catalog order on ties). */
export function priorityAreas(
  discomfort: DiscomfortLevels,
): { area: BodyArea; level: DiscomfortLevel }[] {
  return CATALOG.areas
    .map(({ id }) => ({ area: id, level: discomfort[id] ?? 0 }))
    .filter((item) => item.level > 0)
    .sort((a, b) => b.level - a.level);
}

export function equipmentName(id: EquipmentId, locale: LocaleCode): string {
  return equipmentById(id)?.name[locale] ?? id;
}

export function equipmentIcon(id: EquipmentId): IconName {
  return iconOr(equipmentById(id)?.icon, GENERIC_ICON);
}

export function mainActivityIcon(activityId: string): IconName {
  const activity = CATALOG.mainActivities.find((item) => item.id === activityId);
  return iconOr(activity?.icon, GENERIC_ICON);
}
