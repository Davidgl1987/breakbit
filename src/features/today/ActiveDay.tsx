import { useState } from 'react';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { mainChoiceOf } from '@/domain/day/planDay';
import { dayProgress } from '@/domain/day/progress';
import { equipmentInPlan, nextPause, workEnd } from '@/domain/day/today';
import { atTime } from '@/domain/time';
import type { DayPlan, Instant } from '@/domain/types';
import { AtHandRow } from '@/features/day/AtHandRow';
import { DayOffSheet } from '@/features/day/DayOffSheet';
import { MainActivityCard } from '@/features/day/MainActivityCard';
import { MainActivitySheet } from '@/features/day/MainActivitySheet';
import { PauseSheet } from '@/features/day/PauseSheet';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DayProgressCard } from './DayProgressCard';
import { DayTimelineCard } from './DayTimelineCard';
import { NextPauseCard } from './NextPauseCard';
import styles from './TodayScreen.module.css';

type Sheet = 'main' | 'pause' | 'dayOff' | null;

/** Today under way: time left, next pause, the main activity, gear, progress and timeline. */
export function ActiveDay({ plan, over, now }: { plan: DayPlan; over: boolean; now: Instant }) {
  const { t } = useT();
  const planner = useDayPlanner();
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);
  const markDayOff = useAppStore((state) => state.markDayOff);
  const [sheet, setSheet] = useState<Sheet>(null);

  const next = nextPause(plan, now);
  const progress = dayProgress(plan, CATALOG);
  const gear = equipmentInPlan(plan, CATALOG);
  const start = atTime(plan.date, plan.schedule.workStart);
  const minutesLeft = (workEnd(plan) - now) / 60_000;

  return (
    <>
      {over ? (
        <Card as="section" className={styles.stateCard}>
          <PixelIcon name="good_day" size={48} />
          <div className={styles.stateTexts}>
            <h2 className={styles.stateTitle}>{t('today.states.over')}</h2>
            <p className={styles.muted}>{t('today.states.overBody')}</p>
          </div>
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
          <MainActivityCard compact plan={plan} onChange={() => setSheet('main')} />
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
        <PauseSheet content={next.content} onClose={() => setSheet(null)} />
      )}
      {sheet === 'main' && (
        <MainActivitySheet
          schedule={plan.schedule}
          meetings={plan.meetings}
          current={mainChoiceOf(plan)}
          onClose={() => setSheet(null)}
          onSave={(choice) => {
            updateDayPlan(planner.changeMain(plan, choice, now));
            setSheet(null);
          }}
        />
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
