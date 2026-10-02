import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from '../shared/placeholder.module.css';

export function ProgressScreen() {
  const { t } = useT();
  return (
    <>
      <ScreenHeader
        title={t('progress.title')}
        subtitle={t('progress.subtitle')}
        trailing={<PixelIcon name="progress" size={32} />}
      />
      <Card className={styles.placeholder}>
        <PixelIcon name="level_up" size={48} />
        <p>{t('progress.placeholderBody')}</p>
      </Card>
    </>
  );
}
