import { ROUTES } from '@/app/routes';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from '../shared/placeholder.module.css';

export function DayEndScreen() {
  const { t } = useT();
  return (
    <>
      <ScreenHeader variant="bar" title={t('dayEnd.title')} closeTo={ROUTES.today} />
      <Card className={styles.placeholder}>
        <PixelIcon name="good_day" size={48} />
        <p>{t('dayEnd.placeholderBody')}</p>
      </Card>
    </>
  );
}
