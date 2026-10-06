import { useRef, useState } from 'react';
import { exerciseVisual } from '@/assets/registry';
import { CATALOG } from '@/content/catalog';
import type { Exercise } from '@/domain/types';
import { areaIcon, areaName, equipmentIcon, equipmentName } from '@/features/day/catalogDisplay';
import { MovePlayer } from '@/features/pause/MovePlayer';
import { useStepTimer } from '@/features/pause/useStepTimer';
import { formatSeconds, formatTimer } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Tag } from '@/ui/components/Tag/Tag';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './ExerciseLab.module.css';
import { ReviewCard } from './ReviewCard';
import type { ExerciseReview, ReviewPatch } from './reviews';

interface ExerciseViewProps {
  exercise: Exercise;
  review: ExerciseReview | undefined;
  onReview: (patch: ReviewPatch) => void;
  onNext: () => void;
  canGoNext: boolean;
}

/**
 * One exercise in the lab: the user's screen to try it with its real timer, the review
 * and the catalog details. Finishing a trial marks it tried and brings up the review.
 */
export function ExerciseView({ exercise, review, onReview, onNext, canGoNext }: ExerciseViewProps) {
  // A new trial is a fresh timer.
  const [trial, setTrial] = useState(0);
  const [justTried, setJustTried] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  const finish = () => {
    onReview({ tested: true });
    setJustTried(true);
    setTrial((count) => count + 1);
    reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.detail}>
      <Trial
        key={trial}
        exercise={exercise}
        onFinish={finish}
        onRestart={() => setTrial((count) => count + 1)}
      />
      <div className={styles.sheet}>
        <div ref={reviewRef} className={styles.anchor}>
          <ReviewCard
            review={review}
            onReview={onReview}
            onNext={onNext}
            canGoNext={canGoNext}
            justTried={justTried}
          />
        </div>
        <ExerciseFacts exercise={exercise} />
      </div>
    </div>
  );
}

/**
 * The exercise exactly as the pause screen shows it, in a phone-sized frame, with the
 * tester's own start and finish above. Closing it starts the trial over.
 */
function Trial({
  exercise,
  onFinish,
  onRestart,
}: {
  exercise: Exercise;
  onFinish: () => void;
  onRestart: () => void;
}) {
  const { t } = useT();
  const timer = useStepTimer([exercise.durationSec], onFinish);
  const time = formatTimer(timer.remainingSec);

  return (
    <section className={styles.trial} aria-label={t('lab.trial.preview')}>
      <div className={styles.trialBar}>
        {timer.ready ? (
          <Button size="lg" fullWidth onClick={timer.resume} iconStart={<LineIcon name="play" />}>
            {t('lab.trial.start')}
          </Button>
        ) : (
          <>
            <span className={styles.trialTime} aria-live="off">
              {timer.running ? t('lab.trial.remaining', { time }) : t('lab.trial.paused', { time })}
            </span>
            <Button onClick={timer.next}>{t('lab.trial.finish')}</Button>
          </>
        )}
      </div>
      <div className={styles.phone}>
        <MovePlayer
          exercise={exercise}
          timer={timer}
          last
          top={
            <IconButton label={t('lab.trial.restart')} onClick={onRestart}>
              <LineIcon name="close" size={22} />
            </IconButton>
          }
        />
      </div>
    </section>
  );
}

/** Everything the catalog says about the exercise, and its visual (or that it has none). */
function ExerciseFacts({ exercise }: { exercise: Exercise }) {
  const { t, locale } = useT();
  const routines = CATALOG.routines.filter((routine) =>
    routine.steps.some((step) => step.exercise === exercise.id),
  );
  const visual = exerciseVisual(exercise.id);

  return (
    <Card as="section" className={styles.card}>
      <h2 className={styles.cardTitle}>{t('lab.facts.title')}</h2>
      <dl className={styles.facts}>
        <dt>{t('lab.facts.duration')}</dt>
        <dd>{formatSeconds(exercise.durationSec)}</dd>
        <dt>{t('lab.facts.areas')}</dt>
        <dd className={styles.tags}>
          {exercise.areas.map((area, index) => (
            <Tag key={area} icon={areaIcon(area)}>
              {index === 0 && exercise.areas.length > 1
                ? t('lab.facts.mainArea', { name: areaName(area, locale) })
                : areaName(area, locale)}
            </Tag>
          ))}
        </dd>
        <dt>{t('lab.facts.equipment')}</dt>
        <dd className={styles.tags}>
          {exercise.equipment.length === 0
            ? t('lab.facts.noEquipment')
            : exercise.equipment.map((id) => (
                <Tag key={id} icon={equipmentIcon(id)}>
                  {equipmentName(id, locale)}
                </Tag>
              ))}
        </dd>
        <dt>{t('lab.facts.posture')}</dt>
        <dd>{t(`lab.posture.${exercise.posture}`)}</dd>
        <dt>{t('lab.facts.meetings')}</dt>
        <dd>{t(`lab.meetingFriendly.${exercise.meetingFriendly}`)}</dd>
        <dt>{t('lab.facts.routines')}</dt>
        <dd>
          {routines.length > 0
            ? routines.map((routine) => routine.name[locale]).join(', ')
            : t('lab.facts.noRoutines')}
        </dd>
        <dt>{t('lab.facts.id')}</dt>
        <dd>
          <code>{exercise.id}</code>
        </dd>
      </dl>
      <div className={styles.visual}>
        <h3 className={styles.label}>{t('lab.facts.visual')}</h3>
        {visual ? (
          <img src={visual} alt={exercise.name[locale]} className={styles.visualArt} />
        ) : (
          <p className={styles.visualEmpty}>{t('lab.facts.noVisual')}</p>
        )}
      </div>
    </Card>
  );
}
