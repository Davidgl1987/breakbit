import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { toDateKey } from '@/domain/time';
import { BODY_AREAS, type TimeBlock } from '@/domain/types';
import { weekdayName } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import {
  notificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from '@/services/notifications/permission';
import { requestPersistentStorage } from '@/services/storagePersistence';
import { useAppStore } from '@/state/store';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import { Tag } from '@/ui/components/Tag/Tag';
import { Avatar } from '@/ui/game/Avatar/Avatar';
import { AREA_ICONS, EQUIPMENT_ICONS } from '@/ui/icons/domainIcons';
import type { IconName } from '@/ui/icons/iconNames';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { useOnboardingDraft } from '../draftContext';
import { clearOnboardingDraft } from '../draftStorage';
import { estimateDay } from '../estimate';
import common from '../onboarding.module.css';
import { OnboardingStep } from '../OnboardingStep';
import { scheduleIssueMessages } from '../scheduleIssues';
import { onboardingPath, type OnboardingStepId } from '../steps';
import { rangeFromBlock } from '../timeRange';
import styles from './SummaryStep.module.css';

/** Step 6: the whole setup at a glance, reminders on request, and start. */
export function SummaryStep() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const [draft] = useOnboardingDraft();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const estimate = useMemo(() => estimateDay(draft, toDateKey(clock.now())), [draft]);
  const valid = scheduleIssueMessages(draft.schedule).length === 0 && draft.workDays.length > 0;

  const { schedule } = draft;
  const range = (
    key: 'onboarding.summary.breakRange' | 'onboarding.summary.lunchRange',
    block: TimeBlock,
  ) => t(key, { ...rangeFromBlock(block) });
  const priorities = BODY_AREAS.filter((area) => draft.discomfort[area] > 0).sort(
    (a, b) => draft.discomfort[b] - draft.discomfort[a],
  );

  const [permission, setPermission] = useState<NotificationPermissionState>(notificationPermission);
  // Only reads the state (e.g. after allowing it in the browser settings); never asks.
  useEffect(() => {
    const refresh = () => setPermission(notificationPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const enableNotifications = async () => setPermission(await requestNotificationPermission());

  const start = () => {
    completeOnboarding({
      ...draft,
      notifications: { ...draft.notifications, enabled: permission === 'granted' },
    });
    clearOnboardingDraft();
    void requestPersistentStorage();
    navigate('/', { replace: true });
  };

  return (
    <OnboardingStep
      step="summary"
      title={t('onboarding.summary.title')}
      subtitle={t('onboarding.summary.subtitle')}
      trailing={<Avatar phase={5} pose="thumbs_up" size="sm" />}
      action={{ label: t('onboarding.summary.start'), onClick: start, disabled: !valid }}
    >
      <Card as="section" className={common.section}>
        <SectionHeader title={t('onboarding.summary.workday')} edit="schedule" />
        <div className={styles.workday}>
          <p className={styles.days}>
            {draft.workDays.map((day) => weekdayName(locale, day, 'short')).join(' · ')}
          </p>
          <p className={styles.hours}>
            {schedule.workStart}–{schedule.workEnd}
          </p>
        </div>
        <ul className={styles.rows}>
          <Row icon="mug">
            {schedule.breaks[0]
              ? range('onboarding.summary.breakRange', schedule.breaks[0])
              : t('onboarding.summary.noBreak')}
          </Row>
          <Row icon="food">
            {schedule.lunch
              ? range('onboarding.summary.lunchRange', schedule.lunch)
              : t('onboarding.summary.noLunch')}
          </Row>
        </ul>
      </Card>

      <section className={styles.flat}>
        <SectionHeader title={t('onboarding.summary.priorities')} edit="discomfort" />
        {priorities.length > 0 ? (
          <ul className={styles.tags}>
            {priorities.map((area) => (
              <li key={area}>
                <Tag icon={AREA_ICONS[area]}>{t(`areas.${area}`)}</Tag>
              </li>
            ))}
          </ul>
        ) : (
          <p className={common.muted}>{t('onboarding.summary.noPriorities')}</p>
        )}
      </section>

      <section className={styles.flat}>
        <SectionHeader title={t('onboarding.summary.equipment')} edit="equipment" />
        {draft.equipment.length > 0 ? (
          <ul className={styles.tags}>
            {draft.equipment.map((item) => (
              <li key={item}>
                <Tag icon={EQUIPMENT_ICONS[item]}>{t(`equipment.${item}`)}</Tag>
              </li>
            ))}
          </ul>
        ) : (
          <p className={common.muted}>{t('onboarding.summary.noEquipment')}</p>
        )}
      </section>

      <Card as="section" variant="tinted" className={common.section}>
        <SectionHeader title={t('onboarding.summary.pace')} edit="intensity" />
        <div className={styles.workday}>
          <p className={styles.pace}>
            {t('onboarding.summary.paceValue', {
              intensity: t(`intensity.${draft.intensity}`),
              pauses: t('common.pauses', { count: estimate.pauses }),
              minutes: t('common.minutes', { count: estimate.interruptionMin }),
            })}
          </p>
          <p className={common.muted}>{t('onboarding.summary.paceHint')}</p>
        </div>
      </Card>

      <Card as="section" variant="muted" className={common.section}>
        <h3 className={common.heading}>
          <PixelIcon name="bell" size={24} />
          {t('onboarding.summary.notifications.title')}
        </h3>
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

function SectionHeader({ title, edit }: { title: string; edit: OnboardingStepId }) {
  const { t } = useT();
  return (
    <div className={styles.sectionHeader}>
      <h3 className={common.sectionTitle}>{title}</h3>
      <Link
        to={onboardingPath(edit)}
        aria-label={`${t('onboarding.summary.edit')}: ${title}`}
        className={buttonClassName({ variant: 'ghost', size: 'sm' })}
      >
        {t('onboarding.summary.edit')}
      </Link>
    </div>
  );
}

function Row({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <li className={styles.row}>
      <PixelIcon name={icon} size={24} />
      {children}
    </li>
  );
}
