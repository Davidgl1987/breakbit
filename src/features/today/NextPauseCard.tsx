import { Link } from 'react-router';
import { pausePath, pausePlayPath } from '@/app/routes';
import { isAwaitingAnswer, isDue } from '@/domain/pause/window';
import type { Instant, ScheduledActivity } from '@/domain/types';
import { areaIcon, areaName, equipmentIcon, equipmentName } from '@/features/day/catalogDisplay';
import { contentItems } from '@/features/day/contentItems';
import { contentName } from '@/features/day/contentName';
import { formatDuration, formatSeconds } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { AvatarScene } from '@/ui/game/AvatarScene/AvatarScene';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

/** Keep the combined routine metadata compact while showing its worked areas. */
const MAX_AREAS = 6;

interface NextPauseCardProps {
  pause?: ScheduledActivity;
  now: Instant;
  /** "Ver ejercicio": a preview that changes nothing. */
  onSee: () => void;
}

/**
 * "Próxima pausa": how soon, what it is and what it's for (the icon of the area it works,
 * where "Actividad de hoy" has its own). When it's due, or postponed, it is the way in
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
  const items = contentItems(pause.content);
  const areas = [...new Set(items.flatMap(({ exercise }) => exercise.areas))].slice(0, MAX_AREAS);
  const gear = [...new Set(items.flatMap(({ exercise }) => exercise.equipment))];
  const when = started
    ? t('pause.inProgress')
    : due
      ? t('today.nextPauseNow')
      : t('today.nextPauseIn', { time: formatDuration(minutes) });

  return (
    <Card as="section" variant={due || started ? 'tinted' : 'standard'} className={styles.heroCard}>
      <AvatarScene>
        <h3 className={styles.cardTitle}>{t('today.nextPause')}</h3>
        <div className={styles.heroBody}>
          <span className={styles.big}>{when}</span>
          <span className={styles.small}>{contentName(pause.content, locale)}</span>
          <span className={styles.duration}>{formatSeconds(pause.durationSec)}</span>
          {pause.status === 'postponed' && !due && <StatusBadge status="postponed" />}
        </div>
      </AvatarScene>
      <div className={styles.heroFooter}>
        <div className={styles.metadata}>
          <span className={styles.zones}>
            {areas.map((area) => (
              <span key={area}>
                <PixelIcon name={areaIcon(area)} size={16} />
                {areaName(area, locale)}
              </span>
            ))}
          </span>
          <span className={styles.gear}>
            {gear.length
              ? gear.map((item) => (
                  <span key={item}>
                    <PixelIcon name={equipmentIcon(item)} size={16} />
                    {equipmentName(item, locale)}
                  </span>
                ))
              : t('redesign.noMaterial')}
          </span>
        </div>
        {started ? (
          <Link
            to={pausePlayPath(pause.id)}
            className={buttonClassName({ size: 'sm', fullWidth: true })}
          >
            {t('pause.continue')}
          </Link>
        ) : answerable ? (
          <Link
            to={pausePath(pause.id)}
            className={buttonClassName({ size: 'sm', fullWidth: true })}
          >
            {t('pause.go')}
          </Link>
        ) : (
          <Button size="lg" fullWidth onClick={onSee}>
            {t('today.seeExercise')}
          </Button>
        )}
      </div>
    </Card>
  );
}
