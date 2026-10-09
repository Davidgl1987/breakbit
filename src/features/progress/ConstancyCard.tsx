import { useState } from 'react';
import type { HistoryInput } from '@/domain/stats/days';
import { heatmapWeeks, type HeatLevel } from '@/domain/stats/heatmap';
import { addDays, compareDateKeys, startOfWeek } from '@/domain/time';
import { formatLongDate, formatDayRange, weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Heatmap } from '@/ui/game/Heatmap/Heatmap';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './progress.module.css';

/** Four rows of weeks, with weekday columns. */
const WEEKS = 4;

/** "Tu constancia": four weeks, with previous and next period controls. */
export function ConstancyCard({ history }: { history: HistoryInput }) {
  const { t, locale } = useT();
  const [periodsBack, setPeriodsBack] = useState(0);
  const lastWeek = addDays(startOfWeek(history.today), -7 * WEEKS * periodsBack);
  const weeks = heatmapWeeks(lastWeek, WEEKS, history);
  const from = weeks[0]![0]!.date;
  const to = weeks.at(-1)![6]!.date;
  const hasEarlier = compareDateKeys(from, history.since) > 0;

  const levelName = (level: HeatLevel) =>
    level === 'off'
      ? t('progress.heatmap.levels.off')
      : t(`progress.heatmap.levels.l${level === 'blank' ? 0 : level}`);
  const cells = weeks.flat();
  const good = cells.filter((cell) => cell.level === 4).length;
  const planned = cells.filter((cell) => typeof cell.level === 'number').length;

  return (
    <Card as="section" className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headTexts}>
          <h2 className={styles.title}>{t('progress.heatmap.title')}</h2>
        </div>
        <div className={styles.nav}>
          <IconButton
            label={t('progress.heatmap.previous')}
            disabled={!hasEarlier}
            onClick={() => setPeriodsBack((value) => value + 1)}
          >
            <LineIcon name="chevron-left" size={18} />
          </IconButton>
          <span>{formatDayRange(locale, from, to)}</span>
          <IconButton
            label={t('progress.heatmap.next')}
            disabled={periodsBack === 0}
            onClick={() => setPeriodsBack((value) => Math.max(0, value - 1))}
          >
            <LineIcon name="chevron-right" size={18} />
          </IconButton>
        </div>
      </div>
      <Heatmap
        label={t('progress.heatmap.summary', {
          good,
          planned,
          from: formatLongDate(locale, from),
          to: formatLongDate(locale, to),
        })}
        dayLabels={Array.from({ length: 7 }, (_, i) =>
          weekdayName(locale, (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7, 'narrow'),
        )}
        weeks={weeks.map((week) => ({
          key: week[0]!.date,
          days: week.map((cell) => ({
            key: cell.date,
            level: cell.level,
            title:
              cell.level === 'blank'
                ? undefined
                : `${formatLongDate(locale, cell.date)}: ${levelName(cell.level)}`,
          })),
        }))}
        legend={{
          less: t('progress.heatmap.less'),
          more: t('progress.heatmap.more'),
          off: t('progress.heatmap.off'),
        }}
      />
    </Card>
  );
}
