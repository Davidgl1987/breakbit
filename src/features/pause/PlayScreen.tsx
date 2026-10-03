import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { pauseDonePath, pausePath, ROUTES } from '@/app/routes';
import { isOpen } from '@/domain/pause/window';
import type { ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { contentItems, suggestsStanding } from '@/features/day/contentItems';
import { ExerciseDetails } from '@/features/day/ExerciseDetails';
import { TimerRing } from '@/features/day/TimerRing';
import { useT } from '@/i18n/useT';
import { activityDate, selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { Tag } from '@/ui/components/Tag/Tag';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { AREA_ICONS } from '@/ui/icons/domainIcons';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './pause.module.css';
import { useStepTimer } from './useStepTimer';

/** The most evolved avatar shows every exercise (one set of art for all phases). */
const DEMO_PHASE = 5;

/**
 * /pause/:id/play — the exercise after "Vamos": the avatar showing the move, the timer
 * ring and the steps. A routine or combined reset goes move by move; when the last one
 * ends the pause is completed.
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
    (elapsedSec) => {
      completePause(activityDate(activity.id), activity.id, elapsedSec);
      navigate(`${pauseDonePath(activity.id)}${search}`, { replace: true });
    },
  );
  const current = items[timer.index];
  if (!current) return <Navigate to={ROUTES.today} replace />;

  const multi = items.length > 1;
  const last = timer.index === items.length - 1;
  const following = items[timer.index + 1];
  const stepLabel = t('pause.play.step', { current: timer.index + 1, total: items.length });
  const subtitle = multi
    ? [activity.content.kind === 'routine' && contentName(activity.content, locale), stepLabel]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={<ScreenHeader title={current.exercise.name[locale]} subtitle={subtitle} />}
      footer={
        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="lg"
            onClick={timer.running ? timer.pause : timer.resume}
          >
            {timer.running ? t('pause.play.pause') : t('pause.play.resume')}
          </Button>
          <Button size="lg" onClick={timer.next}>
            {last ? t('pause.play.done') : t('pause.play.next')}
          </Button>
        </div>
      }
    >
      {multi && <SegmentedProgress done={timer.index} total={items.length} label={stepLabel} />}
      <AvatarStage phase={DEMO_PHASE} pose="demo" label={t('pause.demo')} />
      {/* A fresh ring per move, so it doesn't sweep back between moves. */}
      <TimerRing
        key={timer.index}
        progress={timer.progress}
        label={t('pause.timer')}
        seconds={timer.remainingSec}
        caption={timer.running ? undefined : t('pause.play.paused')}
      />
      <div className={styles.pills}>
        {current.exercise.areas.map((area) => (
          <Tag key={area} icon={AREA_ICONS[area]}>
            {t(`areas.${area}`)}
          </Tag>
        ))}
      </div>
      <ExerciseDetails exercise={current.exercise} />
      {suggestsStanding([current.exercise], activity.slot) && (
        <InlineMessage icon="info">{t('pause.standing')}</InlineMessage>
      )}
      {following && (
        <p className={styles.muted}>
          {t('pause.play.nextUp', { name: following.exercise.name[locale] })}
        </p>
      )}
    </FlowLayout>
  );
}
