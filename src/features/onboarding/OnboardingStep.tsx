import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/components/Button/Button';
import { IconButton } from '@/ui/components/IconButton/IconButton';
import { ScreenHeader } from '@/ui/components/ScreenHeader/ScreenHeader';
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
  /** Shown next to the title (e.g. the avatar on the last step). */
  trailing?: ReactNode;
  children: ReactNode;
  action: { label: string; onClick: () => void; disabled?: boolean };
}

/** Shared frame of steps 2–6: back + progress, title, content, sticky main action. */
export function OnboardingStep({
  step,
  title,
  subtitle,
  trailing,
  children,
  action,
}: OnboardingStepProps) {
  const { t } = useT();
  const back = previousStep(step);
  return (
    <div className={styles.step}>
      <div className={styles.top}>
        {back && (
          <IconButton label={t('common.back')} to={onboardingPath(back)}>
            <LineIcon name="chevron-left" size={24} />
          </IconButton>
        )}
        <div className={styles.progress}>
          <Stepper current={stepIndex(step) + 1} total={ONBOARDING_STEPS.length} />
        </div>
      </div>
      <ScreenHeader title={title} subtitle={subtitle} trailing={trailing} />
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>
        <Button size="lg" fullWidth disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </Button>
      </div>
    </div>
  );
}
