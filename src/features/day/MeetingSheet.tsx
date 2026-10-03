import { useState } from 'react';
import { fromMinutes, isValidHHmm, minutesOfDay, toMinutes } from '@/domain/time';
import type { DaySchedule, HHmm, Instant, Meeting } from '@/domain/types';
import { RangeFields } from '@/features/schedule/ScheduleFields';
import type { TimeRange } from '@/features/schedule/timeRange';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import styles from './day.module.css';

const DEFAULT_LENGTH_MIN = 30;

interface MeetingSheetProps {
  schedule: DaySchedule;
  now: Instant;
  onAdd: (meeting: Omit<Meeting, 'id'>) => void;
  onClose: () => void;
}

/** "Añadir reunión": when, and whether the user can move during it. */
export function MeetingSheet({ schedule, now, onAdd, onClose }: MeetingSheetProps) {
  const { t } = useT();
  const [range, setRange] = useState<TimeRange>(() => defaultRange(schedule, now));
  const [canMove, setCanMove] = useState(false);
  const issue = meetingIssue(schedule, range);

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={t('meetings.sheetTitle')}
      actions={
        <>
          <Button
            fullWidth
            disabled={issue !== undefined}
            onClick={() => onAdd({ start: range.start as HHmm, end: range.end as HHmm, canMove })}
          >
            {t('meetings.add')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('meetings.cancel')}
          </Button>
        </>
      }
    >
      <div className={styles.sheetBody}>
        <RangeFields label={t('meetings.sheetTitle')} range={range} onChange={setRange} />
        <Checkbox
          checked={canMove}
          onChange={setCanMove}
          label={
            <span className={styles.optionTexts}>
              {t('meetings.canMove')}
              <span className={styles.hint}>{t('meetings.canMoveHint')}</span>
            </span>
          }
        />
        {issue && <InlineMessage tone="danger">{t(`meetings.${issue}`)}</InlineMessage>}
      </div>
    </BottomSheet>
  );
}

/** The next half hour that fits in the workday. */
function defaultRange(schedule: DaySchedule, now: Instant): TimeRange {
  const workStart = toMinutes(schedule.workStart);
  const workEnd = toMinutes(schedule.workEnd);
  const nextHalfHour = Math.ceil(minutesOfDay(now) / 30) * 30;
  const latest = Math.max(workStart, workEnd - DEFAULT_LENGTH_MIN);
  const start = Math.min(Math.max(nextHalfHour, workStart), latest);
  return {
    start: fromMinutes(start),
    end: fromMinutes(Math.min(start + DEFAULT_LENGTH_MIN, workEnd)),
  };
}

function meetingIssue(schedule: DaySchedule, range: TimeRange) {
  if (!isValidHHmm(range.start) || !isValidHHmm(range.end)) return 'endBeforeStart' as const;
  const start = toMinutes(range.start);
  const end = toMinutes(range.end);
  if (end <= start) return 'endBeforeStart' as const;
  if (start >= toMinutes(schedule.workEnd) || end <= toMinutes(schedule.workStart)) {
    return 'outside' as const;
  }
  return undefined;
}
