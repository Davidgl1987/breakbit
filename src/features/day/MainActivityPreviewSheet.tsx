import { Link } from 'react-router';
import { mainPath } from '@/app/routes';
import type { ScheduledActivity } from '@/domain/types';
import { formatClock, formatDuration } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Button } from '@/ui/components/Button/Button';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { ExerciseDetails } from './ExerciseDetails';
import { mainActivityInfo } from './mainActivity';
import styles from './day.module.css';

/** Preview the activity, enter its existing session or open the shared editor. */
export function MainActivityPreviewSheet({
  activity,
  onEdit,
  onClose,
}: {
  activity: ScheduledActivity;
  onEdit: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useT();
  const info = mainActivityInfo(activity);
  if (!info) return null;
  return (
    <BottomSheet
      open
      title={info.name[locale]}
      onClose={onClose}
      actions={
        <>
          <Link to={mainPath(activity.id)} className={buttonClassName({ fullWidth: true })}>
            {t('main.start')}
          </Link>
          <Button variant="secondary" fullWidth onClick={onEdit}>
            {t('main.change')}
          </Button>
        </>
      }
    >
      <div className={styles.sheetBody}>
        <p>
          {formatClock(activity.currentScheduledAt)} · {formatDuration(activity.durationSec / 60)}
        </p>
        <ExerciseDetails exercise={info} />
      </div>
    </BottomSheet>
  );
}
