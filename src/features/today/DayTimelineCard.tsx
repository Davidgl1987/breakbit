import type { DayPlan, Instant } from '@/domain/types';
import { contentName } from '@/features/day/contentName';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { cx } from '@/ui/cx';
import { timelineItems, type TimelineItem } from './timelineItems';
import styles from './DayTimelineCard.module.css';

interface DayTimelineCardProps {
  plan: DayPlan;
  now: Instant;
  /** The pause shown as "next", highlighted in the list. */
  nextId?: string;
}

/** "Tu jornada": the whole day in order; what's behind is faded, the next pause stands out. */
export function DayTimelineCard({ plan, now, nextId }: DayTimelineCardProps) {
  const { t, locale } = useT();

  const until = (label: string, end: Instant) =>
    t('timeline.until', { label, time: formatClock(end) });
  const label = (item: TimelineItem): string => {
    switch (item.kind) {
      case 'workStart':
        return t('timeline.workStart');
      case 'workEnd':
        return t('timeline.workEnd');
      case 'break':
        return until(t('timeline.break'), item.end);
      case 'lunch':
        return until(t('timeline.lunch'), item.end);
      case 'meeting':
        return until(item.canMove ? t('timeline.meetingCanMove') : t('timeline.meeting'), item.end);
      case 'pause':
        return t('timeline.pause', { name: contentName(item.activity.content, locale) });
      case 'main':
        return `${contentName(item.activity.content, locale)} · ${t('common.minutes', {
          count: item.activity.durationSec / 60,
        })}`;
    }
  };

  return (
    <Card as="section" className={styles.card}>
      <h3 className={styles.title}>{t('today.dayTitle')}</h3>
      <ol className={styles.list}>
        {timelineItems(plan).map((item, index) => {
          const end = 'end' in item ? item.end : item.at;
          const status = 'activity' in item ? item.activity.status : undefined;
          const isNext = 'activity' in item && item.activity.id === nextId;
          return (
            <li
              key={index}
              className={cx(
                styles.item,
                styles[item.kind],
                end < now && !isNext && styles.past,
                isNext && styles.next,
              )}
            >
              <span className={styles.time}>{formatClock(item.at)}</span>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{label(item)}</span>
              {status === 'completed' && (
                <StatusBadge
                  status={
                    'activity' in item && item.activity.firstPrompt ? 'firstTry' : 'completed'
                  }
                />
              )}
              {status === 'missed' && <StatusBadge status="missed" />}
              {status === 'skipped' && <StatusBadge status="skipped" />}
              {status === 'postponed' && <StatusBadge status="postponed" />}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
