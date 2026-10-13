import { toDateKey } from '@/domain/time';
import type { UserSettings } from '@/domain/types';
import { ProfileEditSheet, type RoutineSection } from '@/features/profile/ProfileEditSheet';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import styles from './SettingsScreen.module.css';
import { useSaveSettings } from './useSaveSettings';

export type { RoutineSection } from '@/features/profile/ProfileEditSheet';

export function SettingsEditSheet({
  section,
  onClose,
}: {
  section: RoutineSection;
  onClose: () => void;
}) {
  const { t } = useT();
  const saved = useAppStore((state) => state.settings);
  const dayStarted = useAppStore(
    (state) => state.days[toDateKey(clock.now())]?.status === 'active',
  );
  const save = useSaveSettings();
  const onSave = (patch: Partial<UserSettings>) => {
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
    <ProfileEditSheet
      section={section}
      value={saved}
      onSave={onSave}
      onClose={onClose}
      note={
        <p className={styles.muted}>
          {dayStarted
            ? t('settings.sections.schedule.note')
            : t('settings.sections.schedule.noteNotStarted')}
        </p>
      }
    />
  );
}
