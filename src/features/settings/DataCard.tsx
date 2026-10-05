import { useEffect, useRef, useState } from 'react';
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
import { ListRow } from '@/ui/components/ListRow/ListRow';
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
    <Card as="section" className={styles.card}>
      <div className={styles.headTexts}>
        <h2 className={styles.cardTitle}>
          <PixelIcon name="home_place" size={24} />
          {t('settings.data.title')}
        </h2>
        <p className={styles.muted}>{t('settings.data.hint')}</p>
        {persisted && <p className={styles.muted}>{t('settings.data.protected')}</p>}
      </div>
      {persisted === false && (
        <ListRow
          leading={<PixelIcon name="shield" size={24} />}
          title={t('settings.data.protect')}
          subtitle={t('settings.data.protectHint')}
          onClick={() => void protect()}
        />
      )}
      <ListRow
        leading={<PixelIcon name="export" size={24} />}
        title={t('settings.data.export')}
        subtitle={t('settings.data.exportHint')}
        onClick={() => void exportCopy()}
      />
      <ListRow
        leading={<PixelIcon name="import" size={24} />}
        title={t('settings.data.import')}
        subtitle={t('settings.data.importHint')}
        onClick={() => fileInput.current?.click()}
      />
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
      <ListRow
        leading={<PixelIcon name="trash" size={24} />}
        title={t('settings.data.reset')}
        subtitle={t('settings.data.resetHint')}
        onClick={() => setConfirmReset(true)}
      />
      <ListRow
        leading={<PixelIcon name="info" size={24} />}
        title={t('settings.about.title')}
        to={settingsPath('about')}
      />

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
