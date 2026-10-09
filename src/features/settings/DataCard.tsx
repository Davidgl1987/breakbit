import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LineIcon } from '@/ui/icons/LineIcon';
import { settingsPath } from '@/app/routes';
import { toDateKey } from '@/domain/time';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { downloadJson } from '@/services/download';
import { isStoragePersisted, requestPersistentStorage } from '@/services/storagePersistence';
import { BackupError, exportBackup, importBackup, parseBackup, resetAllData } from '@/state/backup';
import { showToast } from '@/state/toasts';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './SettingsScreen.module.css';

/**
 * "Tus datos": everything lives on this device, so the user can save it to a file, bring
 * a copy back (after checking it), or start from scratch. Both last ones ask first.
 */
export function DataCard() {
  const { t, locale } = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ raw: unknown; date: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  // Whether the browser keeps the data under storage pressure; unknown until read.
  const [persisted, setPersisted] = useState<boolean>();
  useEffect(() => {
    let active = true;
    void isStoragePersisted().then((value) => active && setPersisted(value));
    return () => {
      active = false;
    };
  }, []);
  const protect = async () => {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
    showToast(
      granted ? t('settings.data.protectedNow') : t('settings.data.notProtected'),
      granted ? 'success' : 'info',
    );
  };

  const exportCopy = async () => {
    downloadJson(`breakbit-${toDateKey(clock.now())}.json`, await exportBackup());
    showToast(t('settings.data.exported'), 'success');
  };

  const readFile = async (file: File) => {
    try {
      const raw: unknown = JSON.parse(await file.text());
      // Checked in full before asking; nothing changes yet.
      parseBackup(raw);
      const exportedAt = (raw as { exportedAt?: unknown }).exportedAt;
      const date =
        typeof exportedAt === 'number' ? formatLongDate(locale, toDateKey(exportedAt)) : '—';
      setPending({ raw, date });
    } catch (error) {
      showToast(
        error instanceof BackupError && error.code === 'unsupported_version'
          ? t('settings.data.newer')
          : t('settings.data.invalid'),
        'warning',
      );
    }
  };

  return (
    <Card as="section" className={styles.dataCard}>
      <div className={styles.headTexts}>
        <h2 className={styles.cardTitle}>
          <PixelIcon name="home_place" size={24} />
          {t('settings.data.title')}
        </h2>
        <p className={styles.muted}>{t('settings.data.hint')}</p>
        {persisted && <p className={styles.muted}>{t('settings.data.protected')}</p>}
      </div>
      {persisted === false && (
        <button
          className={styles.dataLink}
          onClick={() => void protect()}
          title={t('settings.data.protectHint')}
        >
          <PixelIcon name="shield" size={24} />
          {t('settings.data.protect')}
        </button>
      )}
      <div className={styles.dataActions}>
        <Button
          variant="secondary"
          aria-label={t('settings.data.export')}
          onClick={() => void exportCopy()}
        >
          <PixelIcon name="export" size={24} />
          {t('settings.data.exportAction')}
        </Button>
        <Button
          variant="secondary"
          aria-label={t('settings.data.import')}
          onClick={() => fileInput.current?.click()}
        >
          <PixelIcon name="import" size={24} />
          {t('settings.data.importAction')}
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        aria-label={t('settings.data.import')}
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void readFile(file);
        }}
      />
      <button
        className={`${styles.dataLink} ${styles.dangerLink}`}
        onClick={() => setConfirmReset(true)}
      >
        {t('settings.data.reset')}
        <LineIcon name="chevron-right" size={18} />
      </button>
      <Link className={styles.dataLink} to={settingsPath('about')}>
        {t('settings.about.title')}
      </Link>

      {pending && (
        <BottomSheet
          open
          onClose={() => setPending(null)}
          title={t('settings.data.importSheet.title')}
          actions={
            <>
              <Button
                fullWidth
                onClick={() => {
                  void importBackup(pending.raw).then(() => {
                    setPending(null);
                    showToast(t('settings.data.imported'), 'success');
                  });
                }}
              >
                {t('settings.data.importSheet.confirm')}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setPending(null)}>
                {t('settings.data.importSheet.cancel')}
              </Button>
            </>
          }
        >
          <p>{t('settings.data.importSheet.body', { date: pending.date })}</p>
        </BottomSheet>
      )}
      {confirmReset && (
        <BottomSheet
          open
          onClose={() => setConfirmReset(false)}
          title={t('settings.data.resetSheet.title')}
          actions={
            <>
              <Button variant="destructive" fullWidth onClick={() => void resetAllData()}>
                {t('settings.data.resetSheet.confirm')}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setConfirmReset(false)}>
                {t('settings.data.resetSheet.cancel')}
              </Button>
            </>
          }
        >
          <p>{t('settings.data.resetSheet.body')}</p>
        </BottomSheet>
      )}
    </Card>
  );
}
