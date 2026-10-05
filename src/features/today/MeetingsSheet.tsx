import type { Meeting } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

interface MeetingsSheetProps {
  meetings: readonly Meeting[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onClose: () => void;
}

/** "Reuniones de hoy": add one, or tap one to change or remove it. Pauses move around them. */
export function MeetingsSheet({ meetings, onAdd, onEdit, onClose }: MeetingsSheetProps) {
  const { t } = useT();
  return (
    <BottomSheet open onClose={onClose} title={t('today.meetings.title')}>
      <div className={styles.daySheet}>
        {meetings.length === 0 ? (
          <p className={styles.muted}>{t('dayStart.meetingsEmpty')}</p>
        ) : (
          <div className={styles.daySheetList}>
            {meetings.map((meeting) => (
              <ListRow
                key={meeting.id}
                leading={<PixelIcon name="meeting" size={32} />}
                title={`${meeting.start}–${meeting.end}`}
                subtitle={meeting.canMove ? t('dayStart.canMove') : undefined}
                onClick={() => onEdit(meeting.id)}
              />
            ))}
          </div>
        )}
        <Button variant="secondary" fullWidth onClick={onAdd}>
          {t('dayStart.addMeeting')}
        </Button>
        <p className={styles.small}>{t('today.meetings.hint')}</p>
      </div>
    </BottomSheet>
  );
}
