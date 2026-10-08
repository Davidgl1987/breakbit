import type { Localized } from '@/domain/types';
import { l } from './localized';

export interface RoomItem {
  id: string;
  name: Localized;
}

/**
 * What the room gains, in order, once the avatar is at its top phase: one item per good
 * week (breakbit_mvp_master_v1.md §30.8). The bigger pieces come last.
 */
export const ROOM_ITEMS: RoomItem[] = [
  { id: 'plant', name: l('Planta', 'Plant') },
  { id: 'picture', name: l('Cuadro', 'Picture') },
  { id: 'lamp', name: l('Lámpara', 'Lamp') },
  { id: 'rug', name: l('Alfombra', 'Rug') },
  { id: 'mug', name: l('Taza', 'Mug') },
  { id: 'bookshelf', name: l('Estantería', 'Bookshelf') },
  { id: 'headphones', name: l('Auriculares', 'Headphones') },
  { id: 'speaker', name: l('Altavoz', 'Speaker') },
  { id: 'ball', name: l('Balón de fútbol', 'Football') },
  { id: 'skates', name: l('Patines', 'Roller skates') },
  { id: 'skate', name: l('Skate', 'Skateboard') },
  { id: 'mat', name: l('Esterilla', 'Mat') },
  { id: 'kettlebell', name: l('Kettlebell', 'Kettlebell') },
  { id: 'wall_decor', name: l('Decoración de pared', 'Wall decoration') },
  { id: 'monitor', name: l('Segundo monitor', 'Second monitor') },
  { id: 'standing_desk', name: l('Escritorio elevable', 'Standing desk') },
  { id: 'treadmill', name: l('Cinta de andar', 'Treadmill') },
];
