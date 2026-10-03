import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { resolveDaySchedule, sameSchedule } from '@/domain/calendar/schedule';
import { choiceFits, mainChoiceOf } from '@/domain/day/planDay';
import { equipmentInPlan } from '@/domain/day/today';
import { summarizePlan } from '@/domain/planner/summary';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import { toDateKey } from '@/domain/time';
import type { DayPlan, DaySchedule, Meeting } from '@/domain/types';
import { AtHandRow } from '@/features/day/AtHandRow';
import { DayOffSheet } from '@/features/day/DayOffSheet';
import { MainActivityCard } from '@/features/day/MainActivityCard';
import { MainActivitySheet } from '@/features/day/MainActivitySheet';
import { MeetingSheet } from '@/features/day/MeetingSheet';
import { useDayPlanner } from '@/features/day/useDayPlanner';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useStreak } from '@/state/selectors';
import { useAppStore } from '@/state/store';
import { useNow } from '@/state/useNow';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { MetricTile } from '@/ui/components/MetricTile/MetricTile';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './DayStartScreen.module.css';

interface DayDraft {
  schedule: DaySchedule;
  meetings: Meeting[];
  /** Only set when the user picked it, or the day is already under way. */
  main?: MainActivityChoice;
}

type Sheet = 'main' | 'meeting' | 'dayOff' | null;

/**
 * /day/start — "Tu día": today's hours, main activity and meetings, with what they mean
 * (pauses, interruption, gear). Starts the day, or adjusts it once it is under way.
 */
