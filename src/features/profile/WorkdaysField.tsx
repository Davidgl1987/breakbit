import type { Weekday } from '@/domain/types';
import { weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { MultiChipGroup } from '@/ui/components/ChipGroup/MultiChipGroup';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './profile.module.css';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** The days the user usually works. */
export function WorkdaysField({
  value,
  onChange,
}: {
  value: readonly Weekday[];
  onChange: (days: Weekday[]) => void;
}) {
  const { t, locale } = useT();
  return (
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
        values={value.map((day) => `${day}` as const)}
        onChange={(values) => onChange(values.map((item) => Number(item) as Weekday))}
      />
    </Card>
  );
}
