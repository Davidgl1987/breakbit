import { useT } from '@/i18n/useT';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import shared from '../shared/placeholder.module.css';
import styles from './GapScreen.module.css';

const OPTIONS = ['s30', 'm1', 'm3', 'm10'] as const;

export function GapScreen() {
  const { t } = useT();
  return (
    <>
      <ScreenHeader title={t('gap.title')} subtitle={t('gap.subtitle')} />
      <div className={styles.options}>
        {OPTIONS.map((option) => (
          <ListRow
            key={option}
            leading={<PixelIcon name="clock" size={32} />}
            title={t(`gap.options.${option}.title`)}
            subtitle={t(`gap.options.${option}.body`)}
            chevron={false}
          />
        ))}
      </div>
      <p className={shared.note}>{t('common.comingSoon')}</p>
    </>
  );
}
