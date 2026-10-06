import type { ReactNode } from 'react';
import type { ActivitySlot, Exercise } from '@/domain/types';
import { ActivityHero } from '@/features/day/ActivityHero';
import { areaIcon, areaName } from '@/features/day/catalogDisplay';
import { suggestsStanding } from '@/features/day/contentItems';
import { ExerciseDetails } from '@/features/day/ExerciseDetails';
import { TimerRing } from '@/features/day/TimerRing';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { Tag } from '@/ui/components/Tag/Tag';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import styles from './pause.module.css';
import type { StepTimer } from './useStepTimer';

/** The most evolved avatar shows every exercise (one set of art for all phases). */
const DEMO_PHASE = 5;

interface MovePlayerProps {
  exercise: Exercise;
  timer: StepTimer;
  /** Above the hero: the close button and, in a routine, its progress. */
  top: ReactNode;
  /** Under the title: the routine and the step ("Despertar · Paso 2 de 4"). */
  subtitle?: string;
  /** The last move: its button finishes the pause instead of moving on. */
  last: boolean;
  /** The move after this one, announced at the bottom. */
  following?: Exercise;
  /** In a meeting the moves stay discreet: no "better standing" advice. */
  slot?: ActivitySlot;
}

/**
 * One move as the user does it: the avatar showing it, the timer ring, its areas and
 * steps, and the controls (start, pause, next or done).
 */
export function MovePlayer({
  exercise,
  timer,
  top,
  subtitle,
  last,
  following,
  slot,
}: MovePlayerProps) {
  const { t, locale } = useT();
  return (
    <FlowLayout
      top={top}
      header={
        <ActivityHero
          stage={<AvatarStage phase={DEMO_PHASE} pose="demo" label={t('pause.demo')} />}
          title={exercise.name[locale]}
          name={subtitle}
        />
      }
      footer={
        timer.ready ? (
          <div className={styles.controls}>
            <Button variant="secondary" size="lg" onClick={timer.next}>
              {last ? t('pause.play.done') : t('pause.play.skip')}
            </Button>
            <Button size="lg" onClick={timer.resume}>
              {t('pause.play.start')}
            </Button>
          </div>
        ) : (
          <div className={styles.controls}>
            <Button
              variant="secondary"
              size="lg"
              onClick={timer.running ? timer.pause : timer.resume}
            >
              {timer.running ? t('pause.play.pause') : t('pause.play.resume')}
            </Button>
            <Button size="lg" onClick={timer.next}>
              {last ? t('pause.play.done') : t('pause.play.next')}
            </Button>
          </div>
        )
      }
    >
      {/* A fresh ring per move, so it doesn't sweep back between moves. */}
      <TimerRing
        key={timer.index}
        progress={timer.progress}
        label={t('pause.timer')}
        seconds={timer.remainingSec}
        caption={
          timer.running ? undefined : timer.ready ? t('pause.play.ready') : t('pause.play.paused')
        }
      />
      <div className={styles.pills}>
        {exercise.areas.map((area) => (
          <Tag key={area} icon={areaIcon(area)}>
            {areaName(area, locale)}
          </Tag>
        ))}
      </div>
      <ExerciseDetails exercise={exercise} />
      {suggestsStanding([exercise], slot) && (
        <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>
      )}
      {following && (
        <p className={styles.muted}>{t('pause.play.nextUp', { name: following.name[locale] })}</p>
      )}
    </FlowLayout>
  );
}
