import type { Instant, ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import styles from './TodayScreen.module.css';

interface NextPauseCardProps {
  pause?: ScheduledActivity;
  now: Instant;
  onSee: () => void;
}

/** "Próxima pausa": how soon, what it is, and a look at the exercise. */
export function NextPauseCard({ pause, now, onSee }: NextPauseCardProps) {
  const { t, locale } = useT();
  const minutes = pause ? Math.ceil((pause.currentScheduledAt - now) / 60_000) : 0;
  return (
    <Card as="section" className={styles.halfCard}>
      <h3 className={styles.cardTitle}>{t('today.nextPause')}</h3>
      {pause ? (
        <>
          <div className={styles.halfBody}>
            <span className={styles.big}>
              {minutes <= 0
                ? t('today.nextPauseNow')
                : t('today.nextPauseIn', { time: formatDuration(minutes) })}
            </span>
            <span className={styles.small}>{contentName(pause.content, locale)}</span>
          </div>
          <Button variant="secondary" size="sm" fullWidth onClick={onSee}>
            {t('today.seeExercise')}
          </Button>
        </>
      ) : (
        <p className={styles.muted}>{t('today.noMorePauses')}</p>
      )}
    </Card>
  );
}
