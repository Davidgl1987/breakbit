import { useEffect, useState } from 'react';
import type { NotificationPrefs } from '@/domain/types';
import { useT } from '@/i18n/useT';
import {
  notificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from '@/services/notifications/permission';
import { playPauseSound } from '@/services/notifications/sound';
import { useAppStore } from '@/state/store';
import { showToast } from '@/state/toasts';
import { AppIcon } from '@/ui/components/AppIcon/AppIcon';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './SettingsScreen.module.css';

const ALERTS: {
  key: 'dayStart' | 'microbreaks' | 'dayEnd';
  label: 'dayStart' | 'pauses' | 'dayEnd';
  icon: IconName;
}[] = [
  { key: 'dayStart', label: 'dayStart', icon: 'sunrise' },
  { key: 'microbreaks', label: 'pauses', icon: 'stretch' },
  { key: 'dayEnd', label: 'dayEnd', icon: 'sunset' },
];

/**
 * Which reminders to get, and whether pauses sound. They need the browser's permission:
 * until then it says how to turn them on (asking only when the user taps), and the in-app
 * banner covers the rest.
 */
export function NotificationsCard() {
  const { t } = useT();
  const prefs = useAppStore((state) => state.settings.notifications);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [permission, setPermission] = useState<NotificationPermissionState>(notificationPermission);
  const [panel, setPanel] = useState<'permission' | 'help' | null>(null);
  const [requesting, setRequesting] = useState(false);
  // Re-read it when coming back (e.g. after allowing it in the browser); never asks.
  useEffect(() => {
    const refresh = () => setPermission(notificationPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const set = (patch: Partial<NotificationPrefs>) =>
    updateSettings({ notifications: { ...prefs, ...patch } });

  const enable = async () => {
    setRequesting(true);
    const answer = permission === 'granted' ? 'granted' : await requestNotificationPermission();
    setPermission(answer);
    setRequesting(false);
    setPanel(null);
    if (answer === 'granted') {
      set({ enabled: true });
      showToast(t('special.alerts.enabled'), 'success');
    }
  };
  const on = permission === 'granted' && prefs.enabled;

  return (
    <section className={styles.notifications}>
      <h2 className={styles.cardTitle}>{t('settings.notifications')}</h2>
      {on ? (
        <div className={styles.toggles}>
          {ALERTS.map((alert) => (
            <Toggle
              key={alert.key}
              labelPosition="start"
              checked={prefs[alert.key]}
              onChange={(checked) => set({ [alert.key]: checked })}
              label={
                <span className={styles.toggleLabel}>
                  <PixelIcon name={alert.icon} size={24} />
                  {t(`settings.alerts.${alert.label}`)}
                </span>
              }
            />
          ))}
        </div>
      ) : permission === 'denied' ? (
        <div className={styles.specialBody}>
          <p>{t('special.alerts.blocked')}</p>
          <p className={styles.muted}>{t('special.alerts.blockedBody')}</p>
          <button className={styles.textLink} onClick={() => setPanel('help')}>
            {t('special.alerts.help')}
            <LineIcon name="chevron-right" size={18} />
          </button>
          <p className={styles.muted}>{t('special.alerts.fallback')}</p>
        </div>
      ) : permission === 'unsupported' ? (
        <p className={styles.muted}>{t('settings.alerts.unsupported')}</p>
      ) : (
        <>
          <p className={styles.muted}>{t('special.alerts.off')}</p>
          <Button
            variant="secondary"
            onClick={() => (permission === 'granted' ? void enable() : setPanel('permission'))}
          >
            {t('settings.alerts.enable')}
          </Button>
          <p className={styles.muted}>{t('special.alerts.fallback')}</p>
        </>
      )}
      {/* The app plays it itself, so it sounds even without the browser's permission. It
          comes with the pause reminders: without them there is nothing to sound. */}
      {prefs.enabled && (
        <>
          <Toggle
            labelPosition="start"
            checked={prefs.sound}
            disabled={!prefs.microbreaks}
            onChange={(sound) => set({ sound })}
            label={
              <span className={styles.toggleLabel}>
                <PixelIcon name="speaker" size={24} />
                {t('settings.alerts.sound')}
              </span>
            }
          />
          <button className={styles.textLink} onClick={playPauseSound}>
            {t('settings.alerts.testSound')}
          </button>
        </>
      )}
      <BottomSheet
        open={panel === 'permission'}
        onClose={() => {
          if (!requesting) setPanel(null);
        }}
        scrollBody
        titleVariant="pixel"
        title={t('special.alerts.title')}
        actions={
          <>
            <Button fullWidth disabled={requesting} onClick={() => void enable()}>
              {t('special.alerts.permit')}
            </Button>
            <button
              className={styles.textLink}
              disabled={requesting}
              onClick={() => setPanel(null)}
            >
              {t('special.alerts.later')}
            </button>
          </>
        }
      >
        <div className={styles.specialBody}>
          <div className={styles.notificationPreview}>
            <AppIcon size={38} />
            <div>
              <strong>Breakbit</strong>
              <p className={styles.muted}>{t('special.alerts.preview')}</p>
            </div>
          </div>
          <p>{t('special.alerts.body')}</p>
          <p className={styles.muted}>{t('special.alerts.hint')}</p>
        </div>
      </BottomSheet>
      <BottomSheet
        open={panel === 'help'}
        onClose={() => setPanel(null)}
        titleVariant="pixel"
        scrollBody
        title={t('special.alerts.helpTitle')}
        actions={
          <Button fullWidth onClick={() => setPanel(null)}>
            {t('special.understood')}
          </Button>
        }
      >
        <div className={styles.specialBody}>
          <ol className={styles.helpSteps}>
            <li>{t('special.alerts.open')}</li>
            <li>{t('special.alerts.allow')}</li>
            <li>{t('special.alerts.return')}</li>
          </ol>
          <p className={styles.muted}>{t('special.alerts.unavailable')}</p>
        </div>
      </BottomSheet>
    </section>
  );
}
