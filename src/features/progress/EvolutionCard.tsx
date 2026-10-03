import { ROOM_ITEMS } from '@/content/roomItems';
import { WEEK } from '@/domain/config';
import { goodWeekStreak } from '@/domain/progress/weekly';
import type { HistoryInput } from '@/domain/stats/days';
import { weekOutlook } from '@/domain/stats/weekStats';
import { startOfWeek } from '@/domain/time';
import { useT } from '@/i18n/useT';
import { useLevel, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { Card } from '@/ui/components/Card/Card';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { EvolutionStrip } from '@/ui/game/EvolutionStrip/EvolutionStrip';
import { RoomScene } from '@/ui/game/RoomScene/RoomScene';
import { roomItemIcon } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

/**
 * "Tu evolución": the avatar's phase (from good weeks, never from XP) and how this week
 * is going towards the next one; streak and total XP alongside; the room at the top.
 */
export function EvolutionCard({ history }: { history: HistoryInput }) {
  const { t, locale } = useT();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const results = useAppStore((state) => state.progress.weeklyResults);
  const unlocked = useAppStore((state) => state.progress.unlockedRoomItems);
  const streak = useStreak(history.today);
  const level = useLevel();
  const outlook = weekOutlook(startOfWeek(history.today), history);
  const top = phase === WEEK.maxPhase;
  const weeks = goodWeekStreak(results);
  const target = outlook.good + outlook.needed;

  const message = (() => {
    switch (outlook.status) {
      case 'short':
        return t('progress.evolution.short');
      case 'done':
        return top ? t('progress.evolution.doneTop') : t('progress.evolution.done');
      case 'reachable':
        return t(top ? 'progress.evolution.reachableTop' : 'progress.evolution.reachable', {
          count: outlook.needed,
        });
      case 'out_of_reach':
        return t('progress.evolution.outOfReach');
    }
  })();

  return (
    <Card as="section" className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headTexts}>
          <h2 className={styles.title}>{t('progress.evolution.title')}</h2>
          <p className={styles.muted}>{t('progress.evolution.caption')}</p>
        </div>
        <div className={styles.figures}>
          <span className={styles.figure}>
            {t('progress.evolution.streak')}
            <span className={styles.figureValue}>
              <PixelIcon name="streak" size={16} />
              {t('progress.evolution.streakDays', { count: streak })}
            </span>
          </span>
          <span className={styles.figure}>
            {t('progress.evolution.totalXp')}
            <span className={styles.figureValue}>
              <PixelIcon name="xp" size={16} />
              {level.total.toLocaleString(locale)}
            </span>
          </span>
        </div>
      </div>

      <EvolutionStrip current={phase} />

      <div className={styles.outlook}>
        {outlook.status !== 'short' && (
          <>
            <p className={styles.line}>
              {t('progress.evolution.thisWeek', { good: outlook.good, planned: outlook.planned })}
            </p>
            <ProgressBar
              value={Math.min(outlook.good, target)}
              max={Math.max(target, 1)}
              label={t('progress.evolution.thisWeek', {
                good: outlook.good,
                planned: outlook.planned,
              })}
            />
          </>
        )}
        <p className={styles.muted}>{message}</p>
        {weeks > 0 && (
          <p className={styles.line}>
            <PixelIcon name="streak" size={24} />
            {t('progress.evolution.weeks', { count: weeks })}
          </p>
        )}
      </div>

      {(top || unlocked.length > 0) && (
        <RoomScene
          label={t('progress.evolution.room')}
          items={ROOM_ITEMS.filter((item) => unlocked.includes(item.id)).map((item) => ({
            id: item.id,
            name: item.name[locale],
            icon: roomItemIcon(item.id),
          }))}
          capacity={ROOM_ITEMS.length}
        />
      )}
    </Card>
  );
}
