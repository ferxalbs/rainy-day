/**
 * useNotificationSettings Hook
 *
 * Manages notification settings state with persistence.
 * Provides auto-initialization and manual toggle capabilities.
 */

import { useState, useCallback, useEffect } from "react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from "../services/notificationSettings";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "../services/nativeNotifications";

export interface UseNotificationSettingsReturn {
  /** Current settings */
  settings: NotificationSettings;
  /** Whether notifications are working (enabled + permission granted) */
  isActive: boolean;
  /** Toggle notifications on/off */
  toggle: () => Promise<void>;
  /** Manually request permission */
  requestNotificationPermission: () => Promise<boolean>;
  /** Send a test notification */
  sendTestNotification: () => Promise<boolean>;
  /** Direct JS plugin test for debugging */
  testWithJSPlugin: () => Promise<boolean>;
  /** Update auto-initialize setting */
  setAutoInitialize: (value: boolean) => void;
}

export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(
    getNotificationSettings
  );
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await isPermissionGranted();
      setPermissionGranted(granted);
      saveNotificationSettings({ permissionState: granted ? "granted" : "default" });
    };
    checkPermission();
  }, []);

  // Auto-initialize on mount if enabled
  useEffect(() => {
    const autoInit = async () => {
      if (settings.autoInitialize && settings.enabled && !settings.hasBeenPrompted) {
        const granted = await isPermissionGranted();
        if (!granted) {
          const result = await requestPermission();
          setPermissionGranted(result === "granted");
          saveNotificationSettings({
            hasBeenPrompted: true,
            permissionState: result,
          });
        } else {
          setPermissionGranted(true);
        }
      }
    };
    autoInit();
  }, [settings.autoInitialize, settings.enabled, settings.hasBeenPrompted]);

  const toggle = useCallback(async () => {
    const newEnabled = !settings.enabled;
    
    if (newEnabled && !permissionGranted) {
      // Request permission when enabling
      const result = await requestPermission();
      const granted = result === "granted";
      setPermissionGranted(granted);
      const updated = saveNotificationSettings({
        enabled: granted,
        hasBeenPrompted: true,
        permissionState: result,
      });
      setSettings(updated);
    } else {
      const updated = saveNotificationSettings({ enabled: newEnabled });
      setSettings(updated);
    }
  }, [settings.enabled, permissionGranted]);

  const requestNotificationPermission = useCallback(async () => {
    const result = await requestPermission();
    const granted = result === "granted";
    setPermissionGranted(granted);
    const updated = saveNotificationSettings({
      hasBeenPrompted: true,
      permissionState: result,
      enabled: granted,
    });
    setSettings(updated);
    return granted;
  }, []);

  const sendTestNotification = useCallback(async () => {
    console.log("[NotificationSettings] Sending test notification...");
    const result = await sendNotification({
      title: "Rainy Day",
      body: "🔔 ¡Notificaciones funcionando correctamente!",
      sound: "Glass",
    });
    console.log("[NotificationSettings] Test result:", result);
    return result;
  }, []);

  // Direct JS plugin test for debugging
  const testWithJSPlugin = useCallback(async () => {
    console.log("[NotificationSettings] Testing with JS plugin directly...");
    try {
      const module = await import("@tauri-apps/plugin-notification");
      console.log("[NotificationSettings] JS plugin loaded:", module);
      
      const permission = await module.isPermissionGranted();
      console.log("[NotificationSettings] Permission state:", permission);
      
      if (!permission) {
        const result = await module.requestPermission();
        console.log("[NotificationSettings] Permission request result:", result);
      }
      
      module.sendNotification({
        title: "Test - JS Plugin",
        body: "Direct JS plugin notification test",
      });
      console.log("[NotificationSettings] JS plugin notification sent");
      return true;
    } catch (error) {
      console.error("[NotificationSettings] JS plugin error:", error);
      return false;
    }
  }, []);

  const setAutoInitialize = useCallback((value: boolean) => {
    const updated = saveNotificationSettings({ autoInitialize: value });
    setSettings(updated);
  }, []);

  return {
    settings,
    isActive: settings.enabled && permissionGranted,
    toggle,
    requestNotificationPermission,
    sendTestNotification,
    testWithJSPlugin,
    setAutoInitialize,
  };
}

export default useNotificationSettings;
