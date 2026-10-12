import { useId, useState } from 'react';
import { isValidDateKey } from '@/domain/time';
import type { DateKey, DaySchedule } from '@/domain/types';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import styles from './ScheduleSheet.module.css';

/** Reuses the onboarding schedule fields for one workday; saving is explicit. */
export function ScheduleSheet({
  title,
  initial,
  calendar,
  onSave,
  onClose,
}: {
  title: string;
  initial: DaySchedule;
  calendar?: { initial: DateKey; min: DateKey; max: DateKey };
  onSave: (schedule: DaySchedule, date?: DateKey) => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const id = useId();
  const [draft, setDraft] = useState(initial);
  const [date, setDate] = useState<string>(calendar?.initial ?? '');
  const issues = scheduleIssueMessages(draft);
  const dateValid =
    !calendar || (isValidDateKey(date) && date >= calendar.min && date <= calendar.max);
  return (
    <BottomSheet
      open
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button
            fullWidth
            disabled={issues.length > 0 || !dateValid}
            onClick={() => onSave(draft, isValidDateKey(date) ? date : undefined)}
          >
            {t('dayEnd.next.save')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('dayEnd.next.cancel')}
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        {calendar && (
          <div className={styles.dateField}>
            <label htmlFor={id}>{t('cycle.next.date')}</label>
            <input
              id={id}
              type="date"
              value={date}
              min={calendar.min}
              max={calendar.max}
              aria-invalid={!dateValid}
              aria-describedby={!dateValid ? `${id}-error` : undefined}
              onChange={(event) => setDate(event.target.value)}
            />
            {!dateValid && (
              <p id={`${id}-error`} className={styles.error}>
                {t('cycle.next.invalidDate')}
              </p>
            )}
          </div>
        )}
        <ScheduleFields grouped schedule={draft} onChange={setDraft} />
        {issues.length > 0 && (
          <InlineMessage tone="danger">
            <ul>
              {issues.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </InlineMessage>
        )}
        {calendar && <p className={styles.note}>{t('cycle.next.note')}</p>}
      </div>
    </BottomSheet>
  );
}
