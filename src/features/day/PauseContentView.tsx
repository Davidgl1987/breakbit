import { useState } from 'react';
import type { ActivityContent, ActivitySlot, Exercise } from '@/domain/types';
import { formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { LineIcon } from '@/ui/icons/LineIcon';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { contentItems, suggestsStanding } from './contentItems';
import styles from './day.module.css';
import { ExerciseDetails } from './ExerciseDetails';
import { ActivityGuide } from './ActivityPresentation';

interface PauseContentViewProps {
  content: ActivityContent;
  /** In a meeting the moves stay discreet: no "better standing" advice. */
  slot?: ActivitySlot;
  /** Compact preview: expand each move to read its steps. Players keep all steps visible. */
  collapsible?: boolean;
  /** Show the same pausable demonstration used by the exercise player. */
  showGuides?: boolean;
}

/**
 * The exercises of a pause, step by step (a routine shows each of its moves; one done more
 * than once, its sequence and how many rounds).
 */
export function PauseContentView({
  content,
  slot,
  collapsible = false,
  showGuides = false,
}: PauseContentViewProps) {
  const { t, locale } = useT();
  const [expandedMove, setExpandedMove] = useState<string | null>(null);
  const setMoveOpen = (key: string, open: boolean) =>
    setExpandedMove((current) => (open ? key : current === key ? null : current));
  const rounds = content.kind === 'routine' ? (content.rounds ?? 1) : 1;
  const items = contentItems(content.kind === 'routine' ? { ...content, rounds: 1 } : content);
  return (
    <div className={styles.sheetBody}>
      {rounds > 1 && <p className={styles.exerciseName}>{t('pause.rounds', { count: rounds })}</p>}
      {items.map(({ exercise, seconds }, index) =>
        collapsible && items.length > 1 ? (
          <ExpandableMove
            key={`${exercise.id}-${index}`}
            exercise={exercise}
            index={index}
            seconds={seconds}
            showGuide={showGuides}
            open={expandedMove === `${exercise.id}-${index}`}
            onOpenChange={(open) => setMoveOpen(`${exercise.id}-${index}`, open)}
          />
        ) : (
          <section
            key={`${exercise.id}-${index}`}
            className={showGuides ? `${styles.exercise} ${styles.guidedExercise}` : styles.exercise}
          >
            {/* A single exercise is already the title of the screen or sheet. */}
            {items.length > 1 ? (
              <h3 className={styles.exerciseName}>
                {exercise.name[locale]}
                <span className={styles.muted}> · {formatSeconds(seconds)}</span>
              </h3>
            ) : (
              <p className={styles.exerciseName}>{formatSeconds(seconds)}</p>
            )}
            {showGuides && <ActivityGuide exercise={exercise} />}
            <ExerciseDetails exercise={exercise} />
          </section>
        ),
      )}
      {suggestsStanding(
        items.map((item) => item.exercise),
        slot,
      ) && <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>}
    </div>
  );
}

/** Only mount a demonstration while its move is expanded: closed guides stay idle. */
function ExpandableMove({
  exercise,
  seconds,
  index,
  showGuide,
  open,
  onOpenChange,
}: {
  exercise: Exercise;
  seconds: number;
  index: number;
  showGuide: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, locale } = useT();
  return (
    <details
      className={styles.move}
      open={open}
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
    >
      <summary>
        <span className={styles.moveNumber} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={styles.moveCopy}>
          <strong>{exercise.name[locale]}</strong>
          <span className={styles.muted}>
            {formatSeconds(seconds)} · {t('gap.preview.steps')}
          </span>
        </span>
        <LineIcon name="chevron-down" size={18} className={styles.moveArrow} />
      </summary>
      <div className={styles.moveDetails}>
        {showGuide && open && <ActivityGuide exercise={exercise} />}
        <ExerciseDetails exercise={exercise} />
      </div>
    </details>
  );
}
