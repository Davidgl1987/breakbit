import type { ReactNode } from 'react';
import styles from './ActivityHero.module.css';

interface ActivityHeroProps {
  /** The avatar's stage, full width on top. */
  stage: ReactNode;
  /** Above the title, under the image (a tag: "Propuesta de 1 minuto"). */
  eyebrow?: ReactNode;
  title: string;
  /** What the activity is, under the title. */
  name?: string;
  hint?: string;
}

/**
 * The top of a pause, activity or "Tengo un hueco" screen, the same everywhere: the
 * avatar, a big title and what it is (the close button sits above, in the flow's top).
 */
export function ActivityHero({ stage, eyebrow, title, name, hint }: ActivityHeroProps) {
  return (
    <header className={styles.hero}>
      {stage}
      {eyebrow}
      <h1 className={styles.title}>{title}</h1>
      {name && <p className={styles.name}>{name}</p>}
      {hint && <p className={styles.hint}>{hint}</p>}
    </header>
  );
}
