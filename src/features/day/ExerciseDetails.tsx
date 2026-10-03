import type { Exercise } from '@/domain/types';
import { useT } from '@/i18n/useT';
import styles from './day.module.css';

/** What an exercise is and how to do it: short description and numbered steps. */
export function ExerciseDetails({ exercise }: { exercise: Exercise }) {
  const { t, locale } = useT();
  return (
    <>
      <p className={styles.muted}>{exercise.description[locale]}</p>
      {exercise.steps.length > 0 && (
        <ol className={styles.steps} aria-label={t('pause.howTo')}>
          {exercise.steps.map((step, index) => (
            <li key={index}>{step[locale]}</li>
          ))}
        </ol>
      )}
    </>
  );
}
