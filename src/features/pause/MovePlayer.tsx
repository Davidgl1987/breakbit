import type { ReactNode } from 'react';
import type { ActivitySlot, Exercise } from '@/domain/types';
import {
  ActivityGuide,
  ActivityHeading,
  ActivityInstructions,
  ActivityMetadata,
} from '@/features/day/ActivityPresentation';
import { suggestsStanding } from '@/features/day/contentItems';
import { ActivityTimer } from '@/features/day/ActivityTimer';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './pause.module.css';
import type { StepTimer } from './useStepTimer';

interface MovePlayerProps {
  exercise: Exercise;
  timer: StepTimer;
  /** The top row with the existing close button. */
  top: ReactNode;
  /** Under the title: the routine and the step ("Despertar · Paso 2 de 4"). */
  subtitle?: string;
  /** Routine sequence beneath the title and subtitle. */
  progress?: ReactNode;
  /** The last move: its button finishes the pause instead of moving on. */
  last: boolean;
  /** The move after this one, announced at the bottom. */
  following?: Exercise;
  /** In a meeting the moves stay discreet: no "better standing" advice. */
  slot?: ActivitySlot;
}

/**
 * One move as the user does it: the avatar showing it, a separate timer strip, its areas and
 * steps, and the controls (start, pause, next or done).
 */
export function MovePlayer({
  exercise,
  timer,
  top,
  subtitle,
  progress,
  last,
  following,
  slot,
}: MovePlayerProps) {
  const { t, locale } = useT();
  return (
    <FlowLayout
      top={top}
      header={
        <ActivityHeading title={exercise.name[locale]} subtitle={subtitle}>
          {progress}
        </ActivityHeading>
      }
      footer={
        timer.ready ? (
          <div className={styles.controls}>
            <Button variant="secondary" size="lg" onClick={timer.next}>
              {last ? t('pause.play.done') : t('pause.play.skip')}
            </Button>
            <Button size="lg" onClick={timer.resume}>
              <LineIcon name="play" size={18} />
              {t('pause.play.start')}
            </Button>
          </div>
        ) : (
          <div className={styles.controls}>
            <Button
              variant={timer.running ? 'secondary' : 'primary'}
              size="lg"
              onClick={timer.running ? timer.pause : timer.resume}
            >
              <LineIcon name={timer.running ? 'pause' : 'play'} size={18} />
              {timer.running ? t('pause.play.pause') : t('pause.play.resume')}
            </Button>
            <Button
              variant={timer.running ? 'primary' : 'secondary'}
              size="lg"
              onClick={timer.next}
            >
              <LineIcon name={last ? 'check' : 'chevron-right'} size={18} />
              {last ? t('pause.play.done') : t('pause.play.next')}
            </Button>
          </div>
        )
      }
    >
      <ActivityGuide exercise={exercise} controls={false} />
      <ActivityTimer
        key={timer.index}
        progress={timer.progress}
        label={t('pause.timer')}
        seconds={timer.remainingSec}
        status={
          timer.running
            ? t('exerciseUI.running')
            : timer.ready
              ? t('pause.play.ready')
              : t('pause.play.paused')
        }
        caption={timer.running ? t('main.left') : undefined}
      />
      <ActivityMetadata areas={exercise.areas} equipment={exercise.equipment} />
      <ActivityInstructions exercise={exercise} />
      {suggestsStanding([exercise], slot) && (
        <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>
      )}
      {following && (
        <p className={styles.next}>{t('pause.play.nextUp', { name: following.name[locale] })}</p>
      )}
    </FlowLayout>
  );
}
