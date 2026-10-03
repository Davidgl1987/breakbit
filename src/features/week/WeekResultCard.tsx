import { Link } from 'react-router';
import { weekPath } from '@/app/routes';
import { unseenWeek } from '@/domain/progress/weekly';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './WeekScreen.module.css';

/** On Today, once a week has been judged: its result, until the user has seen it. */
export function WeekResultCard() {
  const { t } = useT();
  const result = useAppStore((state) => unseenWeek(state.progress));
  if (!result) return null;
  const evolved = result.phaseAfter > result.phaseBefore;
  return (
    <Card
      as="section"
      variant={result.result === 'good' ? 'tinted' : 'standard'}
      className={styles.summary}
    >
      <p className={styles.label}>{t('week.label')}</p>
      <p className={styles.streak}>
        {/* Not "level up": levels come from XP; this is the avatar's phase. */}
        <PixelIcon name={evolved ? 'progress' : 'calendar'} size={32} />
        {t(`week.results.${result.result}.title`)}
      </p>
      {result.result !== 'neutral' && (
        <p className={styles.muted}>
          {t('week.tally', { good: result.good, planned: result.planned })}
        </p>
      )}
      <Link to={weekPath(result.week)} className={buttonClassName({ fullWidth: true })}>
        {t('week.see')}
      </Link>
    </Card>
  );
}
