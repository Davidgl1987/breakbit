import { Link } from 'react-router';
import { mainPath } from '@/app/routes';
import { mainActivityOf } from '@/domain/day/today';
import { isMainRunning, mainElapsedSec } from '@/domain/main/session';
import { isOpen } from '@/domain/pause/window';
import type { DayPlan, Instant } from '@/domain/types';
import { mainActivityInfo } from '@/features/day/mainActivity';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { mainActivityIcon, equipmentIcon, equipmentName } from '@/features/day/catalogDisplay';
import { PixelIcon } from '@/ui/icons/PixelIcon';
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
    >
      {info.equipment[0] && (
        <span className={styles.watermark}>
          <PixelIcon
            name={equipmentIcon(info.equipment[0])}
            size={48}
            label={equipmentName(info.equipment[0], locale)}
          />
        </span>
      )}
      <h3 className={styles.cardTitle}>{t('today.mainActivity')}</h3>
      <div className={styles.halfBody}>
        <PixelIcon name={mainActivityIcon(info.id)} size={32} />
        {!done && <span className={styles.big}>{when}</span>}
        <span className={styles.small}>
          {info.name[locale]} · {t('common.minutes', { count: totalMin })}
        </span>
        {started && (
          <>
            <span className={styles.small}>{progress}</span>
            <ProgressBar value={doneMin} max={totalMin} label={progress} />
          </>
        )}
        {done && <StatusBadge status="completed" />}
      </div>
      {!done && !started && !due ? (
        <Button variant="secondary" size="sm" onClick={onEdit}>
          {t('today.seeActivity')}
        </Button>
      ) : (
        !done && (
          <Link
            to={mainPath(main.id)}
            className={buttonClassName({
              variant: due || started ? 'primary' : 'secondary',
              size: 'sm',
              fullWidth: true,
            })}
          >
            {started ? t('pause.continue') : due ? t('pause.go') : t('today.seeActivity')}
          </Link>
        )
      )}
    </Card>
  );
}
