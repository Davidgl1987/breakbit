import { useNavigate } from 'react-router';
import type { DaySchedule, Weekday } from '@/domain/types';
import { weekdayName, type MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { MultiChipGroup } from '@/ui/components/ChipGroup/MultiChipGroup';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useOnboardingDraft } from '../draftContext';
import styles from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** Step 2: the usual workday — a template the user adjusts each day, not a fixed calendar. */
export function ScheduleStep() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();
  const { schedule } = draft;
  const setSchedule = (next: DaySchedule) => update((current) => ({ ...current, schedule: next }));

  const messages: MessageKey[] = scheduleIssueMessages(schedule);
  if (draft.workDays.length === 0) messages.push('schedule.issues.noWorkdays');

  return (
    <OnboardingStep
      step="schedule"
      title={t('onboarding.schedule.title')}
      subtitle={t('onboarding.schedule.subtitle')}
      action={{
        label: t('onboarding.next'),
        disabled: messages.length > 0,
        onClick: () => navigate(onboardingPath('discomfort')),
      }}
    >
      <Card className={styles.section}>
        <h3 className={styles.heading}>
          <PixelIcon name="calendar" size={24} />
          {t('onboarding.schedule.workDays')}
        </h3>
        <MultiChipGroup<`${Weekday}`>
          label={t('onboarding.schedule.workDays')}
          fill
          options={WEEKDAYS.map((day) => ({
            value: `${day}`,
            label: weekdayName(locale, day, 'narrow'),
            ariaLabel: weekdayName(locale, day, 'long'),
          }))}
          values={draft.workDays.map((day) => `${day}` as const)}
          onChange={(values) =>
            update((current) => ({
              ...current,
              workDays: values.map((value) => Number(value) as Weekday),
            }))
          }
        />
      </Card>

      <ScheduleFields schedule={schedule} onChange={(next) => setSchedule(next)} />

      {messages.length > 0 && (
        <InlineMessage tone="danger">
          <ul>
            {messages.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </InlineMessage>
      )}
    </OnboardingStep>
  );
}
