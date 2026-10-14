import { useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useT } from '@/i18n/useT';
import { useLevel } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { EvolutionSheet } from '@/ui/game/EvolutionSheet/EvolutionSheet';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

/** The approved first evolution and level, before there is completed movement. */
export function InitialEvolutionCard() {
  const { t } = useT();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const level = useLevel();
  const [phases, setPhases] = useState(false);
  return (
    <>
      <Card as="section" variant="tinted" className={styles.initialHero}>
        <p className={styles.initialKicker}>{t('progress.initial.firstPhase')}</p>
        <div className={styles.initialPhase}>
          <div>
            <h2>{t('evolution.phaseLabel', { phase, name: t(`evolution.phases.p${phase}`) })}</h2>
            <p className={styles.muted}>{t('progress.initial.pause')}</p>
          </div>
          <span className={styles.initialAvatar}>
            <Avatar phase={phase} size="lg" framed={false} />
          </span>
        </div>
        <p>{t('progress.initial.story')}</p>
      </Card>
      <section className={styles.xp} aria-label={t('today.level', { level: level.level })}>
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
        <button className={styles.initialLink} onClick={() => setPhases(true)}>
          {t('redesign.phases')}
          <LineIcon name="chevron-up" size={16} />
        </button>
      </section>
      {phases && (
        <EvolutionSheet phase={phase} onClose={() => setPhases(false)}>
          <p className={styles.initialRewards}>{t('progress.initial.rewards')}</p>
        </EvolutionSheet>
      )}
    </>
  );
}

export function FirstProgressStep() {
  const { t } = useT();
  return (
    <section className={styles.initialSection}>
      <h2 className={styles.title}>{t('progress.initial.firstStep')}</h2>
      <p className={styles.muted}>{t('progress.initial.startHint')}</p>
      <Link to={ROUTES.today} className={buttonClassName({ fullWidth: true })}>
        {t('progress.initial.goToday')}
        <LineIcon name="chevron-right" size={18} />
      </Link>
    </section>
  );
}

/** Only the sections still waiting for data stay in the initial preview. */
export function PendingProgressSections({
  constancy,
  favourites,
  areas,
}: {
  constancy: boolean;
  favourites: boolean;
  areas: boolean;
}) {
  const { t } = useT();
  if (!constancy && !favourites && !areas) return null;
  return (
    <section className={styles.initialSection}>
      <h2 className={styles.title}>{t('progress.initial.preview')}</h2>
      <ul className={styles.initialFuture}>
        {constancy && (
          <li>
            <PixelIcon name="calendar" size={24} />
            <div>
              <p>{t('progress.heatmap.title')}</p>
              <p className={styles.muted}>{t('progress.initial.constancy')}</p>
            </div>
          </li>
        )}
        {favourites && (
          <li>
            <PixelIcon name="mood_great" size={24} />
            <div>
              <p>{t('progress.likes.title')}</p>
              <p className={styles.muted}>{t('progress.initial.favourites')}</p>
            </div>
          </li>
        )}
        {areas && (
          <li>
            <PixelIcon name="upper_back" size={24} />
            <div>
              <p>{t('progress.initial.areasTitle')}</p>
              <p className={styles.muted}>{t('progress.initial.areas')}</p>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}

export function FirstWeekCard() {
  const { t } = useT();
  return (
    <Card as="section" className={styles.initialWeek}>
      <div className={styles.line}>
        <PixelIcon name="good_day" size={24} />
        <h2>{t('progress.initial.firstWeek')}</h2>
      </div>
      <p className={styles.muted}>{t('progress.initial.weekHint')}</p>
    </Card>
  );
}
