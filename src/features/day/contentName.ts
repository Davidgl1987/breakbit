import { CATALOG } from '@/content/catalog';
import type { ActivityContent, LocaleCode } from '@/domain/types';
import { translate } from '@/i18n/translate';

/**
 * What a pause or activity is called: an exercise, "3 movimientos seguidos" for a combined
 * reset (each move is listed inside), a routine or a main activity.
 */
export function contentName(content: ActivityContent, locale: LocaleCode): string {
  switch (content.kind) {
    case 'exercises': {
      if (content.exerciseIds.length > 1) {
        return translate(locale, 'pause.combined', { count: content.exerciseIds.length });
      }
      const [id] = content.exerciseIds;
      return CATALOG.exercises.find((exercise) => exercise.id === id)?.name[locale] ?? '';
    }
    case 'routine': {
      const routineId = content.routineId;
      return CATALOG.routines.find((routine) => routine.id === routineId)?.name[locale] ?? '';
    }
    case 'main': {
      const activityId = content.activityId;
      return (
        CATALOG.mainActivities.find((activity) => activity.id === activityId)?.name[locale] ?? ''
      );
    }
  }
}
