import { weekPath } from '@/app/routes';
import type { WeeklyResult } from '@/domain/types';
import { addDays } from '@/domain/time';
import { formatDayRange } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

const ICONS: Record<WeeklyResult['result'], IconName> = {
  good: 'good_day',
  regular: 'calendar',
  bad: 'calendar',
  neutral: 'rest',
};

/** How many past weeks to list. */
const SHOWN = 8;

/** "Tus semanas": past weekly results, newest first, each opening its result again. */
export function HistoryCard({ results }: { results: readonly WeeklyResult[] }) {
  const { t, locale } = useT();
  const phase = (value: WeeklyResult['phaseAfter']) => t(`evolution.phases.p${value}`);
  return (
    <Card as="section" className={styles.card}>
      <h2 className={styles.title}>{t('progress.history.title')}</h2>
      {results.length === 0 ? (
        <p className={styles.muted}>{t('progress.history.empty')}</p>
      ) : (
        <details className={styles.archive}>
          <summary>{t('redesign.history')}</summary>
          <ul className={`${styles.list} ${styles.rowList}`}>
            {[...results]
              .reverse()
              .slice(0, SHOWN)
              .map((week) => (
                <li key={week.week}>
                  <ListRow
                    leading={<PixelIcon name={ICONS[week.result]} size={32} />}
                    title={t(`week.results.${week.result}.title`)}
                    subtitle={[
                      t('progress.history.detail', {
                        range: formatDayRange(locale, week.start, addDays(week.start, 6)),
                        tally:
                          week.result === 'neutral'
                            ? phase(week.phaseAfter)
                            : t('week.tally', { good: week.good, planned: week.planned }),
                      }),
                      week.phaseAfter !== week.phaseBefore &&
                        t('progress.history.change', {
                          from: phase(week.phaseBefore),
                          to: phase(week.phaseAfter),
                        }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    to={weekPath(week.week)}
                  />
                </li>
              ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
