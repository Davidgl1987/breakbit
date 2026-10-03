import type { AvatarPose } from '@/assets/registry';
import type { EvolutionPhase } from '@/domain/types';
import { Avatar } from '../Avatar/Avatar';
import styles from './AvatarStage.module.css';

interface AvatarStageProps {
  phase: EvolutionPhase;
  pose: AvatarPose;
  /** What the art shows, for screen readers. */
  label: string;
}

/**
 * A space reserved for the avatar's art (cheering on the decision screen, showing the
 * move while exercising). Shows the phase placeholder until the final art exists.
 */
export function AvatarStage({ phase, pose, label }: AvatarStageProps) {
  return (
    <div className={styles.stage}>
      <Avatar phase={phase} pose={pose} size="lg" framed={false} label={label} />
    </div>
  );
}
