import type { BodyArea, EquipmentId, EvolutionPhase } from '@/domain/types';
import type { IconName } from './iconNames';

export const AREA_ICONS: Record<BodyArea, IconName> = {
  neck: 'neck',
  back: 'back_pain',
  shoulders: 'shoulders',
  wrists: 'wrist',
  eyes: 'eyes',
  sedentary: 'sedentary',
};

export const EQUIPMENT_ICONS: Record<EquipmentId, IconName> = {
  pullup_bar: 'pullup_bar',
  dumbbells: 'dumbbell',
  kettlebell: 'kettlebell',
  mat: 'mat',
  standing_desk: 'desk',
};

/** Placeholder art per evolution phase, from sitting to moving, until the avatar exists. */
export const PHASE_PLACEHOLDER_ICONS: Record<EvolutionPhase, IconName> = {
  1: 'sedentary',
  2: 'chair',
  3: 'laptop',
  4: 'stretch',
  5: 'exercise',
};

/** Main activities by id; anything new falls back to a generic movement icon. */
const MAIN_ACTIVITY_ICONS: Partial<Record<string, IconName>> = {
  walk_outside: 'outside',
  walk_indoors: 'walk',
  walking_meeting: 'call',
  mobility_routine: 'stretch',
  standing_work: 'desk',
  pullup_block: 'pullup_bar',
  dumbbell_block: 'dumbbell',
  kettlebell_block: 'kettlebell',
  mat_mobility: 'mat',
};

export function mainActivityIcon(activityId: string): IconName {
  return MAIN_ACTIVITY_ICONS[activityId] ?? 'exercise';
}
