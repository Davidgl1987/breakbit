import { useNavigate } from 'react-router';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { Wordmark } from '@/ui/components/Wordmark/Wordmark';
import { LineIcon } from '@/ui/icons/LineIcon';
import { onboardingPath } from '../steps';
import styles from './IntroStep.module.css';

/** Brand introduction for the first setup. Returning users go straight to Today. */
export function IntroStep() {
  const { t } = useT();
  const navigate = useNavigate();
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Wordmark />
      </header>
      <div className={styles.identity}>
        <img
          src={`${import.meta.env.BASE_URL}brand/symbol-dark.png`}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${styles.symbol} ${styles.darkSymbol}`}
        />
        <img
          src={`${import.meta.env.BASE_URL}brand/symbol-light.png`}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`${styles.symbol} ${styles.lightSymbol}`}
        />
        <h1 className={styles.slogan}>
          <span>{t('onboarding.brand.pause')}</span>{' '}
          <span className={styles.accent}>{t('onboarding.brand.move')}</span>{' '}
          <span>{t('onboarding.brand.continue')}</span>
        </h1>
        <p className={styles.subtitle}>{t('onboarding.brand.subtitle')}</p>
      </div>
      <footer className={styles.footer}>
        <Button size="lg" fullWidth onClick={() => navigate(onboardingPath('welcome'))}>
          {t('onboarding.brand.start')}
          <LineIcon name="chevron-right" size={18} />
        </Button>
        <p>{t('onboarding.welcome.points.private')}</p>
      </footer>
    </div>
  );
}
