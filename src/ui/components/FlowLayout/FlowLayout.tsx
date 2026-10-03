import type { ReactNode } from 'react';
import styles from './FlowLayout.module.css';

interface FlowLayoutProps {
  /** Above the header: back/close, progress. */
  top?: ReactNode;
  header: ReactNode;
  children: ReactNode;
  /** The main action, kept at the bottom of the screen. */
  footer: ReactNode;
}

/**
 * Full-screen flow (onboarding, start of the day…): header, content and a main action
 * that stays on screen on long pages. At the end of the page the action sits below the
 * content, so it never covers a field.
 */
export function FlowLayout({ top, header, children, footer }: FlowLayoutProps) {
  return (
    <div className={styles.flow}>
      {top && <div className={styles.top}>{top}</div>}
      {header}
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}
