import { Outlet, useLocation } from 'react-router';
import { DuePauseBanner } from '@/features/pause/DuePauseBanner';
import { cx } from '@/ui/cx';
import { BottomNav } from '../navigation/BottomNav';
import styles from './layout.module.css';

/** Top-level screens: content + bottom navigation with the "Tengo un hueco" FAB. */
export function TabsLayout() {
  const { pathname } = useLocation();
  return (
    <div className={styles.column}>
      <main className={cx(styles.main, styles.withNav)}>
        {/* Today's next-pause card already shows a due pause. */}
        {pathname !== '/' && <DuePauseBanner />}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
