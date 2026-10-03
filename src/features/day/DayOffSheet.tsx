import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';

/** Confirms "Hoy no trabajo": no pauses today; the streak is neither added to nor broken. */
export function DayOffSheet({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <BottomSheet
      open
      onClose={onClose}
      title={t('today.dayOffSheet.title')}
      actions={
        <>
          <Button variant="secondary" fullWidth onClick={onConfirm}>
            {t('today.dayOffSheet.confirm')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('today.dayOffSheet.cancel')}
          </Button>
        </>
      }
    >
      <p>{t('today.dayOffSheet.body')}</p>
    </BottomSheet>
  );
}
