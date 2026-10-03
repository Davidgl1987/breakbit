import type { ActivityContent, ActivitySlot } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { contentItems, suggestsStanding } from './contentItems';
import styles from './day.module.css';
import { ExerciseDetails } from './ExerciseDetails';

interface PauseContentViewProps {
  content: ActivityContent;
  /** In a meeting the moves stay discreet: no "better standing" advice. */
  slot?: ActivitySlot;
}

/** The exercises of a pause, step by step (a routine shows each of its moves). */
export function PauseContentView({ content, slot }: PauseContentViewProps) {
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
            <p className={styles.exerciseName}>{t('common.seconds', { count: seconds })}</p>
          )}
          <ExerciseDetails exercise={exercise} />
        </section>
      ))}
      {suggestsStanding(
        items.map((item) => item.exercise),
        slot,
      ) && <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>}
    </div>
  );
}
