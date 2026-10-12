import type { ReactNode } from 'react';
import type { AvatarPose } from '@/assets/registry';
import { Card } from '@/ui/components/Card/Card';
import { AvatarScene } from '@/ui/game/AvatarScene/AvatarScene';
import styles from './DaySceneCard.module.css';

/** The same room as the next pause, with a pose for each moment of the workday. */
export function DaySceneCard({
  kicker,
  title,
  children,
  footer,
  pose = 'idle',
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  pose?: AvatarPose;
}) {
  return (
    <Card as="section" className={styles.card}>
      <AvatarScene pose={pose}>
        <span className={styles.kicker}>{kicker}</span>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
      </AvatarScene>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
}
