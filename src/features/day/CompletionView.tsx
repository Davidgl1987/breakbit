import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { XP } from '@/domain/config';
import { dayProgress } from '@/domain/day/progress';
import type { ScheduledActivity, XpEntry } from '@/domain/types';
import { useT, type Translate } from '@/i18n/useT';
import { activityDate, useLevel } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { AvatarStage } from '@/ui/game/AvatarStage/AvatarStage';
import { Celebration } from '@/ui/game/Celebration/Celebration';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ActivityHero } from './ActivityHero';
import { contentName } from './contentName';
import styles from './CompletionView.module.css';

interface CompletionViewProps {
  activity: ScheduledActivity;
  title: string;
  /** Ledger keys this completion may have earned, in the order to list them. */
  xpKeys: readonly string[];
  /** What was just done leads the day's summary: the main activity or the pauses. */
  focus: 'main' | 'pauses';
}

/**
 * A pause or the main activity is done: a small celebration, the XP it earned, how the
 * day is going (what was just done first, the main activity and the pauses apart) and
 * the level. Then back to work.
 */
export function CompletionView({ activity, title, xpKeys, focus }: CompletionViewProps) {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const { search } = useLocation();
  const fromNotification = new URLSearchParams(search).get('src') === 'notif';
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const plan = useAppStore((state) => state.days[activityDate(activity.id)]?.plan);
  const ledger = useAppStore((state) => state.xpLedger);
  const level = useLevel();
  const entries = xpKeys
    .map((key) => ledger.find((entry) => entry.key === key))
    .filter((entry): entry is XpEntry => entry !== undefined);
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const progress = plan && dayProgress(plan, CATALOG);

  const back = () => {
    // Opened from a notification: try to give the screen back to whatever was there.
    if (fromNotification) window.close();
    // A pause recovered at the end of the day leads back to closing it.
    navigate(activity.origin === 'recovery' ? ROUTES.dayEnd : ROUTES.today, { replace: true });
    if (fromNotification) showToast(t('toasts.backToWork'), 'success');
  };

  return (
    <FlowLayout
      top={
        <IconButton label={t('common.close')} onClick={back}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <ActivityHero
          stage={
            <AvatarStage phase={phase} pose="celebrate" label={t('pause.done.stage')}>
              <Celebration />
            </AvatarStage>
          }
          title={title}
          // The time actually moved is kept for the stats, not shown off here.
          name={contentName(activity.content, locale)}
        />
      }
      footer={
        <Button size="lg" fullWidth onClick={back}>
          {t('pause.done.back')}
        </Button>
      }
    >
      <Card as="section" variant="tinted" className={styles.xpCard}>
        {entries.length > 0 ? (
          <p className={styles.xpTotal}>
            <PixelIcon name="xp" size={32} />
            {t('pause.done.xp', { xp: total })}
          </p>
        ) : (
          // An extra pause too soon after moving, or past the day's cap: still a good move.
          <p className={styles.xpTotal} data-quiet="">
            <PixelIcon name="extra" size={32} />
            {t('gap.extraNoXp')}
          </p>
        )}
        <p className={styles.breakdown}>
          {entries.length > 0
            ? entries
                .map((entry) => xpLine(entry, t))
                .filter(Boolean)
                .join(' · ')
            : t('pause.done.noXp')}
        </p>
      </Card>

      {progress && (progress.hasMain || progress.planned > 0) && (
        <Card as="section" className={styles.dayCard}>
          {(focus === 'main' ? ['main', 'pauses'] : ['pauses', 'main']).map((row) =>
            row === 'main'
              ? progress.hasMain && (
                  <p
                    key={row}
                    className={styles.mainLine}
                    data-lead={focus === 'main' || undefined}
                  >
                    <PixelIcon name={progress.mainCompleted ? 'completed' : 'goal'} size={24} />
                    {progress.mainCompleted ? t('main.done.completed') : t('main.done.pending')}
                  </p>
                )
              : progress.planned > 0 && (
                  <div key={row} className={styles.progressRow}>
                    <div className={styles.progressHead}>
                      <strong>{t('pause.done.pauses')}</strong>
                      <span className={styles.muted}>
                        {t('pause.done.pausesValue', {
                          done: progress.completed,
                          total: progress.planned,
                        })}
                      </span>
                    </div>
                    <SegmentedProgress
                      done={progress.completed}
                      total={progress.planned}
                      label={t('common.pausesOf', {
                        done: progress.completed,
                        total: progress.planned,
                      })}
                    />
                    {progress.extras > 0 && (
                      <span className={styles.muted}>
                        {t('pause.done.extras', { count: progress.extras })}
                      </span>
                    )}
                  </div>
                ),
          )}
        </Card>
      )}

      <Card as="section" className={styles.progressRow}>
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
      </Card>
    </FlowLayout>
  );
}

/** "+100 pausa", "+20 a la primera", "+300 actividad principal"… */
function xpLine(entry: XpEntry, t: Translate): string | undefined {
  switch (entry.reason) {
    case 'microbreak':
      return t(entry.amount > XP.microbreak ? 'pause.done.returnBonus' : 'pause.done.pause', {
        xp: entry.amount,
      });
    case 'first_prompt':
      return t('pause.done.firstTry', { xp: entry.amount });
    case 'extra_break':
      return t('pause.done.extra', { xp: entry.amount });
    case 'main_activity':
      return t(entry.amount > XP.mainActivity ? 'main.done.returnBonus' : 'main.done.xp', {
        xp: entry.amount,
      });
    default:
      return undefined;
  }
}
