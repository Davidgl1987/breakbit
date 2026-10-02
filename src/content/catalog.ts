import type { Catalog } from '@/domain/types';
import { EXERCISES } from './exercises';
import { MAIN_ACTIVITIES } from './mainActivities';
import { ROUTINES } from './routines';

/** The bundled content. Domain functions receive it as a parameter, never import it. */
export const CATALOG: Catalog = {
  exercises: EXERCISES,
  routines: ROUTINES,
  mainActivities: MAIN_ACTIVITIES,
};
