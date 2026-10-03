import { Link, Navigate, useParams } from 'react-router';
import { pausePath, ROUTES } from '@/app/routes';
import { isOpen } from '@/domain/pause/window';
import { contentName } from '@/features/day/contentName';
import { PauseContentView } from '@/features/day/PauseContentView';
import { useT } from '@/i18n/useT';
import { selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ProgressRing } from '@/ui/components/ProgressRing/ProgressRing';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './pause.module.css';

/** The most evolved avatar shows every exercise (one set of art for all phases). */
const DEMO_PHASE = 5;

/**
 * /pause/:id/play — the exercise after "Vamos": the avatar showing the move, the timer
 * ring and the steps below. The timer runs and completes with the exercise player.
 */
export function PlayScreen() {
  const { t, locale } = useT();
  const { id = '' } = useParams();
  const activity = useAppStore(selectActivity(id));

  if (!activity) return <Navigate to={ROUTES.today} replace />;
  if (activity.startedAt === undefined || !isOpen(activity)) {
    return <Navigate to={pausePath(id)} replace />;
  }

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={<ScreenHeader title={contentName(activity.content, locale)} />}
      footer={
        <Link
          to={ROUTES.today}
          className={buttonClassName({ variant: 'secondary', size: 'lg', fullWidth: true })}
        >
          {t('pause.states.back')}
        </Link>
      }
    >
      <AvatarStage phase={DEMO_PHASE} pose="demo" label={t('pause.demo')} />
      <div className={styles.timer}>
        <ProgressRing progress={0} label={t('pause.timer')}>
          <span className={styles.time}>{formatTimer(activity.durationSec)}</span>
        </ProgressRing>
      </div>
      <PauseContentView content={activity.content} slot={activity.slot} hideSingleDuration />
    </FlowLayout>
  );
}

/** '0:40', '1:30'. */
function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
