export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function notificationPermission(): NotificationPermissionState {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/** Asks the browser. Only call it from a user action, after explaining why. */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}
