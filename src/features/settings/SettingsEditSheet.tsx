import { useState } from 'react';
import type { UserSettings } from '@/domain/types';
import { DiscomfortFields } from '@/features/profile/DiscomfortFields';
import { EquipmentFields } from '@/features/profile/EquipmentFields';
import { IntensityFields } from '@/features/profile/IntensityFields';
import { WorkdaysField } from '@/features/profile/WorkdaysField';
import { ScheduleFields } from '@/features/schedule/ScheduleFields';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { toDateKey } from '@/domain/time';
import type { MessageKey } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import styles from './SettingsScreen.module.css';
import { useSaveSettings } from './useSaveSettings';

export type RoutineSection = 'schedule' | 'discomfort' | 'equipment' | 'intensity';

export function SettingsEditSheet({
  section,
  onClose,
}: {
  section: RoutineSection;
  onClose: () => void;
}) {
  const { t } = useT();
  const saved = useAppStore((state) => state.settings);
  // A day already started keeps the hours it was started with.
  const dayStarted = useAppStore(
    (state) => state.days[toDateKey(clock.now())]?.status === 'active',
  );
  const save = useSaveSettings();
  const [draft, setDraft] = useState<UserSettings>(saved);
  const update = (patch: Partial<UserSettings>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const issues: MessageKey[] = section === 'schedule' ? scheduleIssueMessages(draft.schedule) : [];
  if (section === 'schedule' && draft.workDays.length === 0) {
    issues.push('schedule.issues.noWorkdays');
  }

  const onSave = () => {
    const patch: Partial<UserSettings> =
      section === 'schedule'
        ? { schedule: draft.schedule, workDays: draft.workDays }
        : section === 'discomfort'
          ? { discomfort: draft.discomfort }
          : section === 'equipment'
            ? { equipment: draft.equipment }
            : { intensity: draft.intensity };
    runScreenTransition(() => {
      const replanned = save(patch, { replanToday: section !== 'schedule' });
      onClose();
      showToast(
        replanned
          ? t('settings.replanned')
          : section === 'schedule' && dayStarted
            ? t('settings.savedNextDay')
            : t('settings.saved'),
        'success',
      );
    });
  };

  return (
    <BottomSheet open onClose={onClose} title={t(`settings.sections.${section}.title`)}>
      <p className={styles.muted}>{t(`settings.sections.${section}.subtitle`)}</p>
      <div className={styles.editor}>
        {section === 'schedule' && (
          <>
            <WorkdaysField value={draft.workDays} onChange={(workDays) => update({ workDays })} />
            <ScheduleFields
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
              <p className={styles.muted}>
                {dayStarted
                  ? t('settings.sections.schedule.note')
                  : t('settings.sections.schedule.noteNotStarted')}
              </p>
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

        <div className={styles.actions}>
          <Button size="lg" fullWidth disabled={issues.length > 0} onClick={onSave}>
            {t('settings.save')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('settings.cancel')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
