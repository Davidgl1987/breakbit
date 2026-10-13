import { useState, type ReactNode } from 'react';
import type { UserSettings } from '@/domain/types';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { DiscomfortFields } from './DiscomfortFields';
import { EquipmentFields } from './EquipmentFields';
import { IntensityFields } from './IntensityFields';
import { WorkdaysField } from './WorkdaysField';
import styles from './profile.module.css';

export type RoutineSection = 'schedule' | 'discomfort' | 'equipment' | 'intensity';

/** Edits a local copy. Closing discards it; the caller decides where to save its patch. */
export function ProfileEditSheet({
  section,
  value,
  onSave,
  onClose,
  note,
}: {
  section: RoutineSection;
  value: UserSettings;
  onSave: (patch: Partial<UserSettings>) => void;
  onClose: () => void;
  note?: ReactNode;
}) {
  const { t } = useT();
  const [draft, setDraft] = useState(value);
  const update = (patch: Partial<UserSettings>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const issues = section === 'schedule' ? scheduleIssueMessages(draft.schedule) : [];
  if (section === 'schedule' && !draft.workDays.length) issues.push('schedule.issues.noWorkdays');
  const save = () => {
    if (issues.length) return;
    onSave(
      section === 'schedule'
        ? { schedule: draft.schedule, workDays: draft.workDays }
        : section === 'discomfort'
          ? { discomfort: draft.discomfort }
          : section === 'equipment'
            ? { equipment: draft.equipment }
            : { intensity: draft.intensity },
    );
  };
  return (
    <BottomSheet
      open
      scrollBody
      onClose={onClose}
      title={t(`settings.sections.${section}.title`)}
      actions={
        <div className={styles.sheetActions}>
          <Button variant="secondary" fullWidth onClick={onClose}>
            {t('settings.cancel')}
          </Button>
          <Button fullWidth disabled={issues.length > 0} onClick={save}>
            {t('settings.save')}
          </Button>
        </div>
      }
    >
      <div className={styles.editor}>
        <p className={styles.muted}>{t(`settings.sections.${section}.subtitle`)}</p>
        {section === 'schedule' && (
          <>
            <WorkdaysField value={draft.workDays} onChange={(workDays) => update({ workDays })} />
            <ScheduleFields
              grouped
              schedule={draft.schedule}
              onChange={(schedule) => update({ schedule })}
            />
            {issues.length > 0 ? (
              <InlineMessage tone="danger">
                <ul>
                  {issues.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </InlineMessage>
            ) : (
              note
            )}
          </>
        )}
        {section === 'discomfort' && (
          <DiscomfortFields
            value={draft.discomfort}
            onChange={(discomfort) => update({ discomfort })}
          />
        )}
        {section === 'equipment' && (
          <EquipmentFields
            value={draft.equipment}
            onChange={(equipment) => update({ equipment })}
          />
        )}
        {section === 'intensity' && (
          <IntensityFields settings={draft} onChange={(intensity) => update({ intensity })} />
        )}
      </div>
    </BottomSheet>
  );
}
