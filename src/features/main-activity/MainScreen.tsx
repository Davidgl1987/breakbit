import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { mainDonePath, ROUTES } from '@/app/routes';
import { mainChoiceOf } from '@/domain/day/planDay';
import { isMainRunning, mainElapsedSec } from '@/domain/main/session';
import { isOpen } from '@/domain/pause/window';
import type { MainActivity, ScheduledActivity } from '@/domain/types';
import { ActivityHero } from '@/features/day/ActivityHero';
import { equipmentIcon, equipmentName } from '@/features/day/catalogDisplay';
import { contentItems, type ContentItem } from '@/features/day/contentItems';
import { ExerciseDetails } from '@/features/day/ExerciseDetails';
import { mainActivityInfo, mainWhere } from '@/features/day/mainActivity';
import { MainActivitySheet } from '@/features/day/MainActivitySheet';
import { TimerRing } from '@/features/day/TimerRing';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { formatClock, formatDuration, formatSeconds, formatTimer } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { activityDate, selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Tag } from '@/ui/components/Tag/Tag';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { LineIcon } from '@/ui/icons/LineIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './main.module.css';

/** The most evolved avatar shows every activity (one set of art for all phases). */
const DEMO_PHASE = 5;

/**
 * /main/:id — today's main activity: what it is and when, then its session once started.
 * The session lives in the store, so leaving the screen or closing the app keeps it.
 */
export function MainScreen() {
  const { id = '' } = useParams();
  const { search } = useLocation();
  const activity = useAppStore(selectActivity(id));
  const info = activity && mainActivityInfo(activity);

  if (!activity || activity.kind !== 'main' || !info) {
    return <Navigate to={ROUTES.today} replace />;
  }
  if (activity.status === 'completed') {
    return <Navigate to={`${mainDonePath(id)}${search}`} replace />;
  }
  if (!isOpen(activity)) return <Navigate to={ROUTES.today} replace />;
  return activity.startedAt === undefined ? (
    <MainIntro activity={activity} info={info} />
  ) : (
    <MainSession activity={activity} info={info} />
  );
}

interface MainViewProps {
  activity: ScheduledActivity;
  info: MainActivity;
}

const close = (label: string) => (
  <IconButton label={label} to={ROUTES.today}>
    <LineIcon name="close" size={22} />
  </IconButton>
);

/** Before starting: what, how long, when, and how; start, change it, or "Ya la he hecho". */
function MainIntro({ activity, info }: MainViewProps) {
  const { t, locale } = useT();
  const date = activityDate(activity.id);
  const plan = useAppStore((state) => state.days[date]?.plan);
  const startMain = useAppStore((state) => state.startMain);
  const completeMain = useAppStore((state) => state.completeMain);
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);
  const planner = useDayPlanner();
  const [sheet, setSheet] = useState<'change' | 'done' | null>(null);
  const accumulated = activity.completionMode === 'accumulated';
  const minutes = t('common.minutes', { count: activity.durationSec / 60 });
  const when =
    plan &&
    t('mainActivity.when', {
      time: formatClock(activity.currentScheduledAt),
      where: t(`mainActivity.where.${mainWhere(plan, activity)}`),
    });

  return (
    <FlowLayout
      top={close(t('common.close'))}
      header={
        <ActivityHero
          stage={<AvatarStage phase={DEMO_PHASE} pose="demo" label={t('main.stage')} />}
          title={info.name[locale]}
          name={t(accumulated ? 'main.accumulated' : 'main.continuous', { minutes })}
          hint={when}
        />
      }
      footer={
        <div className={styles.actions}>
          <Button
            size="lg"
            fullWidth
            onClick={() => runScreenTransition(() => startMain(date, activity.id))}
          >
            {accumulated ? t('main.startBlock') : t('main.start')}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setSheet('done')}>
            {t('main.doneAlready')}
          </Button>
        </div>
      }
    >
      {info.equipment.length > 0 && (
        <div className={styles.tags}>
          {info.equipment.map((item) => (
            <Tag key={item} icon={equipmentIcon(item)}>
              {equipmentName(item, locale)}
            </Tag>
          ))}
        </div>
      )}
      <ExerciseDetails exercise={info} />
      {plan && (
        <Button variant="secondary" fullWidth onClick={() => setSheet('change')}>
          {t('main.change')}
        </Button>
      )}

      {sheet === 'change' && plan && (
        <MainActivitySheet
          schedule={plan.schedule}
          meetings={plan.meetings}
          current={mainChoiceOf(plan)}
          onClose={() => setSheet(null)}
          onSave={(choice) => {
            updateDayPlan(planner.changeMain(plan, choice, clock.now()));
            setSheet(null);
          }}
        />
      )}
      {sheet === 'done' && (
        <BottomSheet
          open
          onClose={() => setSheet(null)}
          title={t('main.doneSheet.title')}
          actions={
            <>
              <Button
                fullWidth
                onClick={() => runScreenTransition(() => completeMain(date, activity.id))}
              >
                {t('main.doneSheet.confirm')}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setSheet(null)}>
                {t('main.doneSheet.cancel')}
              </Button>
            </>
          }
        >
          <p className={styles.sheetBody}>{t('main.doneSheet.body', { minutes })}</p>
        </BottomSheet>
      )}
    </FlowLayout>
  );
}

