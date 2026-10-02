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
