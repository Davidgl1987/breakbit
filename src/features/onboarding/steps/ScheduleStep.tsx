import { useNavigate } from 'react-router';
import type { DaySchedule } from '@/domain/types';
import { WorkdaysField } from '@/features/profile/WorkdaysField';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import type { MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { useOnboardingDraft } from '../draftContext';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';

/** Step 2: the usual workday — a template the user adjusts each day, not a fixed calendar. */
export function ScheduleStep() {
  const { t } = useT();
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
      <WorkdaysField
        value={draft.workDays}
        onChange={(workDays) => update((current) => ({ ...current, workDays }))}
      />

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
