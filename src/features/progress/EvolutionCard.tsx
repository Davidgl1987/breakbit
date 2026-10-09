import { ROOM_ITEMS } from '@/content/roomItems';
import { WEEK } from '@/domain/config';
import { goodWeekStreak } from '@/domain/progress/weekly';
import type { HistoryInput } from '@/domain/stats/days';
import { weekOutlook } from '@/domain/stats/weekStats';
import { startOfWeek } from '@/domain/time';
import { useT } from '@/i18n/useT';
import { useLevel, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { AvatarScene } from '@/ui/game/AvatarScene/AvatarScene';
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
    <section className={styles.evolution}>
      <Card as="section" className={styles.evolutionCard}>
        <AvatarScene>
          <h2 className={styles.eyebrow}>{t('progress.evolution.title')}</h2>
          <p className={styles.phase}>
            {t('evolution.phaseLabel', { phase, name: t(`evolution.phases.p${phase}`) })}
          </p>
          <span className={styles.line}>
            <PixelIcon name="streak" size={24} />
            {t('progress.evolution.streak')} ·{' '}
            {t('progress.evolution.streakDays', { count: streak })}
          </span>
        </AvatarScene>
        <div className={styles.evolutionFoot}>
          {outlook.status !== 'short' && (
            <p className={styles.line}>
              {t('progress.evolution.thisWeek', { good: outlook.good, planned: outlook.planned })}
            </p>
          )}
          <p className={styles.muted}>{message}</p>
          {weeks > 0 && (
            <p className={styles.muted}>{t('progress.evolution.weeks', { count: weeks })}</p>
          )}
        </div>
      </Card>
      <div className={styles.xp}>
        <div className={styles.head}>
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
        <div className={styles.head}>
          <span className={styles.muted}>
            {t('redesign.xpMissing', { xp: level.needed - level.current, level: level.level + 1 })}
          </span>
          <span className={styles.muted}>
            {t('progress.evolution.totalXp')}: {level.total.toLocaleString(locale)}
          </span>
        </div>
      </div>
      <details className={styles.rewards}>
        <summary>{t('redesign.phases')}</summary>
        <EvolutionStrip current={phase} />

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
      </details>
    </section>
  );
}
