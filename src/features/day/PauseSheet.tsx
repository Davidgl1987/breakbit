import type { ActivityContent, ActivitySlot } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { contentName } from './contentName';
import { PauseContentView } from './PauseContentView';

interface PauseSheetProps {
  content: ActivityContent;
  slot?: ActivitySlot;
  onClose: () => void;
}

/** "Ver ejercicio": a preview of the next pause. It changes nothing: no start, no XP. */
export function PauseSheet({ content, slot, onClose }: PauseSheetProps) {
  const { t, locale } = useT();
  return (
    <BottomSheet
      open
      onClose={onClose}
      title={contentName(content, locale)}
      actions={
        <Button variant="secondary" fullWidth onClick={onClose}>
          {t('pause.close')}
        </Button>
      }
    >
      <PauseContentView content={content} slot={slot} />
    </BottomSheet>
  );
}
