import type { ReactNode } from 'react';
import type { AvatarPose } from '@/assets/registry';
import { useAppStore } from '@/state/store';
import { Avatar } from '../Avatar/Avatar';
import styles from './AvatarScene.module.css';

/** A shared avatar scene for the workday, rest and evolution. */
export function AvatarScene({
  children,
  pose = 'idle',
}: {
  children: ReactNode;
  pose?: AvatarPose;
}) {
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  return (
    <div className={styles.scene}>
      <div className={styles.copy}>{children}</div>
      {pose !== 'sleep' && pose !== 'rest' && <span className={styles.window} aria-hidden="true" />}
      <div className={styles.art}>
        <Avatar phase={phase} pose={pose} size="xl" framed={false} />
      </div>
    </div>
  );
}
