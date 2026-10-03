import { GOALS } from '../config';
import { addDays } from '../time';
import type { DateKey } from '../types';
import { dayStat, type DayStat, type HistoryInput } from './days';

/**
 * How a day looks on the heatmap, by how much of it was done rather than by raw counts:
 * 0 nothing, 1 a little (<40 %), 2 medium (40–69 %), 3 high (≥70 % but not a good day),
 * 4 a good day. Days off look different, and days outside the history are blank.
 */
export type HeatLevel = 0 | 1 | 2 | 3 | 4 | 'off' | 'blank';

export function heatLevel(stat: DayStat): HeatLevel {
  switch (stat.kind) {
    case 'before':
    case 'future':
      return 'blank';
    case 'off':
      return 'off';
    case 'absent':
    case 'pending':
      return 0;
    case 'worked': {
      const { summary } = stat;
      if (summary.isGood) return 4;
      if (summary.planned === 0) return summary.mainCompleted ? 2 : 0;
      const percent = (summary.completed * 100) / summary.planned;
      if (percent >= GOALS.goodDayMinRatio * 100) return 3;
      if (percent >= 40) return 2;
      if (summary.completed > 0 || summary.mainCompleted) return 1;
      return 0;
    }
  }
}

export interface HeatCell {
  date: DateKey;
  level: HeatLevel;
}

/** `count` weeks (Monday to Sunday) ending with the one that starts on `lastWeek`. */
export function heatmapWeeks(lastWeek: DateKey, count: number, input: HistoryInput): HeatCell[][] {
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(lastWeek, (i - count + 1) * 7);
    return Array.from({ length: 7 }, (_, day) => {
      const date = addDays(start, day);
      return { date, level: heatLevel(dayStat(date, input)) };
    });
  });
}
