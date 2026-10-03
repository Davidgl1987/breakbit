import type { WeekStats } from '@/domain/stats/weekStats';
import type { DateKey } from '@/domain/types';
import { formatActiveTime, formatDayRange } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { MetricTile } from '@/ui/components/MetricTile/MetricTile';
import styles from './progress.module.css';

/** "Resumen semanal": this week's main figures, then the rest of the numbers. */
export function WeekSummaryCard({
  stats,
  from,
  to,
}: {
  stats: WeekStats;
  from: DateKey;
  to: DateKey;
}) {
  const { t, locale } = useT();
  const firstTry =
    stats.completed > 0 ? `${Math.round((stats.firstPrompt * 100) / stats.completed)} %` : '—';
  const of = (done: number, total: number) => t('progress.week.of', { done, total });

  return (
    <Card as="section" className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{t('progress.week.title')}</h2>
        <span className={styles.muted}>{formatDayRange(locale, from, to)}</span>
      </div>
      {stats.plannedDays === 0 ? (
        <p className={styles.muted}>{t('progress.week.empty')}</p>
      ) : (
        <>
          <div className={styles.tiles}>
            <MetricTile
              icon="completed"
              value={stats.completed}
              label={t('progress.week.completed')}
            />
            <MetricTile icon="first_try" value={firstTry} label={t('progress.week.firstTry')} />
            <MetricTile
              icon="walk"
              value={formatActiveTime(stats.movementSec)}
              label={t('progress.week.movement')}
            />
            <MetricTile
              icon="clock"
              value={formatActiveTime(stats.interruptionSec)}
              label={t('progress.week.interruption')}
            />
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>{t('progress.week.goodDays')}</dt>
              <dd>{of(stats.goodDays, stats.plannedDays)}</dd>
            </div>
            <div>
              <dt>{t('progress.week.main')}</dt>
              <dd>{of(stats.mainDays, stats.plannedDays)}</dd>
            </div>
            <div>
              <dt>{t('progress.week.postponed')}</dt>
              <dd>{stats.postponed}</dd>
            </div>
            <div>
              <dt>{t('progress.week.ignored')}</dt>
              <dd>{stats.ignored}</dd>
            </div>
            <div>
              <dt>{t('progress.week.skipped')}</dt>
              <dd>{stats.skipped}</dd>
            </div>
            <div>
              <dt>{t('progress.week.missed')}</dt>
              <dd>{stats.missed}</dd>
            </div>
            <div>
              <dt>{t('progress.week.extras')}</dt>
              <dd>{stats.extras}</dd>
            </div>
            <div>
              <dt>{t('progress.week.micro')}</dt>
              <dd>{formatActiveTime(stats.microSec)}</dd>
            </div>
            <div>
              <dt>{t('progress.week.xp')}</dt>
              <dd>{stats.xp}</dd>
            </div>
          </dl>
        </>
      )}
    </Card>
  );
}
