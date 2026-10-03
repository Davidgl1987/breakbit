import { Link } from 'react-router';
import { pausePath, pausePlayPath } from '@/app/routes';
import { isAwaitingAnswer, isDue } from '@/domain/pause/window';
import type { Instant, ScheduledActivity } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import styles from './TodayScreen.module.css';

interface NextPauseCardProps {
  pause?: ScheduledActivity;
  now: Instant;
  /** "Ver ejercicio": a preview that changes nothing. */
  onSee: () => void;
}

/**
 * "Próxima pausa": how soon and what it is. When it's due, or postponed, it is the way in
 * ("Vamos"); once started, the way back ("Continuar").
 */
export function NextPauseCard({ pause, now, onSee }: NextPauseCardProps) {
  const { t, locale } = useT();
  if (!pause) {
    return (
      <Card as="section" className={styles.halfCard}>
        <h3 className={styles.cardTitle}>{t('today.nextPause')}</h3>
        <p className={styles.muted}>{t('today.noMorePauses')}</p>
      </Card>
    );
  }

  const started = pause.startedAt !== undefined;
  const due = isDue(pause, now);
  // A postponed pause can still be done now: it keeps "Vamos".
  const answerable = isAwaitingAnswer(pause, now);
  // Nearest minute: Today's clock moves in 30 s steps.
  const minutes = Math.max(1, Math.round((pause.currentScheduledAt - now) / 60_000));
  const when = started
    ? t('pause.inProgress')
    : due
      ? t('today.nextPauseNow')
      : t('today.nextPauseIn', { time: formatDuration(minutes) });

  return (
    <Card as="section" variant={due || started ? 'tinted' : 'standard'} className={styles.halfCard}>
      <h3 className={styles.cardTitle}>{t('today.nextPause')}</h3>
      <div className={styles.halfBody}>
        <span className={styles.big}>{when}</span>
        <span className={styles.small}>{contentName(pause.content, locale)}</span>
        {pause.status === 'postponed' && !due && <StatusBadge status="postponed" />}
      </div>
      {started ? (
        <Link
          to={pausePlayPath(pause.id)}
          className={buttonClassName({ size: 'sm', fullWidth: true })}
        >
          {t('pause.continue')}
        </Link>
      ) : answerable ? (
        <Link to={pausePath(pause.id)} className={buttonClassName({ size: 'sm', fullWidth: true })}>
          {t('pause.go')}
        </Link>
      ) : (
        <Button variant="secondary" size="sm" fullWidth onClick={onSee}>
          {t('today.seeExercise')}
        </Button>
      )}
    </Card>
  );
}
