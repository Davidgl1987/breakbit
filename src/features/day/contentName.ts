import { CATALOG } from '@/content/catalog';
import type { ActivityContent, LocaleCode } from '@/domain/types';

/** What a pause or activity is called: an exercise, "A + B", a routine or a main activity. */
export function contentName(content: ActivityContent, locale: LocaleCode): string {
  switch (content.kind) {
    case 'exercises':
      return content.exerciseIds
        .map((id) => CATALOG.exercises.find((exercise) => exercise.id === id)?.name[locale])
        .filter(Boolean)
        .join(' + ');
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
