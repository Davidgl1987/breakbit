import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/app/routes';
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
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { LineIcon } from '@/ui/icons/LineIcon';
import { AboutSection } from './AboutSection';
import styles from './SettingsScreen.module.css';
import { useSaveSettings } from './useSaveSettings';

const SECTIONS = ['schedule', 'discomfort', 'equipment', 'intensity', 'about'] as const;
export type SettingsSection = (typeof SECTIONS)[number];

function isSection(value: string): value is SettingsSection {
  return (SECTIONS as readonly string[]).includes(value);
}

/**
 * /settings/:section — edits one part of the profile with the same forms as the
 * onboarding. Nothing changes until "Guardar".
 */
export function SettingsSectionScreen() {
  const { section = '' } = useParams();
  if (!isSection(section)) return <Navigate to={ROUTES.settings} replace />;
  return section === 'about' ? <AboutSection /> : <EditSection key={section} section={section} />;
}

function EditSection({ section }: { section: Exclude<SettingsSection, 'about'> }) {
  const { t } = useT();
  const navigate = useNavigate();
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
    const replanned = save(patch, { replanToday: section !== 'schedule' });
    navigate(ROUTES.settings);
    showToast(
      replanned
        ? t('settings.replanned')
        : section === 'schedule' && dayStarted
          ? t('settings.savedNextDay')
          : t('settings.saved'),
      'success',
    );
  };

  return (
    <>
      <IconButton label={t('settings.back')} to={ROUTES.settings}>
        <LineIcon name="back" size={22} />
      </IconButton>
      <ScreenHeader
        title={t(`settings.sections.${section}.title`)}
        subtitle={t(`settings.sections.${section}.subtitle`)}
      />

      {section === 'schedule' && (
        <>
          <WorkdaysField value={draft.workDays} onChange={(workDays) => update({ workDays })} />
          <ScheduleFields schedule={draft.schedule} onChange={(schedule) => update({ schedule })} />
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
        <EquipmentFields value={draft.equipment} onChange={(equipment) => update({ equipment })} />
      )}
      {section === 'intensity' && (
        <IntensityFields settings={draft} onChange={(intensity) => update({ intensity })} />
      )}

      <div className={styles.actions}>
        <Button size="lg" fullWidth disabled={issues.length > 0} onClick={onSave}>
          {t('settings.save')}
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.settings)}>
          {t('settings.cancel')}
        </Button>
      </div>
    </>
  );
}
