import { CATALOG } from '@/content/catalog';
import type { ActivityContent, Exercise } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { contentName } from './contentName';
import styles from './day.module.css';

interface PauseSheetProps {
  content: ActivityContent;
  onClose: () => void;
}

/** "Ver ejercicio": what the next pause asks for, step by step. */
export function PauseSheet({ content, onClose }: PauseSheetProps) {
  const { t, locale } = useT();
  const exercises = (ids: readonly string[]) =>
    ids
      .map((id) => CATALOG.exercises.find((exercise) => exercise.id === id))
      .filter((exercise): exercise is Exercise => exercise !== undefined);

  let items: { exercise: Exercise; seconds: number }[] = [];
  if (content.kind === 'exercises') {
    items = exercises(content.exerciseIds).map((exercise) => ({
      exercise,
      seconds: exercise.durationSec,
    }));
  } else if (content.kind === 'routine') {
    const routineId = content.routineId;
    const routine = CATALOG.routines.find((item) => item.id === routineId);
    items = (routine?.steps ?? []).flatMap((step) =>
      exercises([step.exerciseId]).map((exercise) => ({ exercise, seconds: step.seconds })),
    );
  }

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={contentName(content, locale)}
      actions={
        <Button variant="secondary" fullWidth onClick={onClose}>
          {t('pause.close')}
        </Button>
      }
    >
      <div className={styles.sheetBody}>
        {items.map(({ exercise, seconds }, index) => (
          <section key={`${exercise.id}-${index}`} className={styles.exercise}>
            {/* A single exercise is already the sheet's title. */}
            {items.length > 1 ? (
              <h3 className={styles.exerciseName}>
                {exercise.name[locale]}
                <span className={styles.muted}> · {t('common.seconds', { count: seconds })}</span>
              </h3>
            ) : (
              <p className={styles.exerciseName}>{t('common.seconds', { count: seconds })}</p>
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
        {items.some(({ exercise }) => exercise.posture === 'either') && (
          <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>
        )}
      </div>
    </BottomSheet>
  );
}
