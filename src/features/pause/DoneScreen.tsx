import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { pausePath, ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { dayProgress } from '@/domain/day/progress';
import { XP } from '@/domain/config';
import type { ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { useT } from '@/i18n/useT';
import { activityDate, selectActivity, useLevel } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { Celebration } from '@/ui/game/Celebration/Celebration';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './pause.module.css';

/**
 * /pause/:id/done — the pause is done: a small celebration, the XP it earned, and how
 * the day and the level are going. Then back to work.
 */
export function DoneScreen() {
  const { id = '' } = useParams();
  const activity = useAppStore(selectActivity(id));
  if (!activity) return <Navigate to={ROUTES.today} replace />;
  if (activity.status !== 'completed') return <Navigate to={pausePath(id)} replace />;
  return <Done activity={activity} />;
}

function Done({ activity }: { activity: ScheduledActivity }) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const { search } = useLocation();
  const fromNotification = new URLSearchParams(search).get('src') === 'notif';
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const plan = useAppStore((state) => state.days[activityDate(activity.id)]?.plan);
  const xpEntries = useAppStore((state) => state.xpLedger).filter(
    (entry) => entry.key === `micro:${activity.id}` || entry.key === `first:${activity.id}`,
  );
  const level = useLevel();
  const base = xpEntries.find((entry) => entry.reason === 'microbreak');
  const first = xpEntries.find((entry) => entry.reason === 'first_prompt');
  const total = xpEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const progress = plan && dayProgress(plan, CATALOG);

  const back = () => {
    // Opened from a notification: try to give the screen back to whatever was there.
    if (fromNotification) window.close();
    navigate(ROUTES.today, { replace: true });
    if (fromNotification) showToast(t('toasts.backToWork'), 'success');
  };

  return (
    <FlowLayout
      header={
        <header className={styles.hero}>
          <AvatarStage phase={phase} pose="celebrate" label={t('pause.done.stage')}>
            <Celebration />
          </AvatarStage>
          <h1 className={styles.title}>{t('pause.done.title')}</h1>
          {/* The time actually moved is kept for the stats, not shown off here. */}
          <p className={styles.name}>{contentName(activity.content, locale)}</p>
        </header>
      }
      footer={
        <Button size="lg" fullWidth onClick={back}>
          {t('pause.done.back')}
        </Button>
      }
    >
      <Card as="section" variant="tinted" className={styles.xpCard}>
        <p className={styles.xpTotal}>
          <PixelIcon name="xp" size={32} />
          {t('pause.done.xp', { xp: total })}
        </p>
        <p className={styles.breakdown}>
          {[
            base &&
              t(base.amount > XP.microbreak ? 'pause.done.returnBonus' : 'pause.done.pause', {
                xp: base.amount,
              }),
            first && t('pause.done.firstTry', { xp: first.amount }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </Card>

      <Card as="section" className={styles.progressCard}>
        {progress && progress.planned > 0 && (
          <div className={styles.progressRow}>
            <div className={styles.progressHead}>
              <strong>{t('pause.done.today')}</strong>
              <span className={styles.muted}>
                {t('common.pausesOf', { done: progress.completed, total: progress.planned })}
              </span>
            </div>
            <SegmentedProgress
              done={progress.completed}
              total={progress.planned}
              label={t('common.pausesOf', { done: progress.completed, total: progress.planned })}
            />
          </div>
        )}
        <div className={styles.progressRow}>
          <div className={styles.progressHead}>
            <strong>{t('today.level', { level: level.level })}</strong>
            <span className={styles.muted}>
              {t('today.xpOf', { current: level.current, total: level.needed })}
            </span>
          </div>
          <ProgressBar
            value={level.current}
            max={level.needed}
            label={t('today.level', { level: level.level })}
          />
        </div>
      </Card>
    </FlowLayout>
  );
}
