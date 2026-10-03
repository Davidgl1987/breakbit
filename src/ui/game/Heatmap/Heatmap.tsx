import type { CSSProperties } from 'react';
import { cx } from '@/ui/cx';
import styles from './Heatmap.module.css';

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4 | 'off' | 'blank';

export interface HeatmapWeek {
  key: string;
  days: { key: string; level: HeatmapLevel; title?: string }[];
}

interface HeatmapProps {
  /** What the grid says, for screen readers (the squares themselves are decorative). */
  label: string;
  weeks: readonly HeatmapWeek[];
  /** One label per weekday row, Monday first; empty strings leave a row unlabelled. */
  dayLabels: readonly string[];
  legend: { less: string; more: string; off: string };
}

const LEVEL_CLASS = {
  0: 'l0',
  1: 'l1',
  2: 'l2',
  3: 'l3',
  4: 'l4',
  off: 'off',
  blank: 'blank',
} as const;

/** Consistency at a glance: a square per day, darker the more of it was done. */
export function Heatmap({ label, weeks, dayLabels, legend }: HeatmapProps) {
  return (
    <div>
      <div
        role="img"
        aria-label={label}
        className={styles.heatmap}
        style={{ '--weeks': weeks.length } as CSSProperties}
      >
        {dayLabels.map((day, index) => (
          <span key={`label-${index}`} className={styles.dayLabel} aria-hidden="true">
            {day}
          </span>
        ))}
        {weeks.flatMap((week) =>
          week.days.map((day) => (
            <span
              key={day.key}
              className={cx(styles.cell, styles[LEVEL_CLASS[day.level]])}
              title={day.title}
            />
          )),
        )}
      </div>
      <div className={styles.legend} aria-hidden="true">
        <span>{legend.less}</span>
        <span className={styles.scale}>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <span key={level} className={cx(styles.swatch, styles[LEVEL_CLASS[level]])} />
          ))}
        </span>
        <span>{legend.more}</span>
        <span className={cx(styles.swatch, styles.off)} />
        <span>{legend.off}</span>
      </div>
    </div>
  );
}
