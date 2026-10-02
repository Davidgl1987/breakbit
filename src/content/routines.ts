import type { Routine } from '@/domain/types';
import { l } from './localized';

/** Mini-routines from breakbit_mvp_master_v1.md §16, plus the 5-minute mobility routine. */
export const ROUTINES: Routine[] = [
  {
    id: 'wake_up',
    name: l('Despertar', 'Wake up'),
    steps: [
      { exerciseId: 'march', seconds: 30 },
      { exerciseId: 'arm_swing', seconds: 30 },
      { exerciseId: 'trunk_twist', seconds: 30 },
      { exerciseId: 'wave', seconds: 30 },
    ],
  },
  {
    id: 'desk_reset',
    name: l('Reset de escritorio', 'Desk reset'),
    steps: [
      { exerciseId: 'chest_opener', seconds: 30 },
      { exerciseId: 'high_twist', seconds: 30 },
      { exerciseId: 'golf_swing', seconds: 30 },
      { exerciseId: 'wave', seconds: 30 },
    ],
  },
  {
    id: 'active_legs',
    name: l('Piernas activas', 'Active legs'),
    steps: [
      { exerciseId: 'march', seconds: 30 },
      { exerciseId: 'plie', seconds: 30 },
      { exerciseId: 'push_side', seconds: 30 },
      { exerciseId: 'kick_step', seconds: 30 },
    ],
  },
  {
    id: 'active_reset',
    name: l('Reset activo', 'Active reset'),
    steps: [
      { exerciseId: 'march', seconds: 30 },
      { exerciseId: 'punch', seconds: 30 },
      { exerciseId: 'lunge', seconds: 30 },
      { exerciseId: 'high_twist', seconds: 30 },
      { exerciseId: 'push_side', seconds: 30 },
      { exerciseId: 'hop_rotate', seconds: 30 },
    ],
  },
  {
    // Main-activity routine: neck + shoulders + back + gentle marching (mvp_v1 §11.7).
    id: 'mobility_5',
    name: l('Mini rutina de movilidad', 'Mini mobility routine'),
    steps: [
      { exerciseId: 'chin_tuck', seconds: 45 },
      { exerciseId: 'neck_side_tilt', seconds: 45 },
      { exerciseId: 'shoulder_circles', seconds: 45 },
      { exerciseId: 'thoracic_rotation', seconds: 45 },
      { exerciseId: 'cat_cow_standing', seconds: 45 },
      { exerciseId: 'chest_opener', seconds: 30 },
      { exerciseId: 'march', seconds: 45 },
    ],
  },
];
