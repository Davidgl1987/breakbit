import type { ActivityContent, ActivitySlot } from '@/domain/types';
import { formatSeconds } from '@/i18n/translate';
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

/**
 * The exercises of a pause, step by step (a routine shows each of its moves; one done more
 * than once, its sequence and how many rounds).
 */
export function PauseContentView({ content, slot }: PauseContentViewProps) {
  const { t, locale } = useT();
  const rounds = content.kind === 'routine' ? (content.rounds ?? 1) : 1;
  const items = contentItems(content.kind === 'routine' ? { ...content, rounds: 1 } : content);
  return (
    <div className={styles.sheetBody}>
      {rounds > 1 && <p className={styles.exerciseName}>{t('pause.rounds', { count: rounds })}</p>}
      {items.map(({ exercise, seconds }, index) => (
        <section key={`${exercise.id}-${index}`} className={styles.exercise}>
          {/* A single exercise is already the title of the screen or sheet. */}
          {items.length > 1 ? (
            <h3 className={styles.exerciseName}>
              {exercise.name[locale]}
              <span className={styles.muted}> · {formatSeconds(seconds)}</span>
            </h3>
          ) : (
            <p className={styles.exerciseName}>{formatSeconds(seconds)}</p>
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
