import type { DayProgress } from '@/domain/day/progress';
import { formatDuration, formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { SegmentedProgress } from '@/ui/components/SegmentedProgress/SegmentedProgress';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

/** "Tu progreso de hoy": pauses done, real interruption, and the main activity. */
export function DayProgressCard({ progress }: { progress: DayProgress }) {
  const { t } = useT();
  const pauses = t('today.pausesDone', { done: progress.completed, total: progress.planned });
  return (
    <Card as="section" className={styles.progressCard}>
      <h3 className={styles.cardTitle}>{t('today.progressTitle')}</h3>
      {progress.planned > 0 && (
        <SegmentedProgress done={progress.completed} total={progress.planned} label={pauses} />
      )}
      <ul className={styles.stats}>
        <li>
          <PixelIcon name="stretch" size={24} />
          {pauses}
        </li>
        <li>
          <PixelIcon name="clock" size={24} />
          {t('today.interruption', { time: formatInterruption(progress.interruptionSec) })}
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
    </Card>
  );
}

/** Seconds while under a minute (a single pause), then minutes. */
function formatInterruption(seconds: number): string {
  return seconds > 0 && seconds < 60 ? formatSeconds(seconds) : formatDuration(seconds / 60);
}
