import type { Intensity } from '@/domain/types';
import type { IconName } from '@/ui/icons/iconNames';

export const INTENSITIES: Intensity[] = ['soft', 'normal', 'active'];

/** A speedometer whose needle points at each pace. */
export const PACE_ICONS: Record<Intensity, IconName> = {
  soft: 'pace_soft',
  normal: 'pace_normal',
  active: 'pace_active',
};
