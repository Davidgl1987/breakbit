import { Link, useLocation } from 'react-router';
import type { MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { isRouteActive, ROUTES } from '../routes';
import styles from './BottomNav.module.css';
import { GapFab } from './GapFab';

const TABS: { to: string; icon: IconName; label: MessageKey }[] = [
  { to: ROUTES.today, icon: 'home', label: 'nav.today' },
  { to: ROUTES.progress, icon: 'progress', label: 'nav.progress' },
  { to: ROUTES.settings, icon: 'settings', label: 'nav.settings' },
];

/** Bottom navigation: three centered tabs plus the raised "Tengo un hueco" action. */
export function BottomNav() {
  const { t } = useT();
  const { pathname } = useLocation();

  return (
    <nav aria-label={t('nav.label')} className={styles.nav}>
      <GapFab />
      <ul className={styles.tabs}>
        {TABS.map((tab) => {
          const active = isRouteActive(pathname, tab.to);
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={cx(styles.tab, active && styles.active)}
              >
                <span className={styles.indicator}>
                  <PixelIcon name={tab.icon} size={24} />
                </span>
                <span className={styles.label}>{t(tab.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
