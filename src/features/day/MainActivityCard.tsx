import { CATALOG } from '@/content/catalog';
import { mainActivityOf } from '@/domain/day/today';
import { buildTimeline, contains } from '@/domain/planner/timeline';
import { minutesOfDay } from '@/domain/time';
import type { DayPlan, ScheduledActivity } from '@/domain/types';
import { formatClock } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { StatusBadge } from '@/ui/components/StatusBadge/StatusBadge';
import { mainActivityIcon } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './MainActivityCard.module.css';

interface MainActivityCardProps {
  plan: DayPlan;
  /** Opens "Cambiar actividad"; hidden once the activity has started. */
  onChange?: () => void;
  /** Narrow layout for a half-width card. */
  compact?: boolean;
}

/** Today's main activity: what, how long, when, and where it falls. */
export function MainActivityCard({ plan, onChange, compact = false }: MainActivityCardProps) {
  const { t, locale } = useT();
  const main = mainActivityOf(plan);
  const activityId = main?.content.kind === 'main' ? main.content.activityId : undefined;
  const activity = CATALOG.mainActivities.find((item) => item.id === activityId);
  const done = main?.status === 'completed';
  const locked = !main || main.status !== 'pending' || main.startedAt !== undefined;

  return (
    <Card as="section" className={styles.card} data-compact={compact || undefined}>
      <h3 className={styles.title}>{t('today.mainActivity')}</h3>
      {main && activity ? (
        <div className={styles.content}>
          <PixelIcon name={mainActivityIcon(activity.id)} size={compact ? 32 : 48} />
          <div className={styles.texts}>
            <span className={styles.name}>
              {activity.name[locale]} · {t('common.minutes', { count: main.durationSec / 60 })}
            </span>
            <span className={styles.when}>
              {compact
                ? t('today.mainAt', { time: formatClock(main.currentScheduledAt) })
                : t('mainActivity.when', {
                    time: formatClock(main.currentScheduledAt),
                    where: t(`mainActivity.where.${whereIs(plan, main)}`),
                  })}
            </span>
          </div>
        </div>
      ) : (
        <p className={styles.when}>{t('today.noMain')}</p>
      )}
      {done && <StatusBadge status="completed" />}
      {onChange && !locked && (
        <Button variant="secondary" size="sm" fullWidth={compact} onClick={onChange}>
          {t('dayStart.change')}
        </Button>
      )}
    </Card>
  );
}

/** The activity's slot, or lunch (which has no slot of its own: nothing is planned there). */
function whereIs(plan: DayPlan, main: ScheduledActivity) {
  const lunch = buildTimeline(plan.schedule, plan.meetings).lunch;
  return lunch && contains(lunch, minutesOfDay(main.currentScheduledAt)) ? 'lunch' : main.slot;
}
