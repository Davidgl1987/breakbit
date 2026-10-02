import { Outlet } from 'react-router';
import { cx } from '@/ui/cx';
import { BottomNav } from '../navigation/BottomNav';
import styles from './layout.module.css';
import { ScrollToTop } from './ScrollToTop';

/** Top-level screens: content + bottom navigation with the "Tengo un hueco" FAB. */
export function TabsLayout() {
  return (
    <div className={styles.column}>
      <ScrollToTop />
      <main className={cx(styles.main, styles.withNav)}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
