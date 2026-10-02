import { Outlet } from 'react-router';
import styles from './layout.module.css';
import { ScrollToTop } from './ScrollToTop';

/** Focused flows (exercise, end of day…): no bottom navigation. */
export function FullscreenLayout() {
  return (
    <div className={styles.column}>
      <ScrollToTop />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
