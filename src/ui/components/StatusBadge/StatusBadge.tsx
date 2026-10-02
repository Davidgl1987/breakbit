import { useT } from '@/i18n/useT';
import { cx } from '@/ui/cx';
import type { IconName } from '@/ui/icons/iconNames';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './StatusBadge.module.css';

export type BadgeStatus = 'pending' | 'postponed' | 'completed' | 'missed' | 'firstTry' | 'extra';

const ICONS: Record<BadgeStatus, IconName> = {
  pending: 'pending',
  postponed: 'postponed',
  completed: 'completed',
  missed: 'missed',
  firstTry: 'first_try',
  extra: 'extra',
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const { t } = useT();
  return (
    <span className={cx(styles.badge, styles[status])}>
      <PixelIcon name={ICONS[status]} size={16} />
      {t(`status.${status}`)}
    </span>
  );
}
