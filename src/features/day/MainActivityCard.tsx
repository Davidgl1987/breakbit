import { mainActivityOf } from '@/domain/day/today';
import type { DayPlan } from '@/domain/types';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { LineIcon } from '@/ui/icons/LineIcon';
import { areaIcon, areaName, mainActivityIcon } from './catalogDisplay';
import { mainActivityInfo, mainWhere } from './mainActivity';
import styles from './MainActivityCard.module.css';

/** Activity preview in preparation: the same hierarchy and watermark as Today. */
export function MainActivityCard({ plan, onChange }: { plan: DayPlan; onChange?: () => void }) {
  const { t, locale } = useT();
  const main = mainActivityOf(plan);
  const activity = main && mainActivityInfo(main);
  const locked = !main || main.status !== 'pending' || main.startedAt !== undefined;
  return (
    <Card as="section" className={styles.card}>
      <h3 className={styles.title}>{t('today.mainActivity')}</h3>
      {main && activity ? (
        <>
          <span className={styles.watermark} aria-hidden="true">
            <PixelIcon name={mainActivityIcon(activity.id)} size={48} />
          </span>
          <strong className={styles.name}>{activity.name[locale]}</strong>
          <div className={styles.zones}>
            {activity.areas?.map((area) => (
              <PixelIcon
                key={area}
                name={areaIcon(area)}
                size={24}
                label={areaName(area, locale)}
              />
            ))}
          </div>
          {main.status === 'completed' && <StatusBadge status="completed" />}
          <div className={styles.bottom}>
            <span className={styles.when}>
              {t('mainActivity.when', {
                time: formatClock(main.currentScheduledAt),
                where: t(`mainActivity.where.${mainWhere(plan, main)}`),
              })}{' '}
              · {t('common.minutes', { count: main.durationSec / 60 })}
            </span>
            {onChange && !locked && (
              <button className={styles.link} onClick={onChange}>
                {t('dayStart.change')} <LineIcon name="chevron-right" size={18} />
              </button>
            )}
          </div>
        </>
      ) : (
        <p className={styles.when}>{t('today.noMain')}</p>
      )}
    </Card>
  );
}
