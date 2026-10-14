import styles from './AppIcon.module.css';

/** The same application identity in install help, previews and in-app notifications. */
export function AppIcon({ size = 32 }: { size?: number }) {
  return (
    <img
      className={styles.icon}
      src={`${import.meta.env.BASE_URL}app-icons/icon-192.png`}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  );
}
