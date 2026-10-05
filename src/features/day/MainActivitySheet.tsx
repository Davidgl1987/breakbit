import { useState } from 'react';
import { CATALOG } from '@/content/catalog';
import type { MainActivityChoice } from '@/domain/planner/placeMainActivity';
import { hasEquipment } from '@/domain/planner/selectExercise';
import { mainActivityDuration } from '@/domain/planner/selectMainActivity';
import { buildTimeline, overlaps, slotAt } from '@/domain/planner/timeline';
import { isValidHHmm, toMinutes } from '@/domain/time';
import type { DaySchedule, HHmm, Meeting } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/store';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { OptionList } from '@/ui/components/OptionList/OptionList';
import { TimeField } from '@/ui/components/TimeField/TimeField';
import { mainActivityIcon } from './catalogDisplay';
import styles from './day.module.css';

interface MainActivitySheetProps {
  schedule: DaySchedule;
  meetings: readonly Meeting[];
  current?: MainActivityChoice;
  onSave: (choice: MainActivityChoice) => void;
  onClose: () => void;
}

/** "Cambiar actividad": pick today's main activity and when to do it. */
export function MainActivitySheet({
  schedule,
  meetings,
  current,
  onSave,
  onClose,
}: MainActivitySheetProps) {
  const { t, locale } = useT();
  const settings = useAppStore((state) => state.settings);
  const activities = CATALOG.mainActivities.filter((activity) =>
    hasEquipment(activity.equipment, settings.equipment),
  );
  const durationOf = (activityId: string) => {
    if (activityId === current?.activityId) return current.durationMin;
    const activity = activities.find((item) => item.id === activityId);
    return activity ? mainActivityDuration(activity, settings.preferredMainActivityMin) : 0;
  };

  const available = activities.some((activity) => activity.id === current?.activityId);
  const [activityId, setActivityId] = useState(
    (available ? current?.activityId : activities[0]?.id) ?? '',
  );
  const [start, setStart] = useState<string>(current?.start ?? schedule.workStart);
  const durationMin = durationOf(activityId);
  const check = checkTime(schedule, meetings, start, durationMin);

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={t('mainActivity.sheetTitle')}
      actions={
        <>
          <Button
            fullWidth
            disabled={check.kind === 'invalid'}
            onClick={() => onSave({ activityId, start: start as HHmm, durationMin })}
          >
            {t('mainActivity.save')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('mainActivity.cancel')}
          </Button>
        </>
      }
    >
      <div className={styles.sheetBody}>
        <OptionList
          label={t('mainActivity.sheetTitle')}
          value={activityId}
          onChange={setActivityId}
          options={activities.map((activity) => ({
            value: activity.id,
            label: activity.name[locale],
            description: t('common.minutes', { count: durationOf(activity.id) }),
            icon: mainActivityIcon(activity.id),
          }))}
        />
        <TimeField label={t('mainActivity.time')} icon="clock" value={start} onChange={setStart} />
        {check.kind === 'invalid' && (
          <InlineMessage tone="danger">{t('mainActivity.outside')}</InlineMessage>
        )}
        {check.kind === 'ok' &&
          (check.warning ? (
            <InlineMessage icon="warning">{t(`mainActivity.${check.warning}`)}</InlineMessage>
          ) : (
            <p className={styles.muted}>{capitalize(t(`mainActivity.where.${check.slot}`))}</p>
          ))}
      </div>
    </BottomSheet>
  );
}

type TimeCheck =
  | { kind: 'invalid' }
  | { kind: 'ok'; slot: 'work' | 'break' | 'meeting'; warning?: 'lunch' | 'busy' };

/** Inside the workday; overlapping lunch or a busy meeting is allowed, with a heads-up. */
function checkTime(
  schedule: DaySchedule,
  meetings: readonly Meeting[],
  start: string,
  durationMin: number,
): TimeCheck {
  if (!isValidHHmm(start)) return { kind: 'invalid' };
  const timeline = buildTimeline(schedule, meetings);
  const interval = { start: toMinutes(start), end: toMinutes(start) + durationMin };
  if (interval.start < timeline.workStart || interval.end > timeline.workEnd) {
    return { kind: 'invalid' };
  }
  const slot = slotAt(timeline, interval.start);
  if (timeline.lunch && overlaps(timeline.lunch, interval))
    return { kind: 'ok', slot, warning: 'lunch' };
  if (timeline.busyMeetings.some((meeting) => overlaps(meeting, interval))) {
    return { kind: 'ok', slot, warning: 'busy' };
  }
  return { kind: 'ok', slot };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
