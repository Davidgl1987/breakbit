import { Fragment, useRef, useState, type ReactNode } from 'react';
import type { DaySchedule, HHmm, TimeBlock } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { TimeField } from '@/ui/components/TimeField/TimeField';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './ScheduleFields.module.css';
import { blockFromRange, rangeFromBlock, type TimeRange } from './timeRange';

const DEFAULT_BREAK: TimeBlock = { start: '11:00', durationMin: 15 };
const DEFAULT_LUNCH: TimeBlock = { start: '14:00', durationMin: 60 };

interface ScheduleFieldsProps {
  schedule: DaySchedule;
  onChange: (schedule: DaySchedule) => void;
  /** One card for the three parts (start of the day) instead of one card each (onboarding). */
  grouped?: boolean;
}

/**
 * Hours, usual break and lunch, each edited as Start / End. Shared by the onboarding,
 * the start of the day and settings.
 */
export function ScheduleFields({ schedule, onChange, grouped = false }: ScheduleFieldsProps) {
  const { t } = useT();
  const breakBlock = schedule.breaks[0];
  // Remember switched-off blocks so switching back on restores what the user had.
  const lastBreak = useRef(breakBlock ?? DEFAULT_BREAK);
  const lastLunch = useRef(schedule.lunch ?? DEFAULT_LUNCH);

  const set = (patch: Partial<DaySchedule>) => onChange({ ...schedule, ...patch });
  const setBreak = (block: TimeBlock) => {
    lastBreak.current = block;
    set({ breaks: [block] });
  };
  const setLunch = (block: TimeBlock) => {
    lastLunch.current = block;
    set({ lunch: block });
  };

  const parts = [
    <Fragment key="hours">
      <h3 className={styles.heading}>
        <PixelIcon name="clock" size={24} />
        {t('onboarding.schedule.hours')}
      </h3>
      <RangeFields
        label={t('onboarding.schedule.hours')}
        range={{ start: schedule.workStart, end: schedule.workEnd }}
        onChange={(range) => set({ workStart: range.start as HHmm, workEnd: range.end as HHmm })}
      />
    </Fragment>,
    <Fragment key="break">
      <Toggle
        labelPosition="start"
        label={<Heading icon="mug" text={t('onboarding.schedule.break')} />}
        checked={breakBlock !== undefined}
        onChange={(on) => set({ breaks: on ? [lastBreak.current] : [] })}
      />
      {breakBlock && (
        <BlockFields
          label={t('onboarding.schedule.break')}
          block={breakBlock}
          onChange={setBreak}
        />
      )}
    </Fragment>,
    <Fragment key="lunch">
      <Toggle
        labelPosition="start"
        label={<Heading icon="food" text={t('onboarding.schedule.lunch')} />}
        checked={schedule.lunch !== undefined}
        onChange={(on) => set({ lunch: on ? lastLunch.current : undefined })}
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
    </Fragment>,
  ];

  if (grouped) {
    return (
      <Card className={styles.section}>
        {parts.map((part, index) => (
          <Fragment key={index}>
            {index > 0 && <hr className={styles.divider} />}
            {part}
          </Fragment>
        ))}
      </Card>
    );
  }
  return parts.map((part, index) => (
    <Card key={index} className={styles.section}>
      {part}
    </Card>
  ));
}

function Heading({ icon, text }: { icon: IconName; text: ReactNode }) {
  return (
    <span className={styles.heading}>
      <PixelIcon name={icon} size={24} />
      {text}
    </span>
  );
}

/** Start / End, grouped under the block's name for screen readers. */
export function RangeFields({
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
