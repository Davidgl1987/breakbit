import { useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { DAY_END_LEAD_MIN } from '@/domain/config';
import { dayProgress } from '@/domain/day/progress';
import { equipmentInPlan, nextPause, workEnd } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DayPlan, Instant } from '@/domain/types';
import { AtHandRow } from '@/features/day/AtHandRow';
import { DayOffSheet } from '@/features/day/DayOffSheet';
import { PauseSheet } from '@/features/day/PauseSheet';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DayProgressCard } from './DayProgressCard';
import { DayTimelineCard } from './DayTimelineCard';
import { MainActivityTodayCard } from './MainActivityTodayCard';
import { NextPauseCard } from './NextPauseCard';
import styles from './TodayScreen.module.css';

type Sheet = 'pause' | 'dayOff' | null;

/** Today under way: time left, next pause, the main activity, gear, progress and timeline. */
export function ActiveDay({ plan, over, now }: { plan: DayPlan; over: boolean; now: Instant }) {
  const { t } = useT();
  const markDayOff = useAppStore((state) => state.markDayOff);
  const [sheet, setSheet] = useState<Sheet>(null);

  const next = nextPause(plan, now);
  const progress = dayProgress(plan, CATALOG);
  const gear = equipmentInPlan(plan, CATALOG);
  const start = atTime(plan.date, plan.schedule.workStart);
  const minutesLeft = (workEnd(plan) - now) / 60_000;
  // From 10 min before the end, the way to close the day.
  const endingSoon = minutesLeft <= DAY_END_LEAD_MIN;

  return (
    <>
      {over || endingSoon ? (
        <Card as="section" variant="tinted" className={styles.stateCard}>
          <PixelIcon name="moon" size={48} />
          <div className={styles.stateTexts}>
            <h2 className={styles.stateTitle}>
              {over
                ? t('today.states.over')
                : t('today.states.endingSoon', { time: plan.schedule.workEnd })}
            </h2>
            <p className={styles.muted}>
              {over ? t('today.states.overBody') : t('today.states.endingSoonBody')}
            </p>
          </div>
          <Link to={ROUTES.dayEnd} className={buttonClassName({ size: 'lg', fullWidth: true })}>
            {t('today.states.closeDay')}
          </Link>
        </Card>
      ) : (
        <ListRow
          leading={<PixelIcon name="clock" size={32} />}
          title={
            now < start
              ? t('today.startsAt', { time: plan.schedule.workStart })
              : t('today.timeLeft', { time: formatDuration(Math.ceil(minutesLeft)) })
          }
          to={ROUTES.dayStart}
        />
      )}

      {!over && (
        <div className={styles.pair}>
          <NextPauseCard pause={next} now={now} onSee={() => setSheet('pause')} />
          <MainActivityTodayCard plan={plan} now={now} />
        </div>
      )}

      {gear.length > 0 && <AtHandRow equipment={gear} />}
      <DayProgressCard progress={progress} />
      <DayTimelineCard plan={plan} now={now} nextId={next?.id} />

      {!over && (
        <Button variant="ghost" onClick={() => setSheet('dayOff')}>
          {t('today.dayOff')}
        </Button>
      )}

      {sheet === 'pause' && next && (
        <PauseSheet content={next.content} slot={next.slot} onClose={() => setSheet(null)} />
      )}
      {sheet === 'dayOff' && (
        <DayOffSheet
          onClose={() => setSheet(null)}
          onConfirm={() => {
            markDayOff(plan.date);
            setSheet(null);
          }}
        />
      )}
    </>
  );
}
