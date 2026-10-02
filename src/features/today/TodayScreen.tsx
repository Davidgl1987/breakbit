import { ROUTES } from '@/app/routes';
import { Wordmark } from '@/app/navigation/Wordmark';
import { useT } from '@/i18n/useT';
import { Card } from '@/ui/components/Card/Card';
import { ListRow } from '@/ui/components/ListRow/ListRow';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './TodayScreen.module.css';

export function TodayScreen() {
  const { t } = useT();
  return (
    <>
      <header className={styles.header}>
        <Wordmark />
        <div className={styles.greeting}>
          <h1 className={styles.title}>{t('today.greeting')}</h1>
          <p className={styles.subtitle}>{t('today.subtitle')}</p>
        </div>
      </header>

      <Card variant="tinted" className={styles.placeholder}>
        <PixelIcon name="exercise" size={48} />
        <div>
          <h3>{t('today.placeholderTitle')}</h3>
          <p className={styles.muted}>{t('today.placeholderBody')}</p>
        </div>
      </Card>

      {import.meta.env.DEV && (
        <div className={styles.devLinks}>
          <ListRow
            leading={<PixelIcon name="edit" size={24} />}
            title={t('kit.title')}
            subtitle={t('kit.subtitle')}
            to={ROUTES.devKit}
          />
          <ListRow
            leading={<PixelIcon name="moon" size={24} />}
            title={t('dayEnd.title')}
            subtitle={t('dayEnd.subtitle')}
            to={ROUTES.dayEnd}
          />
        </div>
      )}
    </>
  );
}
