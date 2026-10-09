import { useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { DAY_END_LEAD_MIN } from '@/domain/config';
import { mainChoiceOf } from '@/domain/day/planDay';
import { dayProgress } from '@/domain/day/progress';
import { mainActivityOf, nextPause, workEnd } from '@/domain/day/today';
import type { DayPlan, Instant, Meeting } from '@/domain/types';
import { MainActivityPreviewSheet } from '@/features/day/MainActivityPreviewSheet';
import { MainActivitySheet } from '@/features/day/MainActivitySheet';
import { MeetingSheet } from '@/features/day/MeetingSheet';
import { nextMeetingId } from '@/features/day/meetings';
import { PauseSheet } from '@/features/day/PauseSheet';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DayProgressCard } from './DayProgressCard';
import { MeetingsSheet } from './MeetingsSheet';
import { DayTimelineCard } from './DayTimelineCard';
import { MainActivityTodayCard } from './MainActivityTodayCard';
import { NextPauseCard } from './NextPauseCard';
import styles from './TodayScreen.module.css';

/** The pause's steps, today's meetings, or a meeting being added or changed. */
type Sheet = 'pause' | 'activity' | 'main' | 'meetings' | { meeting: string | 'new' } | null;

/**
 * Today under way: time left, next pause, the main activity, gear, progress and timeline.
 * "Reuniones" opens today's meetings (the time left sits next to the greeting).
 * "Hoy no trabajo" is offered only before the day starts.
 */
export function ActiveDay({ plan, over, now }: { plan: DayPlan; over: boolean; now: Instant }) {
  const { t } = useT();
  const [sheet, setSheet] = useState<Sheet>(null);
  const planner = useDayPlanner();
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);

  // New meetings re-plan the rest of the day around what already happened.
  const setMeetings = (meetings: Meeting[]) => {
    updateDayPlan(
      planner.plan({
        date: plan.date,
        schedule: plan.schedule,
        meetings: [...meetings].sort((a, b) => a.start.localeCompare(b.start)),
        mainActivity: mainChoiceOf(plan),
        previous: plan,
        now,
      }),
    );
    setSheet('meetings');
  };
  const editing =
    sheet !== null && typeof sheet === 'object'
      ? plan.meetings.find((meeting) => meeting.id === sheet.meeting)
      : undefined;

  const next = nextPause(plan, now);
  const main = mainActivityOf(plan);
  const progress = dayProgress(plan, CATALOG);
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
      ) : null}
      {!over && <NextPauseCard pause={next} now={now} onSee={() => setSheet('pause')} />}
      <DayProgressCard progress={progress} date={plan.date} />
      {!over && <MainActivityTodayCard plan={plan} now={now} onEdit={() => setSheet('activity')} />}
      {!over && (
        <ListRow
          leading={<PixelIcon name="meeting" size={32} />}
          title={t('today.meetings.row')}
          subtitle={
            plan.meetings.length
              ? plan.meetings.map((meeting) => `${meeting.start}–${meeting.end}`).join(' · ')
              : t('today.meetings.none')
          }
          onClick={() => setSheet('meetings')}
        />
      )}
      <DayTimelineCard plan={plan} now={now} nextId={next?.id} />
      {!over && !endingSoon && (
        <Link to={ROUTES.dayEnd} className={buttonClassName({ variant: 'ghost', fullWidth: true })}>
          {t('today.states.closeDay')}
        </Link>
      )}
      {sheet === 'activity' && main && (
        <MainActivityPreviewSheet
          activity={main}
          onEdit={() => setSheet('main')}
          onClose={() => setSheet(null)}
        />
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

      {sheet === 'pause' && next && (
        <PauseSheet content={next.content} slot={next.slot} onClose={() => setSheet(null)} />
      )}
      {sheet === 'meetings' && (
        <MeetingsSheet
          meetings={plan.meetings}
          onAdd={() => setSheet({ meeting: 'new' })}
          onEdit={(id) => setSheet({ meeting: id })}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet !== null && typeof sheet === 'object' && (
        <MeetingSheet
          schedule={plan.schedule}
          now={now}
          meeting={editing}
          onSave={(meeting) =>
            setMeetings(
              editing
                ? plan.meetings.map((item) =>
                    item.id === editing.id ? { ...meeting, id: item.id } : item,
                  )
                : [...plan.meetings, { ...meeting, id: nextMeetingId(plan.meetings) }],
            )
          }
          onRemove={
            editing
              ? () => setMeetings(plan.meetings.filter((item) => item.id !== editing.id))
              : undefined
          }
          onClose={() => setSheet('meetings')}
        />
      )}
    </>
  );
}
