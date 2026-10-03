import type { LevelProgress } from '@/domain/progress/xp';
import type { EvolutionPhase } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { Avatar } from '../Avatar/Avatar';
import styles from './AvatarCard.module.css';

interface AvatarCardProps {
  phase: EvolutionPhase;
  streak: number;
  xpToday: number;
  level: LevelProgress;
}

/** Home hero: the avatar at its real phase, streak and today's XP, and the level bar. */
export function AvatarCard({ phase, streak, xpToday, level }: AvatarCardProps) {
  const { t } = useT();
  const phaseName = t(`evolution.phases.p${phase}`);
  return (
    <Card as="section" className={styles.card}>
      <figure className={styles.avatar}>
        <Avatar
          phase={phase}
          size="lg"
          label={t('evolution.phaseLabel', { phase, name: phaseName })}
        />
        <figcaption className={styles.phase}>{phaseName}</figcaption>
      </figure>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <PixelIcon name="streak" size={32} />
          <span className={styles.statTexts}>
            <span className={styles.statLabel}>{t('today.streak')}</span>
            <span className={styles.statValue}>{streak}</span>
          </span>
        </div>
        <div className={styles.stat}>
          <PixelIcon name="xp" size={32} />
          <span className={styles.statTexts}>
            <span className={styles.statLabel}>{t('today.xpToday')}</span>
            <span className={styles.statValue}>
              {xpToday >= 0 ? `+${xpToday}` : `−${Math.abs(xpToday)}`}
            </span>
          </span>
        </div>
      </div>
      <div className={styles.level}>
        <div className={styles.levelHead}>
          <strong>{t('today.level', { level: level.level })}</strong>
          <span className={styles.statLabel}>
            {t('today.xpOf', { current: level.current, total: level.needed })}
          </span>
        </div>
        <ProgressBar
          value={level.current}
          max={level.needed}
          label={t('today.level', { level: level.level })}
        />
      </div>
    </Card>
  );
}
