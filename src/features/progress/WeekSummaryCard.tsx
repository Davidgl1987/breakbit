import type { WeekStats } from '@/domain/stats/weekStats';
import type { DateKey } from '@/domain/types';
import { formatActiveTime, formatDayRange } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import styles from './progress.module.css';

/** "Resumen semanal": this week's main figures, then the rest of the numbers. */
export function WeekSummaryCard({
  stats,
  previous,
  from,
  to,
}: {
  stats: WeekStats;
  previous: WeekStats;
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
            <div>
              <strong>
                {stats.goodDays}/{stats.plannedDays}
              </strong>
              <span>{t('progress.week.goodDays')}</span>
            </div>
            <div>
              <strong>{stats.completed}</strong>
              <span>{t('progress.week.completed')}</span>
            </div>
            <div>
              <strong>{formatActiveTime(stats.movementSec)}</strong>
              <span>{t('progress.week.movement')}</span>
            </div>
          </div>
          <div className={styles.comparison}>
            <h3>{t('redesign.comparison')}</h3>
            {previous.plannedDays ? (
              <>
                <dl className={styles.facts}>
                  <div>
                    <dt>{t('progress.week.completed')}</dt>
                    <dd>
                      {stats.completed - previous.completed >= 0 ? '+' : '−'}
                      {Math.abs(stats.completed - previous.completed)}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('progress.week.movement')}</dt>
                    <dd>
                      {stats.movementSec - previous.movementSec >= 0 ? '+' : '−'}
                      {formatActiveTime(Math.abs(stats.movementSec - previous.movementSec))}
                    </dd>
                  </div>
                </dl>
                <p className={styles.muted}>{t('redesign.comparable')}</p>
              </>
            ) : (
              <p className={styles.muted}>{t('redesign.noComparison')}</p>
            )}
          </div>
          <details className={styles.more}>
            <summary>{t('redesign.details')}</summary>
            <dl className={styles.facts}>
              <div>
                <dt>{t('progress.week.firstTry')}</dt>
                <dd>{firstTry}</dd>
              </div>
              <div>
                <dt>{t('progress.week.interruption')}</dt>
                <dd>{formatActiveTime(stats.interruptionSec)}</dd>
              </div>
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
          </details>
        </>
      )}
    </Card>
  );
}
