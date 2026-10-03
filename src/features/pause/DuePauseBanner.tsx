import { Link } from 'react-router';
import { pausePath } from '@/app/routes';
import { isDue } from '@/domain/pause/window';
import { toDateKey } from '@/domain/time';
import { contentName } from '@/features/day/contentName';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './pause.module.css';

/**
 * In-app reminder while a pause is due, on every tab but Today (whose next-pause card
 * already shows it). Also the only reminder when notifications are off or blocked.
 */
export function DuePauseBanner() {
  const { t, locale } = useT();
  const now = useNow(5_000);
  const date = toDateKey(now);
  const plan = useAppStore((state) =>
    state.days[date]?.status === 'active' ? state.days[date]?.plan : undefined,
  );
  const due = plan?.activities.find((item) => isDue(item, now));
  if (!due) return null;

  return (
    <Card variant="tinted" className={styles.banner} role="status">
      <PixelIcon name="stretch" size={32} />
      <div className={styles.bannerTexts}>
        <strong>{t('pause.banner')}</strong>
        <span className={styles.muted}>{contentName(due.content, locale)}</span>
      </div>
      <Link to={pausePath(due.id)} className={buttonClassName({ size: 'sm' })}>
        {t('pause.go')}
      </Link>
    </Card>
  );
}
