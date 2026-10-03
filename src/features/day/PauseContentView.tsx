import { CATALOG } from '@/content/catalog';
import type { ActivityContent, ActivitySlot, Exercise } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import styles from './day.module.css';

interface PauseContentViewProps {
  content: ActivityContent;
  /** In a meeting the moves stay discreet: no "better standing" advice. */
  slot?: ActivitySlot;
  /** Skip a single exercise's length when a timer already shows it. */
  hideSingleDuration?: boolean;
}

/** The exercises of a pause, step by step (a routine shows each of its moves). */
export function PauseContentView({
  content,
  slot,
  hideSingleDuration = false,
}: PauseContentViewProps) {
  const { t, locale } = useT();
  const items = contentItems(content);
  return (
    <div className={styles.sheetBody}>
      {items.map(({ exercise, seconds }, index) => (
        <section key={`${exercise.id}-${index}`} className={styles.exercise}>
          {/* A single exercise is already the title of the screen or sheet. */}
          {items.length > 1 ? (
            <h3 className={styles.exerciseName}>
              {exercise.name[locale]}
              <span className={styles.muted}> · {t('common.seconds', { count: seconds })}</span>
            </h3>
          ) : (
            !hideSingleDuration && (
              <p className={styles.exerciseName}>{t('common.seconds', { count: seconds })}</p>
            )
          )}
          <p className={styles.muted}>{exercise.description[locale]}</p>
          {exercise.steps.length > 0 && (
            <ol className={styles.steps} aria-label={t('pause.howTo')}>
              {exercise.steps.map((step, stepIndex) => (
                <li key={stepIndex}>{step[locale]}</li>
              ))}
            </ol>
          )}
        </section>
      ))}
      {slot !== 'meeting' && items.some(({ exercise }) => exercise.posture === 'either') && (
        <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>
      )}
    </div>
  );
}

function contentItems(content: ActivityContent): { exercise: Exercise; seconds: number }[] {
  const exercises = (ids: readonly string[]) =>
    ids
      .map((id) => CATALOG.exercises.find((exercise) => exercise.id === id))
      .filter((exercise): exercise is Exercise => exercise !== undefined);
  if (content.kind === 'exercises') {
    return exercises(content.exerciseIds).map((exercise) => ({
      exercise,
      seconds: exercise.durationSec,
    }));
  }
  if (content.kind === 'routine') {
    const routineId = content.routineId;
    const routine = CATALOG.routines.find((item) => item.id === routineId);
    return (routine?.steps ?? []).flatMap((step) =>
      exercises([step.exerciseId]).map((exercise) => ({ exercise, seconds: step.seconds })),
    );
  }
  return [];
}
