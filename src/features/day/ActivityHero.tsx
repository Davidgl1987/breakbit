import type { ReactNode } from 'react';
import styles from './ActivityHero.module.css';

interface ActivityHeroProps {
  /** The avatar's stage, full width on top. */
  stage: ReactNode;
  title: string;
  /** What the activity is, under the title. */
  name?: string;
  hint?: string;
}

/** The top of a pause or activity screen: the avatar, a big title and what it is. */
export function ActivityHero({ stage, title, name, hint }: ActivityHeroProps) {
  return (
    <header className={styles.hero}>
      {stage}
      <h1 className={styles.title}>{title}</h1>
      {name && <p className={styles.name}>{name}</p>}
      {hint && <p className={styles.hint}>{hint}</p>}
    </header>
  );
}
