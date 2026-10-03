import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { useToasts } from '@/state/toasts';
import { Toast } from '@/ui/components/Toast/Toast';
import styles from './ToastHost.module.css';

const VISIBLE_MS = 4000;

/** Shows the current confirmation at the top of the app and lets it go after a moment. */
export function ToastHost() {
  const { t } = useT();
  const toasts = useToasts((state) => state.toasts);
  const dismiss = useToasts((state) => state.dismiss);
  const current = toasts.at(-1);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => dismiss(current.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  return (
    <div className={styles.host} role="status" aria-live="polite">
      {current && (
        <Toast
          key={current.id}
          message={current.message}
          tone={current.tone}
          closeLabel={t('toasts.close')}
          onClose={() => dismiss(current.id)}
        />
      )}
    </div>
  );
}
