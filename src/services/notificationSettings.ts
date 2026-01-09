/**
 * Notification Settings Service
 *
 * Manages notification preferences with localStorage persistence.
 * Settings include auto-initialization and manual enable/disable.
 */

const STORAGE_KEY = "rainy-day-notification-settings";

export interface NotificationSettings {
  /** Auto-request permission on app start */
  autoInitialize: boolean;
  /** User has explicitly enabled/disabled notifications */
  enabled: boolean;
  /** User has been prompted for permission */
  hasBeenPrompted: boolean;
  /** Last permission state */
  permissionState: "granted" | "denied" | "default" | null;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  autoInitialize: true,
  enabled: true,
  hasBeenPrompted: false,
  permissionState: null,
};

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn("Failed to load notification settings:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save notification settings:", error);
  }
  return updated;
}

/**
 * Update a single setting
 */
export function updateNotificationSetting<K extends keyof NotificationSettings>(
  key: K,
  value: NotificationSettings[K]
): NotificationSettings {
  return saveNotificationSettings({ [key]: value });
}

/**
 * Reset to default settings
 */
export function resetNotificationSettings(): NotificationSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to reset notification settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export default {
  getNotificationSettings,
  saveNotificationSettings,
  updateNotificationSetting,
  resetNotificationSettings,
};
