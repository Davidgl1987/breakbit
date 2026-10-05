import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  EquipmentSummary,
  PaceSummary,
  PrioritiesSummary,
  WorkdaySummary,
} from '@/features/profile/ProfileSummary';
import { scheduleIssueMessages } from '@/features/schedule/scheduleIssues';
import { useT } from '@/i18n/useT';
import {
  notificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from '@/services/notifications/permission';
import { requestPersistentStorage } from '@/services/storagePersistence';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { runScreenTransition } from '@/ui/motion/viewTransition';
import { useOnboardingDraft } from '../draftContext';
import { clearOnboardingDraft } from '../draftStorage';
import common from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { onboardingPath } from '../steps';
import styles from './SummaryStep.module.css';

/** Step 6: the whole setup at a glance, reminders on request, and start. */
export function SummaryStep() {
  const { t } = useT();
  const navigate = useNavigate();
  const [draft] = useOnboardingDraft();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const valid = scheduleIssueMessages(draft.schedule).length === 0 && draft.workDays.length > 0;

  const [permission, setPermission] = useState<NotificationPermissionState>(notificationPermission);
  // Only reads the state (e.g. after allowing it in the browser settings); never asks.
  useEffect(() => {
    const refresh = () => setPermission(notificationPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const enableNotifications = async () => setPermission(await requestNotificationPermission());

  const start = () => {
    runScreenTransition(() => {
      completeOnboarding({
        ...draft,
        notifications: { ...draft.notifications, enabled: permission === 'granted' },
      });
      navigate('/', { replace: true });
    });
    clearOnboardingDraft();
    void requestPersistentStorage();
  };

  return (
    <OnboardingStep
      step="summary"
      title={t('onboarding.summary.title')}
      subtitle={t('onboarding.summary.subtitle')}
      action={{ label: t('onboarding.summary.start'), onClick: start, disabled: !valid }}
    >
      <WorkdaySummary
        title={t('onboarding.summary.workday')}
        editTo={onboardingPath('schedule')}
        workDays={draft.workDays}
        schedule={draft.schedule}
      />
      <PrioritiesSummary
        title={t('onboarding.summary.priorities')}
        editTo={onboardingPath('discomfort')}
        discomfort={draft.discomfort}
      />
      <EquipmentSummary
        title={t('onboarding.summary.equipment')}
        editTo={onboardingPath('equipment')}
        equipment={draft.equipment}
      />
      <PaceSummary
        title={t('onboarding.summary.pace')}
        editTo={onboardingPath('intensity')}
        settings={draft}
      />

      <Card as="section" variant="muted" className={common.section}>
        <h2 className={common.heading}>
          <PixelIcon name="bell" size={24} />
          {t('onboarding.summary.notifications.title')}
        </h2>
        <p className={common.muted}>{t('onboarding.summary.notifications.body')}</p>
        {permission === 'default' && (
          <Button variant="secondary" onClick={() => void enableNotifications()}>
            {t('onboarding.summary.notifications.enable')}
          </Button>
        )}
        {permission === 'granted' && (
          <p className={`${styles.status} ${styles.granted}`}>
            <LineIcon name="check" size={20} />
            {t('onboarding.summary.notifications.granted')}
          </p>
        )}
        {permission === 'denied' && (
          <div className={styles.workday}>
            <p className={styles.status}>
              <PixelIcon name="warning" size={24} />
              {t('onboarding.summary.notifications.denied')}
            </p>
            <p className={common.muted}>{t('onboarding.summary.notifications.deniedHelp')}</p>
          </div>
        )}
        {permission === 'unsupported' && (
          <p className={styles.status}>
            <PixelIcon name="info" size={24} />
            {t('onboarding.summary.notifications.unsupported')}
          </p>
        )}
      </Card>

      {!valid && (
        <InlineMessage tone="danger">
          <Link to={onboardingPath('schedule')}>{t('schedule.issues.invalid')}</Link>
        </InlineMessage>
      )}
    </OnboardingStep>
  );
}
