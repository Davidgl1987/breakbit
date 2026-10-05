import { mainActivityOf } from '@/domain/day/today';
import type { DayPlan } from '@/domain/types';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { mainActivityIcon } from './catalogDisplay';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { mainActivityInfo, mainWhere } from './mainActivity';
import styles from './MainActivityCard.module.css';

interface MainActivityCardProps {
  plan: DayPlan;
  /** Opens "Cambiar actividad"; hidden once the activity has started. */
  onChange?: () => void;
}

/** Today's main activity: what, how long, when, and where it falls. */
export function MainActivityCard({ plan, onChange }: MainActivityCardProps) {
  const { t, locale } = useT();
  const main = mainActivityOf(plan);
  const activity = main && mainActivityInfo(main);
  const done = main?.status === 'completed';
  const locked = !main || main.status !== 'pending' || main.startedAt !== undefined;

  return (
    <Card as="section" className={styles.card}>
      <h3 className={styles.title}>{t('today.mainActivity')}</h3>
      {main && activity ? (
        <div className={styles.content}>
          <PixelIcon name={mainActivityIcon(activity.id)} size={48} />
          <div className={styles.texts}>
            <span className={styles.name}>
              {activity.name[locale]} · {t('common.minutes', { count: main.durationSec / 60 })}
            </span>
            <span className={styles.when}>
              {t('mainActivity.when', {
                time: formatClock(main.currentScheduledAt),
                where: t(`mainActivity.where.${mainWhere(plan, main)}`),
              })}
            </span>
          </div>
        </div>
      ) : (
        <p className={styles.when}>{t('today.noMain')}</p>
      )}
      {done && <StatusBadge status="completed" />}
      {onChange && !locked && (
        <Button variant="secondary" size="sm" onClick={onChange}>
          {t('dayStart.change')}
        </Button>
      )}
    </Card>
  );
}
