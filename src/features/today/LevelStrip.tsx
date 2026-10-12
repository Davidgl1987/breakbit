import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useT } from '@/i18n/useT';
import { useLevel } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { ProgressBar } from '@/ui/components/ProgressBar/ProgressBar';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './TodayScreen.module.css';

export function LevelStrip({ showLink = true }: { showLink?: boolean }) {
  const { t } = useT();
  const level = useLevel();
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  return (
    <section className={styles.levelStrip} aria-label={t('today.level', { level: level.level })}>
      <div className={styles.progressFoot}>
        <strong>{t('today.level', { level: level.level })}</strong>
        <span>{t('today.xpOf', { current: level.current, total: level.needed })}</span>
      </div>
      <ProgressBar
        value={level.current}
        max={level.needed}
        size="sm"
        label={t('today.level', { level: level.level })}
      />
      <div className={styles.progressFoot}>
        <span>
          {t('evolution.phaseLabel', {
            phase,
            name: t(`evolution.phases.p${phase}`),
          })}
        </span>
        {showLink && (
          <Link to={ROUTES.progress} className={styles.actionLink}>
            {t('cycle.progress')} <LineIcon name="chevron-right" size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}