export function DayStartScreen() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const now = useNow(60_000);
  const [date] = useState(() => toDateKey(clock.now()));
  const record = useAppStore((state) => state.days[date]);
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const phase = useAppStore((state) => state.progress.evolutionPhase);
  const startDay = useAppStore((state) => state.startDay);
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);
  const markDayOff = useAppStore((state) => state.markDayOff);
  const planner = useDayPlanner();
  const streak = useStreak(date);

  // Adjusting a day under way, or planning it.
  const [current] = useState(() => (record?.status === 'active' ? record.plan : undefined));
  const [draft, setDraft] = useState<DayDraft>(() =>
    current
      ? { schedule: current.schedule, meetings: current.meetings, main: mainChoiceOf(current) }
      : {
          schedule: resolveDaySchedule(date, settings, overrides) ?? settings.schedule,
          meetings: [],
        },
  );
  const [sheet, setSheet] = useState<Sheet>(null);

  const issues = scheduleIssueMessages(draft.schedule);
  const plan = useMemo(
    () =>
      scheduleIssueMessages(draft.schedule).length > 0
        ? undefined
        : preview(draft, current, date, now, planner),
    [draft, current, date, now, planner],
  );
  const summary = plan && summarizePlan(plan, CATALOG);
  const interruptionMin = summary ? Math.round(summary.interruptionSec / 60) : 0;
  const gear = plan && equipmentInPlan(plan, CATALOG);

  const setSchedule = (schedule: DaySchedule) => setDraft((value) => ({ ...value, schedule }));
  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    setDraft((value) => ({
      ...value,
      meetings: [...value.meetings, { ...meeting, id: nextMeetingId(value.meetings) }].sort(
        (a, b) => a.start.localeCompare(b.start),
      ),
    }));
    setSheet(null);
  };
  const removeMeeting = (id: string) =>
    setDraft((value) => ({ ...value, meetings: value.meetings.filter((item) => item.id !== id) }));

  const save = () => {
    if (!plan) return;
    if (current) updateDayPlan(plan);
    else startDay(plan);
    navigate(ROUTES.today, { replace: true });
  };

  return (
    <FlowLayout
      top={
        <IconButton label={t('dayStart.close')} to={ROUTES.today}>
          <LineIcon name="close" size={22} />
        </IconButton>
      }
      header={
        <ScreenHeader
          title={current ? t('dayStart.editTitle') : t(`dayStart.greeting.${partOfDay(now)}`)}
          subtitle={formatLongDate(locale, date)}
          trailing={<Avatar phase={phase} size="sm" />}
        />
      }
      footer={
        <Button size="lg" fullWidth disabled={!plan} onClick={save}>
          {current ? t('dayStart.save') : t('dayStart.start')}
        </Button>
      }
    >
      <div className={styles.stats}>
        <MetricTile icon="streak" value={streak} label={t('dayStart.streak', { count: streak })} />
        <MetricTile
          icon="stretch"
          value={summary ? summary.microCount : '–'}
          label={t('dayStart.pauses', { count: summary?.microCount ?? 0 })}
        />
        <MetricTile
          icon="clock"
          value={summary ? `~${t('common.minutes', { count: interruptionMin })}` : '–'}
          label={t('dayStart.interruption')}
        />
      </div>
      {summary && summary.microCount === 0 && (
        <InlineMessage icon="info">{t('dayStart.noRoom')}</InlineMessage>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dayStart.hours')}</h2>
        <ScheduleFields grouped schedule={draft.schedule} onChange={setSchedule} />
        {issues.length > 0 ? (
          <InlineMessage tone="danger">
            <ul>
              {issues.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </InlineMessage>
        ) : (
          <p className={styles.note}>{t('dayStart.hoursNote')}</p>
        )}
      </section>

      {plan && <MainActivityCard plan={plan} onChange={() => setSheet('main')} />}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dayStart.meetings')}</h2>
        {draft.meetings.length === 0 && (
          <p className={styles.note}>{t('dayStart.meetingsEmpty')}</p>
        )}
        {draft.meetings.map((meeting) => (
          <ListRow
            key={meeting.id}
            leading={<PixelIcon name="meeting" size={32} />}
            title={`${meeting.start}–${meeting.end}`}
            subtitle={meeting.canMove ? t('dayStart.canMove') : undefined}
            trailing={
              <IconButton
                label={t('dayStart.removeMeeting', { start: meeting.start, end: meeting.end })}
                onClick={() => removeMeeting(meeting.id)}
              >
                <LineIcon name="close" size={20} />
              </IconButton>
            }
          />
        ))}
        <Button
          variant="ghost"
          iconStart={<PixelIcon name="add" size={24} />}
          onClick={() => setSheet('meeting')}
        >
          {t('dayStart.addMeeting')}
        </Button>
      </section>

      {gear &&
        (gear.length > 0 ? (
          <AtHandRow equipment={gear} />
        ) : (
          <p className={styles.note}>{t('dayStart.noGear')}</p>
        ))}

      <Button variant="ghost" onClick={() => setSheet('dayOff')}>
        {t('today.dayOff')}
      </Button>

      {sheet === 'main' && plan && (
        <MainActivitySheet
          schedule={draft.schedule}
          meetings={draft.meetings}
          current={mainChoiceOf(plan)}
          onClose={() => setSheet(null)}
          onSave={(main) => {
            setDraft((value) => ({ ...value, main }));
            setSheet(null);
          }}
        />
      )}
      {sheet === 'meeting' && (
        <MeetingSheet
          schedule={draft.schedule}
          now={now}
          onAdd={addMeeting}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'dayOff' && (
        <DayOffSheet
          onClose={() => setSheet(null)}
          onConfirm={() => {
            markDayOff(date);
            navigate(ROUTES.today, { replace: true });
          }}
        />
      )}
    </FlowLayout>
  );
}

/**
 * The plan the screen shows and saves. Before the day starts everything is proposed
 * afresh; once it is under way, changing only the main activity moves just that, and
 * new hours or meetings re-plan the rest of the day around what already happened.
 */
function preview(
  draft: DayDraft,
  current: DayPlan | undefined,
  date: DayPlan['date'],
  now: number,
  planner: ReturnType<typeof useDayPlanner>,
): DayPlan {
  const main = draft.main && choiceFits(draft.main, draft.schedule) ? draft.main : undefined;
  if (current) {
    const sameDay =
      sameSchedule(draft.schedule, current.schedule) &&
      JSON.stringify(draft.meetings) === JSON.stringify(current.meetings);
    if (sameDay) {
      const unchanged = JSON.stringify(main) === JSON.stringify(mainChoiceOf(current));
      return main && !unchanged ? planner.changeMain(current, main, now) : current;
    }
  }
  return planner.plan({
    date,
    schedule: draft.schedule,
    meetings: draft.meetings,
    mainActivity: main,
    previous: current,
    now,
  });
}

function nextMeetingId(meetings: readonly Meeting[]): string {
  const taken = new Set(meetings.map((meeting) => meeting.id));
  let n = meetings.length + 1;
  while (taken.has(`m${n}`)) n++;
  return `m${n}`;
}

function partOfDay(now: number): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date(now).getHours();
  if (hour < 14) return 'morning';
  return hour < 21 ? 'afternoon' : 'evening';
}
