import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { FlowLayout } from '@/ui/components/FlowLayout/FlowLayout';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { Stepper } from '@/ui/components/Stepper/Stepper';
import { LineIcon } from '@/ui/icons/LineIcon';
import styles from './OnboardingStep.module.css';
import {
  ONBOARDING_STEPS,
  onboardingPath,
  previousStep,
  stepIndex,
  type OnboardingStepId,
} from './steps';

interface OnboardingStepProps {
  step: OnboardingStepId;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  footerNote?: string;
  /** Optional illustration; configuring the plan does not evolve the avatar. */
  trailing?: ReactNode;
  children: ReactNode;
  action: { label: string; onClick: () => void; disabled?: boolean };
}

/**
 * Five configuration steps. The brand and welcome screens do not count as fields to fill.
 */
export function OnboardingStep({
  step,
  title,
  subtitle,
  eyebrow,
  footerNote,
  trailing,
  children,
  action,
}: OnboardingStepProps) {
  const { t } = useT();
  const back = previousStep(step);
  return (
    <FlowLayout
      top={
        <>
          {back && (
            <IconButton label={t('common.back')} to={onboardingPath(back)}>
              <LineIcon name="chevron-left" size={24} />
            </IconButton>
          )}
          <div className={styles.progress}>
            <Stepper current={stepIndex(step) - 1} total={ONBOARDING_STEPS.length - 2} />
          </div>
        </>
      }
      header={
        <header className={styles.header}>
          <div className={styles.texts}>
            <p className={styles.eyebrow}>{eyebrow ?? t('onboarding.design.yourPlan')}</p>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {trailing}
        </header>
      }
      footer={
        <>
          {footerNote && <p className={styles.footerNote}>{footerNote}</p>}
          <Button size="lg" fullWidth disabled={action.disabled} onClick={action.onClick}>
            {action.label}
          </Button>
        </>
      }
    >
      {children}
    </FlowLayout>
  );
}
