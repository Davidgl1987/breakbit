import { feedbackHref } from '@/app/site';
import { useT } from '@/i18n/useT';
import { trackEvent } from '@/services/analytics';
import { buttonClassName } from '@/ui/components/Button/buttonStyles';
import { Card } from '@/ui/components/Card/Card';
import { PixelIcon } from '@/ui/icons/PixelIcon';
import styles from './FeedbackCard.module.css';

/** Asks for an opinion; hidden until the build has somewhere to send it (app/site). */
export function FeedbackCard() {
  const { t } = useT();
  const href = feedbackHref('Breakbit');
  if (!href) return null;
  return (
    <Card variant="tinted" className={styles.card}>
      <h2 className={styles.title}>
        <PixelIcon name="mood_good" size={24} />
        {t('feedback.title')}
      </h2>
      <p className={styles.body}>{t('feedback.body')}</p>
      <a
        className={buttonClassName({ variant: 'secondary', fullWidth: true })}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('feedback-open')}
      >
        {t('feedback.action')}
      </a>
    </Card>
  );
}
