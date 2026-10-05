import type { EvolutionPhase } from '@/domain/types';
import { ICON_NAMES, type IconName } from './iconNames';

/** Placeholder art per evolution phase, from sitting to moving, until the avatar exists. */
export const PHASE_PLACEHOLDER_ICONS: Record<EvolutionPhase, IconName> = {
  1: 'seated',
  2: 'chair',
  3: 'laptop',
  4: 'stretch',
  5: 'exercise',
};

/** Room items by id (placeholders until the room has its own art). */
const ROOM_ITEM_ICONS: Partial<Record<string, IconName>> = {
  plant: 'plant',
  picture: 'picture',
  lamp: 'lamp',
  rug: 'rug',
  mug: 'mug',
  bookshelf: 'bookshelf',
  headphones: 'headphones',
  speaker: 'speaker',
  ball: 'ball',
  skates: 'skates',
  skate: 'skate',
  mat: 'mat',
  kettlebell: 'kettlebell',
  pullup_bar: 'pullup_bar',
  wall_decor: 'plant_decor',
  monitor: 'monitor',
  standing_desk: 'desk',
  treadmill: 'treadmill',
};

export function roomItemIcon(itemId: string): IconName {
  return ROOM_ITEM_ICONS[itemId] ?? 'reward';
}

/**
 * An icon named by content (the catalog's `icon` fields), or `fallback` while that icon
 * doesn't exist yet.
 */
export function iconOr(name: string | undefined, fallback: IconName): IconName {
  return name !== undefined && (ICON_NAMES as readonly string[]).includes(name)
    ? (name as IconName)
    : fallback;
}
