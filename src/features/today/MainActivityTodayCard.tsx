import { Link } from 'react-router';
import { mainDonePath, mainPath } from '@/app/routes';
import { mainActivityOf } from '@/domain/day/today';
import { isMainRunning, mainElapsedSec } from '@/domain/main/session';
import { isOpen } from '@/domain/pause/window';
import type { DayPlan, Instant } from '@/domain/types';
import { mainActivityInfo } from '@/features/day/mainActivity';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { mainActivityIcon, areaIcon, areaName } from '@/features/day/catalogDisplay';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './TodayScreen.module.css';

/**
 * "Actividad de hoy" on Today: what and when, then the way in ("Vamos" once its time has
 * come) or back to a session under way ("Continuar", with the time done so far).
 */
export function MainActivityTodayCard({
  plan,
  now,
  onEdit,
}: {
  plan: DayPlan;
  now: Instant;
  onEdit: () => void;
}) {
  const { t, locale } = useT();
  const main = mainActivityOf(plan);
  const info = main && mainActivityInfo(main);
  if (!main || !info) {
    return (
      <Card as="section" className={styles.halfCard}>
        <h3 className={styles.cardTitle}>{t('today.mainActivity')}</h3>
        <p className={styles.muted}>{t('today.noMain')}</p>
      </Card>
    );
  }

  const done = main.status === 'completed';
  const started = main.startedAt !== undefined && isOpen(main);
  const due = !started && isOpen(main) && now >= main.currentScheduledAt;
  const totalMin = main.durationSec / 60;
  const doneMin = Math.floor(mainElapsedSec(main, now) / 60);
  const progress = t('today.mainProgress', { done: doneMin, total: totalMin });
  const when = started
    ? isMainRunning(main)
      ? t('pause.inProgress')
      : t('main.paused')
    : due
      ? t('today.mainNow')
      : t('today.mainAt', { time: formatClock(main.currentScheduledAt) });

  return (
    <Card
      as="section"
      variant={due || started ? 'tinted' : 'standard'}
      className={styles.activityCard}
      aria-label={t('today.mainActivity')}
    >
      <span className={styles.watermark} aria-hidden="true">
        <PixelIcon name={mainActivityIcon(info.id)} size={48} />
      </span>
      <h3 className={styles.activityTitle}>{info.name[locale]}</h3>
      <div className={styles.activityZones}>
        {info.areas?.map((area) => (
          <span key={area} title={areaName(area, locale)}>
            <PixelIcon name={areaIcon(area)} size={24} label={areaName(area, locale)} />
          </span>
        ))}
      </div>
      <div className={styles.halfBody}>
        {started && (
          <>
            <span className={styles.small}>{progress}</span>
            <ProgressBar value={doneMin} max={totalMin} label={progress} />
          </>
        )}
        {done && <StatusBadge status="completed" />}
      </div>
      <div className={styles.activityBottom}>
        <span className={styles.small}>
          {when} · {t('common.minutes', { count: totalMin })}
        </span>
        {!done && !started && !due ? (
          <button className={styles.actionLink} onClick={onEdit}>
            {t('today.seeActivity')} <LineIcon name="chevron-right" size={18} />
          </button>
        ) : (
          <Link to={done ? mainDonePath(main.id) : mainPath(main.id)} className={styles.actionLink}>
            {done ? t('today.seeActivity') : started ? t('pause.continue') : t('pause.go')}
            <LineIcon name="chevron-right" size={18} />
          </Link>
        )}
      </div>
    </Card>
  );
}
