import type { AreaStat } from '@/domain/stats/areas';
import { formatActiveTime } from '@/i18n/translate';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { AREA_ICONS } from '@/ui/icons/domainIcons';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './progress.module.css';

/** "Molestias que más cuidas": what was actually moved, by area. Activity, not results. */
export function AreasCard({ areas }: { areas: readonly AreaStat[] }) {
  const { t } = useT();
  return (
    <Card as="section" className={styles.card}>
      <div className={styles.headTexts}>
        <h2 className={styles.title}>{t('progress.areas.title')}</h2>
        <p className={styles.muted}>{t('progress.areas.caption')}</p>
      </div>
      {areas.length === 0 ? (
        <p className={styles.muted}>{t('progress.areas.empty')}</p>
      ) : (
        <ul className={styles.list}>
          {areas.slice(0, 4).map((stat) => (
            <li key={stat.area}>
              <ListRow
                leading={<PixelIcon name={AREA_ICONS[stat.area]} size={32} />}
                title={t(`areas.${stat.area}`)}
                trailing={
                  <span className={styles.muted}>
                    {t('progress.areas.exercises', { count: stat.exercises })} ·{' '}
                    {formatActiveTime(stat.seconds)}
                  </span>
                }
                chevron={false}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
