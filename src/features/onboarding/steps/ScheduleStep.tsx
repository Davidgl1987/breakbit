import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { HHmm, TimeBlock, Weekday } from '@/domain/types';
import { weekdayName, type MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { MultiChipGroup } from '@/ui/components/ChipGroup/MultiChipGroup';
import { TimeField } from '@/ui/components/TimeField/TimeField';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useOnboardingDraft } from '../draftContext';
import styles from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { scheduleIssueMessages } from '../scheduleIssues';
import { onboardingPath } from '../steps';
import { blockFromRange, rangeFromBlock, type TimeRange } from '../timeRange';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];
const DEFAULT_BREAK: TimeBlock = { start: '11:00', durationMin: 15 };
const DEFAULT_LUNCH: TimeBlock = { start: '14:00', durationMin: 60 };

/** Step 2: the usual workday — a template the user adjusts each day, not a fixed calendar. */
export function ScheduleStep() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();
  const { schedule } = draft;
  const breakBlock = schedule.breaks[0];
  // Remember switched-off blocks so switching back on restores what the user had.
  const lastBreak = useRef(breakBlock ?? DEFAULT_BREAK);
  const lastLunch = useRef(schedule.lunch ?? DEFAULT_LUNCH);

  const setSchedule = (patch: Partial<typeof schedule>) =>
    update((current) => ({ ...current, schedule: { ...current.schedule, ...patch } }));
  const setBreak = (block: TimeBlock) => {
    lastBreak.current = block;
    setSchedule({ breaks: [block] });
  };
  const setLunch = (block: TimeBlock) => {
    lastLunch.current = block;
    setSchedule({ lunch: block });
  };

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

      <Card className={styles.section}>
        <h3 className={styles.heading}>
          <PixelIcon name="clock" size={24} />
          {t('onboarding.schedule.hours')}
        </h3>
        <RangeFields
          label={t('onboarding.schedule.hours')}
          range={{ start: schedule.workStart, end: schedule.workEnd }}
          onChange={(range) =>
            setSchedule({ workStart: range.start as HHmm, workEnd: range.end as HHmm })
          }
        />
      </Card>

      <Card className={styles.section}>
        <Toggle
          labelPosition="start"
          label={<Heading icon="mug" text={t('onboarding.schedule.break')} />}
          checked={breakBlock !== undefined}
          onChange={(on) => setSchedule({ breaks: on ? [lastBreak.current] : [] })}
        />
        {breakBlock && (
          <BlockFields
            label={t('onboarding.schedule.break')}
            block={breakBlock}
            onChange={setBreak}
          />
        )}
      </Card>

      <Card className={styles.section}>
        <Toggle
          labelPosition="start"
          label={<Heading icon="food" text={t('onboarding.schedule.lunch')} />}
          checked={schedule.lunch !== undefined}
          onChange={(on) => setSchedule({ lunch: on ? lastLunch.current : undefined })}
        />
        {schedule.lunch && (
          <>
            <BlockFields
              label={t('onboarding.schedule.lunch')}
              block={schedule.lunch}
              onChange={setLunch}
            />
            <p className={styles.muted}>{t('onboarding.schedule.lunchNote')}</p>
          </>
        )}
      </Card>

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

function Heading({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className={styles.heading}>
      <PixelIcon name={icon} size={24} />
      {text}
    </span>
  );
}

/** Start / End, grouped under the block's name for screen readers. */
function RangeFields({
  label,
  range,
  onChange,
}: {
  label: string;
  range: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const { t } = useT();
  return (
    <div role="group" aria-label={label} className={styles.grid2}>
      <TimeField
        label={t('schedule.start')}
        value={range.start}
        onChange={(start) => onChange({ ...range, start })}
      />
      <TimeField
        label={t('schedule.end')}
        value={range.end}
        onChange={(end) => onChange({ ...range, end })}
      />
    </div>
  );
}

/**
 * Break and lunch are stored as start + duration but edited as start–end. The two
 * times live here while editing, so clearing one field never wipes the other.
 */
function BlockFields({
  label,
  block,
  onChange,
}: {
  label: string;
  block: TimeBlock;
  onChange: (block: TimeBlock) => void;
}) {
  const [range, setRange] = useState(() => rangeFromBlock(block));
  return (
    <RangeFields
      label={label}
      range={range}
      onChange={(next) => {
        setRange(next);
        onChange(blockFromRange(next));
      }}
    />
  );
}
