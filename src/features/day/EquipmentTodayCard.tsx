import { CATALOG } from '@/content/catalog';
import { activityEquipment } from '@/domain/planner/ensureEquipment';
import type { DayPlan, EquipmentId } from '@/domain/types';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { LineIcon } from '@/ui/icons/LineIcon';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import { equipmentIcon, equipmentName } from './catalogDisplay';
// The same card as today's activity, right next to it.
import styles from './MainActivityCard.module.css';

interface EquipmentTodayCardProps {
  plan: DayPlan;
  /** What today's plan uses: what the card shows. */
  used: readonly EquipmentId[];
  /** The user's choice for today, if they changed it. */
  chosen?: readonly EquipmentId[];
  onChange?: () => void;
}

/**
 * Today's equipment in preparation, like today's activity: what the plan will use, how
 * often, and any chosen piece that didn't fit anywhere today.
 */
export function EquipmentTodayCard({ plan, used, chosen, onChange }: EquipmentTodayCardProps) {
  const { t, locale } = useT();
  const names = (ids: readonly EquipmentId[]) =>
    ids.map((id) => equipmentName(id, locale)).join(', ');
  const left = (chosen ?? []).filter((id) => !used.includes(id));
  const uses = plan.activities.filter((item) => activityEquipment(item, CATALOG).length > 0).length;
  const line =
    left.length > 0
      ? t('dayStart.gearUsage.left', { names: names(left) })
      : used.length === 0
        ? t('dayStart.gearUsage.none')
        : t('dayStart.gearUsage.uses', { count: uses });
  return (
    <Card as="section" className={styles.card}>
      <h3 className={styles.title}>{t('dayStart.gear')}</h3>
      <span className={styles.watermark} aria-hidden="true">
        <PixelIcon name={used[0] ? equipmentIcon(used[0]) : 'walk'} size={48} />
      </span>
      <strong className={styles.name}>
        {used.length > 0 ? names(used) : t('dayStart.gearNone')}
      </strong>
      {used.length > 0 && (
        <div className={styles.zones}>
          {used.map((id) => (
            <PixelIcon key={id} name={equipmentIcon(id)} size={24} />
          ))}
        </div>
      )}
      <div className={styles.bottom}>
        <span className={styles.when}>{line}</span>
        {onChange && (
          <button className={styles.link} onClick={onChange} aria-label={t('dayStart.gearChange')}>
            {t('dayStart.change')} <LineIcon name="chevron-right" size={18} />
          </button>
        )}
      </div>
    </Card>
  );
}
