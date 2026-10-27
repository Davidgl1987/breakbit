import type { ReactNode } from 'react';
import { exerciseGuide, movesGuide, type AvatarPose } from '@/assets/registry';
import { EXERCISE_AVATAR } from '@/assets/exerciseGuides';
import type { BodyArea, EquipmentId, EvolutionPhase, Exercise } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import type { IconName } from '@/ui/icons/iconNames';
import { areaIcon, areaName, equipmentIcon, equipmentName } from './catalogDisplay';
import { ExerciseDetails } from './ExerciseDetails';
import { ExerciseGuide } from './ExerciseGuide';
import styles from './ActivityPresentation.module.css';

/** Shared top row; the close affordance remains the existing line X. */
export function ActivityTop({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.top}>
      <span className={styles.eyebrow}>{label}</span>
      {children}
    </div>
  );
}

export function ActivityHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className={styles.heading}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </header>
  );
}

/** Compact scene for an invitation, a prepared activity or its reward. */
export function ActivityScene({
  label,
  title,
  metric,
  hint,
  phase = 5,
  pose = 'demo',
  icon,
  moves = [],
  artLabel,
  children,
}: {
  label: string;
  title: string;
  metric: ReactNode;
  hint?: string;
  phase?: EvolutionPhase;
  pose?: AvatarPose;
  icon?: IconName;
  /** A guided activity's moves: shown in turn, moving, instead of its icon. */
  moves?: readonly Exercise[];
  artLabel?: string;
  children?: ReactNode;
}) {
  return (
    <Card as="section" variant="tinted" className={styles.scene}>
      <span className={styles.kicker}>{label}</span>
      <h2>{title}</h2>
      <div className={styles.metric}>{metric}</div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {moves.length > 0 ? (
        <div className={`${styles.art} ${styles.preview}`}>
          <MovesPreview exercises={moves} />
        </div>
      ) : (
        <span className={styles.art} aria-hidden={artLabel ? undefined : true}>
          {icon ? (
            <PixelIcon name={icon} size={48} className={styles.activityArt} />
          ) : (
            <Avatar phase={phase} pose={pose} size="lg" framed={false} label={artLabel} />
          )}
        </span>
      )}
      {children}
    </Card>
  );
}

/**
 * The complete guide area is reserved for art. Time and controls always sit outside.
 * `controls`: the guide's own posture navigation, play/pause and caption (previews keep
 * them; the exercise screen shows only the moving art). `icon`: what an activity without
 * moves (a walk, standing work) shows instead of the generic avatar.
 */
export function ActivityGuide({
  exercise,
  controls = true,
  icon,
}: {
  exercise?: Exercise;
  controls?: boolean;
  icon?: IconName;
}) {
  const { t } = useT();
  const guide = exercise && exerciseGuide(exercise.id);
  if (guide) return <ExerciseGuide key={exercise.id} guide={guide} controls={controls} />;
  if (icon) {
    return (
      <div className={styles.guide}>
        <PixelIcon name={icon} size={48} className={styles.guideIcon} />
      </div>
    );
  }
  return (
    <div className={styles.guide}>
      <img src={EXERCISE_AVATAR} alt={t('pause.demo')} draggable={false} />
    </div>
  );
}

/**
 * A moving preview of what a pause or a guided activity holds: each of its moves in turn,
 * art only. Small inside a card (`compact`), or in the guide's own frame.
 */
export function MovesPreview({
  exercises,
  compact = true,
}: {
  exercises: readonly Exercise[];
  compact?: boolean;
}) {
  const { t } = useT();
  const ids = exercises.map((exercise) => exercise.id);
  const guide = movesGuide(ids);
  if (guide) {
    return <ExerciseGuide key={ids.join()} guide={guide} controls={false} compact={compact} />;
  }
  return <img src={EXERCISE_AVATAR} alt={t('pause.demo')} draggable={false} />;
}

export function ActivityMetadata({
  areas,
  equipment,
}: {
  areas: readonly BodyArea[];
  equipment: readonly EquipmentId[];
}) {
  const { t, locale } = useT();
  return (
    <dl className={styles.metadata}>
      {areas.length > 0 && (
        <div>
          <dt>{t('gap.preview.areas')}</dt>
          <dd>
            {[...new Set(areas)].map((area) => (
              <span key={area}>
                <PixelIcon name={areaIcon(area)} size={24} />
                {areaName(area, locale)}
              </span>
            ))}
          </dd>
        </div>
      )}
      <div>
        <dt>{t('gap.preview.equipment')}</dt>
        <dd>
          {equipment.length > 0
            ? [...new Set(equipment)].map((gear) => (
                <span key={gear}>
                  <PixelIcon name={equipmentIcon(gear)} size={24} />
                  {equipmentName(gear, locale)}
                </span>
              ))
            : t('gap.preview.noEquipment')}
        </dd>
      </div>
    </dl>
  );
}

export function ActivityInstructions({
  exercise,
}: {
  exercise: Pick<Exercise, 'description' | 'steps'>;
}) {
  const { t } = useT();
  return (
    <section className={styles.instructions}>
      <h2>{t('pause.howTo')}</h2>
      <ExerciseDetails exercise={exercise} />
    </section>
  );
}
