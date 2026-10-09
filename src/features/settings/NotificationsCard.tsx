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
import { Button } from '@/ui/components/Button/Button';
import { Toggle } from '@/ui/components/Toggle/Toggle';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
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
  // Re-read it when coming back (e.g. after allowing it in the browser); never asks.
  useEffect(() => {
    const refresh = () => setPermission(notificationPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const set = (patch: Partial<NotificationPrefs>) =>
    updateSettings({ notifications: { ...prefs, ...patch } });

  const enable = async () => {
    const answer = permission === 'granted' ? 'granted' : await requestNotificationPermission();
    setPermission(answer);
    if (answer === 'granted') set({ enabled: true });
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
        <p className={styles.muted}>{t('settings.alerts.denied')}</p>
      ) : permission === 'unsupported' ? (
        <p className={styles.muted}>{t('settings.alerts.unsupported')}</p>
      ) : (
        <>
          <p className={styles.muted}>{t('settings.alerts.off')}</p>
          <Button variant="secondary" onClick={() => void enable()}>
            {t('settings.alerts.enable')}
          </Button>
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
    </section>
  );
}
