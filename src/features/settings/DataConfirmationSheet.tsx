import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './SettingsScreen.module.css';

export interface BackupPreview {
  raw: unknown;
  filename: string;
  date: string;
  days: number;
  phase: number;
  level: number;
  xp: number;
}

/** One shared action panel: the copy is validated before this can be mounted. */
export function DataConfirmationSheet({
  preview,
  onConfirm,
  onExport,
  onClose,
}: {
  preview?: BackupPreview;
  onConfirm: () => Promise<void>;
  onExport: () => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const perform = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(false);
    try {
      await action();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <BottomSheet
      open
      onClose={close}
      scrollBody
      titleVariant="pixel"
      title={t(preview ? 'special.data.importTitle' : 'special.data.resetTitle')}
      actions={
        <>
          <Button
            fullWidth
            disabled={busy}
            variant={preview ? 'primary' : 'destructive'}
            onClick={() => void perform(onConfirm)}
          >
            {t(preview ? 'special.data.importConfirm' : 'special.data.resetConfirm')}
          </Button>
          <Button variant="secondary" fullWidth disabled={busy} onClick={close}>
            {t(preview ? 'settings.data.importSheet.cancel' : 'special.data.resetCancel')}
          </Button>
        </>
      }
    >
      <div className={styles.specialBody} aria-busy={busy}>
        {preview ? (
          <>
            <div className={styles.backupFile}>
              <PixelIcon name="import" size={24} />
              <div>
                <p>{preview.filename}</p>
                <p className={styles.muted}>{t('special.data.copyDate', { date: preview.date })}</p>
              </div>
            </div>
            <dl className={styles.backupFacts}>
              <div>
                <dt>{t('special.data.days')}</dt>
                <dd>{preview.days}</dd>
              </div>
              <div>
                <dt>{t('special.data.progress')}</dt>
                <dd>
                  {t('special.data.phaseLevel', { phase: preview.phase, level: preview.level })}
                </dd>
              </div>
              <div>
                <dt>{t('special.data.xp')}</dt>
                <dd>{preview.xp} XP</dd>
              </div>
            </dl>
            <p>{t('special.data.importBody')}</p>
          </>
        ) : (
          <>
            <p>{t('special.data.resetBody')}</p>
            <ul className={styles.resetList}>
              <li>
                <PixelIcon name="calendar" size={24} />
                {t('special.data.resetDays')}
              </li>
              <li>
                <PixelIcon name="progress" size={24} />
                {t('special.data.resetProgress')}
              </li>
              <li>
                <PixelIcon name="xp" size={24} />
                {t('special.data.resetXp')}
              </li>
            </ul>
            <p className={styles.muted}>{t('special.data.resetKept')}</p>
            <p className={styles.dangerText}>{t('special.data.resetWarning')}</p>
          </>
        )}
        <button className={styles.textLink} disabled={busy} onClick={() => void perform(onExport)}>
          <PixelIcon name="export" size={24} />
          {t('special.data.saveFirst')}
        </button>
        {error && (
          <p className={styles.operationError} role="alert">
            {t('special.data.operationFailed')}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
