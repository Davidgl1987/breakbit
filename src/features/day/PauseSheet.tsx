import type { ActivityContent, ActivitySlot } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { contentName } from './contentName';
import { PauseContentView } from './PauseContentView';

interface PauseSheetProps {
  content: ActivityContent;
  slot?: ActivitySlot;
  onClose: () => void;
}

/** "Ver ejercicio": a preview of the next pause. It changes nothing: no start, no XP. */
export function PauseSheet({ content, slot, onClose }: PauseSheetProps) {
  const { locale } = useT();
  return (
    <BottomSheet open onClose={onClose} title={contentName(content, locale)}>
      <PauseContentView content={content} slot={slot} />
    </BottomSheet>
  );
}
