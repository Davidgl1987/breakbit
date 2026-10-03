import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { pausePlayPath, ROUTES } from '@/app/routes';
import { XP } from '@/domain/config';
import { isAwaitingAnswer, isDue, isOpen, postponeOptions, windowEnd } from '@/domain/pause/window';
import type { ScheduledActivity, SkipReason } from '@/domain/types';
import { ActivityHero } from '@/features/day/ActivityHero';
import { contentItems, suggestsStanding } from '@/features/day/contentItems';
import { contentName } from '@/features/day/contentName';
import { PauseContentView } from '@/features/day/PauseContentView';
import { formatClock, formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { activityDate, selectActivity } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { useNow } from '@/state/useNow';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './pause.module.css';

const REASONS: SkipReason[] = [
  'focused',
  'meeting',
  'no_time',
  'not_in_mood',
  'dislike_exercise',
  'other',
];

/**
 * /pause/:id — what a notification opens: "Vamos", postpone while it fits, or discard.
 * A postponed pause keeps "Vamos" until it comes back. Pauses that aren't waiting for
 * an answer show where they stand instead.
 */
export function DecisionScreen() {
  const { id = '' } = useParams();
  const location = useLocation();
  const fromNotification = new URLSearchParams(location.search).get('src') === 'notif';
  const now = useNow(5_000);
  const activity = useAppStore(selectActivity(id));
  const date = activityDate(id);
  const notificationOpened = useAppStore((state) => state.notificationOpened);

  // Only measured: opening isn't an answer, so reminders go on until the user acts.
  const counted = useRef<string | null>(null);
  useEffect(() => {
    if (!fromNotification || counted.current === id) return;
    counted.current = id;
    notificationOpened(date, id);
  }, [date, id, fromNotification, notificationOpened]);

  if (!activity || activity.kind !== 'micro') return <Navigate to={ROUTES.today} replace />;
  if (activity.startedAt !== undefined && isOpen(activity)) {
    return <Navigate to={pausePlayPath(id)} replace />;
  }
  if (!isAwaitingAnswer(activity, now)) return <PauseStatus activity={activity} />;
  return <Decision activity={activity} now={now} search={location.search} />;
}

function Decision({
  activity,
  now,
  search,
}: {
  activity: ScheduledActivity;
  now: number;
  /** Kept along the way, so the end knows the pause came from a notification. */
  search: string;
}) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const postponePause = useAppStore((state) => state.postponePause);
  const startPause = useAppStore((state) => state.startPause);
  const discardPause = useAppStore((state) => state.discardPause);
  const [discarding, setDiscarding] = useState(false);
  const [reason, setReason] = useState<SkipReason>();
  const date = activityDate(activity.id);
  const options = postponeOptions(activity, now);
  // Postponed and not back yet: "Vamos" is still on offer, no new postpone.
  const comingBack = !isDue(activity, now);
  // This pause's explicit postpones only: unanswered time isn't "postponed".
  const postponed = activity.postponeMinutes;
  const minutesLeft = Math.max(1, Math.ceil((windowEnd(activity) - now) / 60_000));
  const hint = pauseHint(activity);

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <ActivityHero
          stage={<AvatarStage phase={phase} pose="cheer" label={t('pause.stage')} />}
          title={t('pause.title')}
          name={`${contentName(activity.content, locale)} · ${formatSeconds(activity.durationSec)}`}
          hint={hint && t(hint)}
        />
      }
    >
      <Button
        size="lg"
        fullWidth
        onClick={() => {
          startPause(date, activity.id);
          navigate(`${pausePlayPath(activity.id)}${search}`, { replace: true });
        }}
      >
        {t('pause.go')}
      </Button>

      <Card as="section" className={styles.postpone}>
        <h2 className={styles.sectionTitle}>{t('pause.notNow')}</h2>
        {comingBack ? (
          <p className={styles.muted}>
            {t('pause.postponedUntil', { time: formatClock(activity.currentScheduledAt) })}
          </p>
        ) : options.length > 0 ? (
          <div className={styles.pills}>
            {options.map((minutes) => (
              <Button
                key={minutes}
                variant="secondary"
                shape="pill"
                aria-label={t('pause.postponeLabel', { minutes })}
                onClick={() => {
                  postponePause(date, activity.id, minutes);
                  navigate(ROUTES.today, { replace: true });
                  showToast(
                    t('toasts.postponed', { time: formatClock(clock.now() + minutes * 60_000) }),
                  );
                }}
              >
                {t('pause.postpone', { minutes })}
              </Button>
            ))}
          </div>
        ) : (
          <p className={styles.muted}>{t('pause.noMorePostpones')}</p>
        )}
        {(postponed > 0 || (!comingBack && options.length < 3)) && (
          <p className={styles.muted}>
            {[
              postponed > 0 &&
                t('pause.postponed', { minutes: t('common.minutes', { count: postponed }) }),
              !comingBack &&
                options.length < 3 &&
                t('pause.timeLeft', { minutes: t('common.minutes', { count: minutesLeft }) }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </Card>

      <Button variant="destructive" fullWidth onClick={() => setDiscarding(true)}>
        {t('pause.discard')} · −{Math.abs(XP.discard)} XP
      </Button>

      {discarding && (
        <BottomSheet
          open
          onClose={() => setDiscarding(false)}
          title={t('pause.discardSheet.title')}
          actions={
            <>
              <Button
                variant="destructive"
                fullWidth
                onClick={() => {
                  discardPause(date, activity.id, reason);
                  navigate(ROUTES.today, { replace: true });
                  showToast(t('toasts.discarded'), 'warning');
                }}
              >
                {t('pause.discardSheet.confirm')}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setDiscarding(false)}>
                {t('pause.discardSheet.cancel')}
              </Button>
            </>
          }
        >
          <div className={styles.sheetBody}>
            <p>{t('pause.discardSheet.body')}</p>
            <div
              role="group"
              aria-label={t('pause.discardSheet.reason')}
              className={styles.reasons}
            >
              <span className={styles.muted}>{t('pause.discardSheet.reason')}</span>
              <div className={styles.pills}>
                {REASONS.map((value) => (
                  <Button
                    key={value}
                    variant="secondary"
                    shape="pill"
                    size="sm"
                    pressed={reason === value}
                    onClick={() => setReason(reason === value ? undefined : value)}
                  >
                    {t(`pause.reasons.${value}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </FlowLayout>
  );
}

/** Discreet in a meeting; otherwise "better standing" when the moves allow it. */
function pauseHint(activity: ScheduledActivity): 'pause.meeting' | 'pause.standing' | undefined {
  if (activity.slot === 'meeting') return 'pause.meeting';
  const exercises = contentItems(activity.content).map((item) => item.exercise);
  return suggestsStanding(exercises, activity.slot) ? 'pause.standing' : undefined;
}

/** A pause that isn't waiting for an answer: upcoming, done, discarded or missed. */
function PauseStatus({ activity }: { activity: ScheduledActivity }) {
  const { t, locale } = useT();
  const upcoming = isOpen(activity) && clock.now() < activity.currentScheduledAt;
  const title = (() => {
    if (upcoming) {
      return t('pause.states.upcoming', { time: formatClock(activity.currentScheduledAt) });
    }
    if (activity.status === 'completed') return t('pause.states.completed');
    if (activity.status === 'skipped') return t('pause.states.skipped');
    return t('pause.states.missed');
  })();

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <ScreenHeader
          title={title}
          subtitle={
            activity.status === 'missed'
              ? t('pause.states.missedBody')
              : contentName(activity.content, locale)
          }
        />
      }
      footer={
        <Link
          to={ROUTES.today}
          replace
          className={buttonClassName({ variant: 'secondary', size: 'lg', fullWidth: true })}
        >
          {t('pause.states.back')}
        </Link>
      }
    >
      {upcoming && <PauseContentView content={activity.content} slot={activity.slot} />}
    </FlowLayout>
  );
}
