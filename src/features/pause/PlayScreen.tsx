import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { pauseDonePath, pausePath, ROUTES } from '@/app/routes';
import { isOpen } from '@/domain/pause/window';
import type { ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { contentItems } from '@/features/day/contentItems';
import { useT } from '@/i18n/useT';
import { activityDate, selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { LineIcon } from '@/ui/icons/LineIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { MovePlayer } from './MovePlayer';
import styles from './pause.module.css';
import { useStepTimer } from './useStepTimer';

/**
 * /pause/:id/play — the exercise after "Vamos": the avatar showing the move, the timer
 * ring and the steps. Each move waits for "Empezar", so reading it doesn't eat into its
 * time. A routine or combined reset goes move by move; when the last one ends the pause
 * is completed.
 */
export function PlayScreen() {
  const { id = '' } = useParams();
  const { search } = useLocation();
  const activity = useAppStore(selectActivity(id));

  if (!activity) return <Navigate to={ROUTES.today} replace />;
  if (activity.status === 'completed') {
    return <Navigate to={`${pauseDonePath(id)}${search}`} replace />;
  }
  if (activity.startedAt === undefined || !isOpen(activity)) {
    return <Navigate to={pausePath(id)} replace />;
  }
  return <Player activity={activity} search={search} />;
}

function Player({ activity, search }: { activity: ScheduledActivity; search: string }) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const completePause = useAppStore((state) => state.completePause);
  const items = contentItems(activity.content);
  const timer = useStepTimer(
    items.map((item) => item.seconds),
    (elapsedSec) =>
      runScreenTransition(() => {
        completePause(activityDate(activity.id), activity.id, elapsedSec);
        navigate(`${pauseDonePath(activity.id)}${search}`, { replace: true });
      }),
  );
  const current = items[timer.index];
  if (!current) return <Navigate to={ROUTES.today} replace />;

  const multi = items.length > 1;
  const last = timer.index === items.length - 1;
  const following = items[timer.index + 1];
  const stepLabel = t('pause.play.step', { current: timer.index + 1, total: items.length });
  // A routine done more than once counts its moves per round: "Vuelta 2 · Movimiento 1 de 5".
  const rounds = activity.content.kind === 'routine' ? (activity.content.rounds ?? 1) : 1;
  const perRound = items.length / rounds;
  const round = Math.floor(timer.index / perRound);
  const subtitle = multi
    ? [
        activity.content.kind === 'routine' && contentName(activity.content, locale),
        round > 0 && t('main.round', { round: round + 1 }),
        rounds > 1
          ? t('pause.play.step', { current: (timer.index % perRound) + 1, total: perRound })
          : stepLabel,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <MovePlayer
      exercise={current.exercise}
      timer={timer}
      subtitle={subtitle}
      last={last}
      following={following?.exercise}
      slot={activity.slot}
      top={
        <>
          <IconButton label={t('common.close')} to={ROUTES.today}>
            <LineIcon name="close" size={22} />
          </IconButton>
          {multi && (
            <div className={styles.topProgress}>
              <SegmentedProgress done={timer.index} total={items.length} label={stepLabel} />
            </div>
          )}
        </>
      }
    />
  );
}
