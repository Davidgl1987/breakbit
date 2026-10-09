import type { DateKey } from '@/domain/types';
import { selectXpOn, useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import type { DayProgress } from '@/domain/day/progress';
import { formatActiveTime } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

/** "Tu progreso de hoy": pauses done, real interruption, and the main activity. */
export function DayProgressCard({ progress, date }: { progress: DayProgress; date: DateKey }) {
  const { t } = useT();
  const xp = useAppStore(selectXpOn(date));
  const streak = useStreak(date);
  const pauses = t('today.pausesDone', { done: progress.completed, total: progress.planned });
  return (
    <Card as="section" className={styles.progressCard}>
      <div className={styles.progressFoot}>
        <h3 className={styles.cardTitle}>{t('today.progressTitle')}</h3>
        <span>{pauses}</span>
      </div>
      {progress.planned > 0 && (
        <SegmentedProgress done={progress.completed} total={progress.planned} label={pauses} />
      )}
      <div className={styles.progressFoot}>
        <span>
          {xp >= 0 ? '+' : ''}
          {xp} XP
        </span>
        <span>
          {t('today.streak')} · {t('progress.evolution.streakDays', { count: streak })}
        </span>
      </div>
      <details>
        <summary>{t('common.seeMore')}</summary>
        <ul className={styles.stats}>
          <li>
            <PixelIcon name="stretch" size={24} />
            {t('common.pausesOf', { done: progress.completed, total: progress.planned })}
          </li>
          <li>
            <PixelIcon name="clock" size={24} />
            {t('today.interruption', { time: formatActiveTime(progress.interruptionSec) })}
          </li>
          {progress.extras > 0 && (
            <li>
              <PixelIcon name="extra" size={24} />
              {t('today.extras', { count: progress.extras })}
            </li>
          )}
          {progress.hasMain && (
            <li>
              <PixelIcon name={progress.mainCompleted ? 'completed' : 'goal'} size={24} />
              {progress.mainCompleted ? t('today.mainCompleted') : t('today.mainPending')}
            </li>
          )}
        </ul>
      </details>
    </Card>
  );
}
