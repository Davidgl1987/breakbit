import { useEffect, useRef, useState } from 'react';
import { LineIcon } from '@/ui/icons/LineIcon';
import { toDateKey } from '@/domain/time';
import { levelFromXp, totalXp } from '@/domain/progress/xp';
import { formatLongDate } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { clock } from '@/services/clock';
import { downloadJson } from '@/services/download';
import { isStoragePersisted, requestPersistentStorage } from '@/services/storagePersistence';
import { BackupError, exportBackup, importBackup, parseBackup, resetAllData } from '@/state/backup';
import { showToast } from '@/state/toasts';
import { Button } from '@/ui/components/Button/Button';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { DataConfirmationSheet, type BackupPreview } from './DataConfirmationSheet';
import styles from './SettingsScreen.module.css';

/**
 * "Tus datos": everything lives on this device, so the user can save it to a file, bring
 * a copy back (after checking it), or start from scratch. Both last ones ask first.
 */
export function DataCard() {
  const { t, locale } = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupPreview | null>(null);
  const [fileError, setFileError] = useState<'invalid' | 'newer' | null>(null);
  const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
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
    setReading(true);
    setFileError(null);
    setPending(null);
    try {
      const raw: unknown = JSON.parse(await file.text());
      // Checked in full before asking; nothing changes yet.
      const { state } = parseBackup(raw);
      const exportedAt = (raw as { exportedAt?: unknown }).exportedAt;
      const date =
        typeof exportedAt === 'number' &&
        Number.isFinite(exportedAt) &&
        !Number.isNaN(new Date(exportedAt).getTime())
          ? formatLongDate(locale, toDateKey(exportedAt))
          : '—';
      const xp = totalXp(state.xpLedger);
      setPending({
        raw,
        date,
        filename: file.name,
        days: Object.keys(state.days).length,
        phase: state.progress.evolutionPhase,
        level: levelFromXp(xp).level,
        xp,
      });
    } catch (error) {
      setFileError(
        error instanceof BackupError && error.code === 'unsupported_version' ? 'newer' : 'invalid',
      );
    } finally {
      setReading(false);
    }
  };

  const exportFromCard = async () => {
    setExporting(true);
    setExportError(false);
    try {
      await exportCopy();
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card as="section" className={styles.dataCard}>
      <div className={styles.headTexts}>
        <div className={styles.dataHead}>
          <h2 className={styles.cardTitle}>
            <PixelIcon name="home_place" size={24} />
            {t('settings.data.title')}
          </h2>
          {persisted === false && (
            <button
              className={styles.textLink}
              aria-label={t('settings.data.protect')}
              onClick={() => void protect()}
              title={t('settings.data.protectHint')}
            >
              <PixelIcon name="shield" size={16} />
              {t('settings.data.protectShort')}
            </button>
          )}
        </div>
        <p className={styles.muted}>{t('settings.data.hint')}</p>
        {persisted && <p className={styles.muted}>{t('settings.data.protected')}</p>}
      </div>
      <div className={styles.dataActions}>
        <Button
          variant="secondary"
          aria-label={t('settings.data.export')}
          disabled={exporting || reading}
          onClick={() => void exportFromCard()}
        >
          <PixelIcon name="export" size={24} />
          {t('settings.data.exportAction')}
        </Button>
        <Button
          variant="secondary"
          aria-label={t('settings.data.import')}
          disabled={reading || exporting}
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
        disabled={reading || exporting}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void readFile(file);
        }}
      />
      {fileError && (
        <div className={styles.importError} role="alert">
          <div className={styles.errorHeading}>
            <PixelIcon name="warning" size={24} />
            <strong>
              {t(fileError === 'newer' ? 'special.data.newerTitle' : 'special.data.invalidTitle')}
            </strong>
            <button
              className={styles.errorClose}
              aria-label={t('special.data.dismiss')}
              onClick={() => setFileError(null)}
            >
              <LineIcon name="close" size={18} />
            </button>
          </div>
          <p>{t(fileError === 'newer' ? 'special.data.newerBody' : 'special.data.invalidBody')}</p>
          <p className={styles.muted}>{t('special.data.unchanged')}</p>
          <button
            className={styles.textLink}
            disabled={reading}
            onClick={() => fileInput.current?.click()}
          >
            {t('special.data.retry')}
            <LineIcon name="chevron-right" size={18} />
          </button>
        </div>
      )}
      {exportError && (
        <p className={styles.operationError} role="alert">
          {t('special.data.operationFailed')}
        </p>
      )}
      <button
        className={`${styles.dataLink} ${styles.dangerLink}`}
        onClick={() => setConfirmReset(true)}
        disabled={reading || exporting}
      >
        {t('settings.data.reset')}
        <LineIcon name="chevron-right" size={18} />
      </button>

      {pending && (
        <DataConfirmationSheet
          preview={pending}
          onClose={() => setPending(null)}
          onExport={exportCopy}
          onConfirm={async () => {
            await importBackup(pending.raw);
            setPending(null);
            showToast(t('settings.data.imported'), 'success');
          }}
        />
      )}
      {confirmReset && (
        <DataConfirmationSheet
          onClose={() => setConfirmReset(false)}
          onExport={exportCopy}
          onConfirm={async () => {
            await resetAllData();
            setConfirmReset(false);
          }}
        />
      )}
    </Card>
  );
}
