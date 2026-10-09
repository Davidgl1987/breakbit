import type { ReactNode } from 'react';
import { useAppStore } from '@/state/store';
import { Avatar } from '../Avatar/Avatar';
import styles from './AvatarScene.module.css';

/** A shared room scene for today's pause and the avatar's evolution. */
export function AvatarScene({ children }: { children: ReactNode }) {
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  return (
    <div className={styles.scene}>
      <div className={styles.copy}>{children}</div>
      <span className={styles.window} aria-hidden="true" />
      <div className={styles.art}>
        <Avatar phase={phase} size="xl" framed={false} />
      </div>
    </div>
  );
}
