import { useState } from 'react';
import { CATALOG } from '@/content/catalog';
import type { EquipmentId } from '@/domain/types';
import { EquipmentFields } from '@/features/profile/EquipmentFields';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { InlineMessage } from '@/ui/components/InlineMessage/InlineMessage';
import styles from './day.module.css';

interface EquipmentSheetProps {
  /** Today's equipment, as it is now. */
  current: readonly EquipmentId[];
  /** The user's equipment (Settings): what today can use. */
  owned: readonly EquipmentId[];
  onSave: (equipment: EquipmentId[]) => void;
  onClose: () => void;
}

/** "Material de hoy": which of the user's equipment today uses. Settings stay as they are. */
export function EquipmentSheet({ current, owned, onSave, onClose }: EquipmentSheetProps) {
  const { t } = useT();
  const [draft, setDraft] = useState<EquipmentId[]>([...current]);
  // Their own equipment, plus anything today already has (a plan from before a change).
  const items = CATALOG.equipment
    .map((item) => item.id)
    .filter((id) => owned.includes(id) || current.includes(id));

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={t('dayStart.gear')}
      actions={
        items.length > 0 ? (
          <>
            <Button fullWidth onClick={() => onSave(draft)}>
              {t('settings.save')}
            </Button>
            <Button variant="ghost" fullWidth onClick={onClose}>
              {t('settings.cancel')}
            </Button>
          </>
        ) : (
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('common.close')}
          </Button>
        )
      }
    >
      <div className={styles.sheetBody}>
        {items.length > 0 ? (
          <>
            <p className={styles.muted}>{t('dayStart.gearSheet.note')}</p>
            <EquipmentFields value={draft} onChange={setDraft} items={items} />
          </>
        ) : (
          <InlineMessage icon="info">{t('dayStart.gearSheet.empty')}</InlineMessage>
        )}
      </div>
    </BottomSheet>
  );
}
