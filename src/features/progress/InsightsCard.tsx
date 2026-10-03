import type { Insight } from '@/domain/stats/insights';
import { weekdayOf } from '@/domain/time';
import type { DateKey } from '@/domain/types';
import { formatActiveTime, weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

const ICONS: Record<Insight['kind'], IconName> = {
  first_prompt: 'first_try',
  postponed: 'postponed',
  ignored: 'bell',
  movement: 'walk',
  main: 'goal',
  completed: 'completed',
};

/**
 * "Esta semana": up to three things worth telling. Changes against last week come in
 * either direction, said plainly; then facts about this week.
 */
export function InsightsCard({
  insights,
  today,
}: {
  insights: readonly Insight[];
  today: DateKey;
}) {
  const { t, locale } = useT();
  const weekday = weekdayOf(today);
  const text = (insight: Insight): string => {
    switch (insight.kind) {
      case 'first_prompt':
      case 'postponed':
      case 'ignored': {
        const key = insight.kind === 'first_prompt' ? 'firstPrompt' : insight.kind;
        const direction = insight.change > 0 ? 'More' : 'Fewer';
        return t(`progress.insights.${key}${direction}`, { count: Math.abs(insight.change) });
      }
      case 'movement':
        return t(
          insight.changeSec > 0
            ? 'progress.insights.movementMore'
            : 'progress.insights.movementLess',
          { time: formatActiveTime(Math.abs(insight.changeSec)) },
        );
      case 'main':
        return t('progress.insights.main', { done: insight.done, total: insight.total });
      case 'completed':
        return t('progress.insights.completed', { percent: insight.percent });
    }
  };
  const compared = (insight: Insight) => insight.kind !== 'main' && insight.kind !== 'completed';

  return (
    <Card as="section" className={styles.card}>
      <h2 className={styles.title}>{t('progress.insights.title')}</h2>
      {insights.length === 0 ? (
        <p className={styles.muted}>{t('progress.insights.empty')}</p>
      ) : (
        <ul className={`${styles.list} ${styles.insights}`}>
          {insights.slice(0, 3).map((insight) => (
            <li key={insight.kind} className={styles.insight}>
              <PixelIcon name={ICONS[insight.kind]} size={24} />
              <span className={styles.insightTexts}>
                {text(insight)}
                {/* Mid-week, last week is counted only up to the same day. */}
                {compared(insight) && weekday < 7 && (
                  <span className={styles.insightNote}>
                    {t('progress.insights.upTo', { day: weekdayName(locale, weekday) })}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
