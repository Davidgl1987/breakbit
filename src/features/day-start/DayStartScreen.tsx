import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import { CATALOG } from '@/content/catalog';
import { resolveDaySchedule, sameSchedule } from '@/domain/calendar/schedule';
import { choiceFits, mainChoiceOf } from '@/domain/day/planDay';
import { equipmentInPlan } from '@/domain/day/today';
import { summarizePlan } from '@/domain/planner/summary';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import { hasEquipment } from '@/domain/planner/selectExercise';
import { toDateKey } from '@/domain/time';
import type { DayPlan, DaySchedule, EquipmentId, Meeting } from '@/domain/types';
import { EquipmentSheet } from '@/features/day/EquipmentSheet';
import { EquipmentTodayCard } from '@/features/day/EquipmentTodayCard';
import { MainActivityCard } from '@/features/day/MainActivityCard';
import { MainActivitySheet } from '@/features/day/MainActivitySheet';
import { MeetingSheet } from '@/features/day/MeetingSheet';
import { nextMeetingId } from '@/features/day/meetings';
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
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './DayStartScreen.module.css';

interface DayDraft {
  schedule: DaySchedule;
  meetings: Meeting[];
  /**
   * "Material de hoy" once the user changes it (or the day under way already had a choice).
   * Until then the plan uses the user's equipment as it sees fit.
   */
  equipment?: EquipmentId[];
  /** Only set when the user picked it, or the day is already under way. */
  main?: MainActivityChoice;
}

type Sheet = 'main' | 'gear' | 'meeting' | null;

/**
 * /day/start — "Tu día": today's hours, equipment, main activity and meetings, with what
 * they mean (pauses, interruption, gear used). Starts the day, or adjusts it once it is
 * under way.
 */
export function DayStartScreen() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const now = useNow(60_000);
  const [date] = useState(() => toDateKey(clock.now()));
  const record = useAppStore((state) => state.days[date]);
  const settings = useAppStore((state) => state.settings);
  const overrides = useAppStore((state) => state.dayOverrides);
  const startDay = useAppStore((state) => state.startDay);
  const updateDayPlan = useAppStore((state) => state.updateDayPlan);
  const planner = useDayPlanner();
  const streak = useStreak(date);

  // Adjusting a day under way, or planning it.
  const [current] = useState(() => (record?.status === 'active' ? record.plan : undefined));
  // A plan saved with a future clock must be rebuilt from the actual time, even if
  // its hours stay unchanged. Never replace activities the user already acted on.
  const refreshFuturePlan =
    record?.openedAt !== undefined &&
    record.openedAt > now &&
    current?.activities.every((item) => item.status === 'pending' && item.startedAt === undefined);
  const [draft, setDraft] = useState<DayDraft>(() =>
    current
      ? {
          schedule: current.schedule,
          meetings: current.meetings,
          equipment: current.equipment,
          main: mainChoiceOf(current),
        }
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
        : preview(draft, current, settings.equipment, date, now, planner, refreshFuturePlan),
    [draft, current, settings.equipment, date, now, planner, refreshFuturePlan],
  );
  const summary = plan && summarizePlan(plan, CATALOG);
  const interruptionMin = summary ? Math.round(summary.interruptionSec / 60) : 0;
  // What today's plan uses: the card shows it, and the sheet starts from it.
  const gear = plan ? equipmentInPlan(plan, CATALOG) : [];

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
    setDraft((value) => ({
      ...value,
      meetings: value.meetings.filter((item) => item.id !== id),
    }));

  const save = () => {
    if (!plan) return;
    runScreenTransition(() => {
      if (current) updateDayPlan(plan);
      else startDay(plan);
      navigate(ROUTES.today, { replace: true });
    });
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

      {plan && (
        <EquipmentTodayCard
          plan={plan}
          used={gear}
          chosen={draft.equipment}
          onChange={() => setSheet('gear')}
        />
      )}

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
                label={t('dayStart.removeMeeting', {
                  start: meeting.start,
                  end: meeting.end,
                })}
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

      {sheet === 'main' && plan && (
        <MainActivitySheet
          schedule={draft.schedule}
          meetings={draft.meetings}
          equipment={draft.equipment ?? settings.equipment}
          current={mainChoiceOf(plan)}
          onClose={() => setSheet(null)}
          onSave={(main) => {
            setDraft((value) => ({ ...value, main }));
            setSheet(null);
          }}
        />
      )}
      {sheet === 'gear' && (
        <EquipmentSheet
          current={draft.equipment ?? gear}
          owned={settings.equipment}
          onClose={() => setSheet(null)}
          onSave={(equipment) => {
            // Saving what the plan already uses, without a choice yet, changes nothing.
            const same = !draft.equipment && sameItems(equipment, gear);
            if (!same) setDraft((value) => ({ ...value, equipment }));
            setSheet(null);
          }}
        />
      )}
      {sheet === 'meeting' && (
        <MeetingSheet
          schedule={draft.schedule}
          now={now}
          onSave={addMeeting}
          onClose={() => setSheet(null)}
        />
      )}
    </FlowLayout>
  );
}

/**
 * The plan the screen shows and saves. Before the day starts everything is proposed
 * afresh; once it is under way, changing only the main activity moves just that, and
 * new hours, equipment or meetings re-plan the rest of the day around what already
 * happened. A chosen main activity stays while it fits the hours and the equipment.
 */
function preview(
  draft: DayDraft,
  current: DayPlan | undefined,
  owned: readonly EquipmentId[],
  date: DayPlan['date'],
  now: number,
  planner: ReturnType<typeof useDayPlanner>,
  refreshFuturePlan = false,
): DayPlan {
  const main =
    draft.main &&
    choiceFits(draft.main, draft.schedule) &&
    mainAllowed(draft.main.activityId, draft.equipment ?? owned)
      ? draft.main
      : undefined;
  if (current && !refreshFuturePlan) {
    const sameDay =
      sameSchedule(draft.schedule, current.schedule) &&
      JSON.stringify(draft.meetings) === JSON.stringify(current.meetings) &&
      JSON.stringify(draft.equipment) === JSON.stringify(current.equipment);
    if (sameDay) {
      const unchanged = JSON.stringify(main) === JSON.stringify(mainChoiceOf(current));
      return main && !unchanged ? planner.changeMain(current, main, now) : current;
    }
  }
  return planner.plan({
    date,
    schedule: draft.schedule,
    meetings: draft.meetings,
    equipment: draft.equipment,
    mainActivity: main,
    previous: current,
    now,
  });
}

function sameItems(a: readonly EquipmentId[], b: readonly EquipmentId[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

/** Whether the day's equipment still allows a main activity. */
function mainAllowed(activityId: string, equipment: readonly EquipmentId[]): boolean {
  const activity = CATALOG.mainActivities.find((item) => item.id === activityId);
  return activity !== undefined && hasEquipment(activity.equipment, equipment);
}

function partOfDay(now: number): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date(now).getHours();
  if (hour < 14) return 'morning';
  return hour < 21 ? 'afternoon' : 'evening';
}
