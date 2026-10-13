import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  EquipmentSummary,
  PaceSummary,
  PrioritiesSummary,
  WorkdaySummary,
} from '@/features/profile/ProfileSummary';
import { ProfileEditSheet, type RoutineSection } from '@/features/profile/ProfileEditSheet';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useT } from '@/i18n/useT';
import {
  notificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from '@/services/notifications/permission';
import { requestPersistentStorage } from '@/services/storagePersistence';
import { useAppStore } from '@/state/store';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { useOnboardingDraft } from '../draftContext';
import { clearOnboardingDraft } from '../draftStorage';
import { OnboardingStep } from '../OnboardingStep';
import styles from './SummaryStep.module.css';

/** Finish setup only. Starting the workday is a separate action on Today. */
export function SummaryStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft, update] = useOnboardingDraft();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const valid = scheduleIssueMessages(draft.schedule).length === 0 && draft.workDays.length > 0;
  const [section, setSection] = useState<RoutineSection>();
  const [permission, setPermission] = useState<NotificationPermissionState>(notificationPermission);
  const [requesting, setRequesting] = useState(false);
  useEffect(() => {
    const refresh = () => setPermission(notificationPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const on = permission === 'granted' && draft.notifications.enabled;
  const setNotifications = async (enabled: boolean) => {
    if (requesting) return;
    if (!enabled) {
      update((current) => ({
        ...current,
        notifications: { ...current.notifications, enabled: false },
      }));
      return;
    }
    setRequesting(true);
    try {
      const answer = permission === 'granted' ? 'granted' : await requestNotificationPermission();
      setPermission(answer);
      update((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          enabled: answer === 'granted',
        },
      }));
    } finally {
      setRequesting(false);
    }
  };
  const start = () => {
    runScreenTransition(() => {
      completeOnboarding({
        ...draft,
        notifications: { ...draft.notifications, enabled: on },
      });
      navigate('/', { replace: true });
    });
    clearOnboardingDraft();
    void requestPersistentStorage();
  };
  return (
    <>
      <OnboardingStep
        step="summary"
        title={t('onboarding.summary.title')}
        eyebrow={t('onboarding.design.planReady')}
        trailing={<Avatar phase={1} pose="thumbs_up" size="md" framed={false} />}
        footerNote={t('onboarding.design.startLater')}
        action={{
          label: t('onboarding.summary.start'),
          onClick: start,
          disabled: !valid || requesting,
        }}
      >
        <div className={styles.summary}>
          <WorkdaySummary
            title={t('onboarding.summary.workday')}
            onEdit={() => setSection('schedule')}
            workDays={draft.workDays}
            schedule={draft.schedule}
          />
          <PrioritiesSummary
            title={t('onboarding.summary.priorities')}
            onEdit={() => setSection('discomfort')}
            discomfort={draft.discomfort}
          />
          <EquipmentSummary
            title={t('onboarding.summary.equipment')}
            onEdit={() => setSection('equipment')}
            equipment={draft.equipment}
          />
          <PaceSummary
            title={t('onboarding.summary.pace')}
            onEdit={() => setSection('intensity')}
            settings={draft}
          />
        </div>
        <section className={styles.notifications}>
          <Toggle
            labelPosition="start"
            label={t('onboarding.design.reminders')}
            checked={on}
            disabled={requesting || permission === 'denied' || permission === 'unsupported'}
            onChange={(enabled) => void setNotifications(enabled)}
          />
          {permission === 'default' && (
            <p className={styles.muted}>{t('onboarding.design.permissionHint')}</p>
          )}
          {permission === 'granted' && (
            <p className={styles.muted}>
              {on
                ? t('onboarding.summary.notifications.granted')
                : t('onboarding.design.remindersOff')}
            </p>
          )}
          {permission === 'denied' && (
            <>
              <p className={styles.muted}>{t('onboarding.summary.notifications.denied')}</p>
              <p className={styles.muted}>{t('onboarding.summary.notifications.deniedHelp')}</p>
            </>
          )}
          {permission === 'unsupported' && (
            <p className={styles.muted}>{t('onboarding.summary.notifications.unsupported')}</p>
          )}
        </section>
        {!valid && (
          <InlineMessage tone="danger">
            <button className={styles.fixSchedule} onClick={() => setSection('schedule')}>
              {t('schedule.issues.invalid')}
            </button>
          </InlineMessage>
        )}
      </OnboardingStep>
      {section && (
        <ProfileEditSheet
          key={section}
          section={section}
          value={draft}
          onSave={(patch) => {
            update((current) => ({ ...current, ...patch }));
            setSection(undefined);
          }}
          onClose={() => setSection(undefined)}
        />
      )}
    </>
  );
}
