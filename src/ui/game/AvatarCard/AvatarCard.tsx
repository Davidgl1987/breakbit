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

/**
 * Home hero: the avatar at its real phase takes the card's top, standing on its stage;
 * streak, today's XP and the level bar sit compactly below it.
 */
export function AvatarCard({ phase, streak, xpToday, level }: AvatarCardProps) {
  const { t } = useT();
  const phaseName = t(`evolution.phases.p${phase}`);
  return (
    <Card as="section" className={styles.card}>
      <figure className={styles.stage}>
        <Avatar
          phase={phase}
          size="xl"
          framed={false}
          label={t('evolution.phaseLabel', { phase, name: phaseName })}
        />
        <figcaption className={styles.phase}>{phaseName}</figcaption>
      </figure>
      <div className={styles.body}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <PixelIcon name="streak" size={24} />
            <span className={styles.statTexts}>
              <span className={styles.statLabel}>{t('today.streak')}</span>
              <span className={styles.statValue}>{streak}</span>
            </span>
          </div>
          <div className={styles.stat}>
            <PixelIcon name="xp" size={24} />
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
      </div>
    </Card>
  );
}