/**
 * Under way. Continuous: a countdown with pause/resume. Accumulated: blocks that add up.
 * It completes once the time adds up (here, or by the engine while away) or on "Terminar".
 */
function MainSession({ activity, info }: MainViewProps) {
  const { t, locale } = useT();
  const now = useNow(1000);
  const date = activityDate(activity.id);
  const startMain = useAppStore((state) => state.startMain);
  const pauseMain = useAppStore((state) => state.pauseMain);
  const completeMain = useAppStore((state) => state.completeMain);
  const [confirming, setConfirming] = useState(false);
  const accumulated = activity.completionMode === 'accumulated';
  const running = isMainRunning(activity);
  const elapsed = mainElapsedSec(activity, now);
  const target = activity.durationSec;
  const timeUp = running && elapsed >= target;
  const minutes = t('common.minutes', { count: target / 60 });

  useEffect(() => {
    if (timeUp) runScreenTransition(() => completeMain(date, activity.id));
  }, [timeUp, date, activity.id, completeMain]);

  const moves = info.routine ? contentItems({ kind: 'routine', routineId: info.routine }) : [];
  const move = currentMove(moves, elapsed);
  const following = move && moves[move.index + 1];
  const subtitle = move
    ? t('pause.play.step', { current: move.index + 1, total: moves.length })
    : accumulated
      ? t('main.accumulated', { minutes })
      : undefined;

  return (
    <FlowLayout
      top={close(t('common.close'))}
      header={
        <ActivityHero
          stage={<AvatarStage phase={DEMO_PHASE} pose="demo" label={t('main.stage')} />}
          title={info.name[locale]}
          name={subtitle}
        />
      }
      footer={
        <div className={styles.controls}>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => (running ? pauseMain : startMain)(date, activity.id)}
          >
            {accumulated
              ? running
                ? t('main.stopBlock')
                : t('main.nextBlock')
              : running
                ? t('main.pause')
                : t('main.resume')}
          </Button>
          <Button
            size="lg"
            onClick={() =>
              // Before its time, ask first: it can't be undone.
              elapsed < target
                ? setConfirming(true)
                : runScreenTransition(() => completeMain(date, activity.id))
            }
          >
            {t('main.finish')}
          </Button>
        </div>
      }
    >
      {accumulated ? (
        <>
          <TimerRing
            progress={elapsed / target}
            label={t('main.timer')}
            seconds={Math.floor(elapsed)}
            caption={t('main.ofTotal', { minutes })}
          />
          <p className={styles.block}>
            {activity.runningSince !== undefined
              ? t('main.blockRunning', {
                  time: formatTimer(Math.floor((now - activity.runningSince) / 1000)),
                })
              : t('main.blockStopped')}
          </p>
        </>
      ) : (
        <TimerRing
          progress={elapsed / target}
          label={t('main.timer')}
          seconds={Math.ceil(target - elapsed)}
          caption={running ? t('main.left') : t('main.paused')}
        />
      )}
      {running && <p className={styles.away}>{t('main.away')}</p>}
      {move ? (
        <>
          <h2 className={styles.move}>{move.item.exercise.name[locale]}</h2>
          <ExerciseDetails exercise={move.item.exercise} />
          {following && (
            <p className={styles.muted}>
              {t('pause.play.nextUp', { name: following.exercise.name[locale] })}
            </p>
          )}
        </>
      ) : (
        <ExerciseDetails exercise={info} />
      )}

      {confirming && (
        <BottomSheet
          open
          onClose={() => setConfirming(false)}
          title={t('main.finishSheet.title')}
          actions={
            <>
              <Button
                fullWidth
                onClick={() => runScreenTransition(() => completeMain(date, activity.id))}
              >
                {t('main.finishSheet.confirm')}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setConfirming(false)}>
                {t('main.finishSheet.cancel')}
              </Button>
            </>
          }
        >
          <p className={styles.sheetBody}>
            {t('main.finishSheet.body', { done: formatDone(elapsed), total: minutes })}
          </p>
        </BottomSheet>
      )}
    </FlowLayout>
  );
}

/** "40 s" under a minute, then whole minutes: "5 min". */
function formatDone(seconds: number): string {
  return seconds < 60
    ? formatSeconds(Math.floor(seconds))
    : formatDuration(Math.floor(seconds / 60));
}

/** The guided move for the time done so far; the last one holds until the end. */
function currentMove(
  moves: readonly ContentItem[],
  elapsedSec: number,
): { index: number; item: ContentItem } | undefined {
  let start = 0;
  for (const [index, item] of moves.entries()) {
    if (elapsedSec < start + item.seconds || index === moves.length - 1) return { index, item };
    start += item.seconds;
  }
  return undefined;
}
