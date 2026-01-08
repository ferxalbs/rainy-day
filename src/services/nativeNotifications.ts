/**
 * Native Notifications Service
 *
 * Uses Tauri's notification API for system notifications.
 * Prefers Rust commands for native performance, falls back to
 * JS plugin and web notifications.
 *
 * Requirements: 8.1
 */

import { invoke } from "@tauri-apps/api/core";

// Check if we're running in Tauri
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  sound?: string;
}

interface TypedNotificationOptions {
  type: "reminder" | "task_due" | "plan_ready" | "email_summary" | "system";
  title: string;
  body?: string;
}

/**
 * Check if notification permission is granted
 * Uses Rust command for native performance
 */
export async function isPermissionGranted(): Promise<boolean> {
  if (isTauri) {
    try {
      return await invoke<boolean>("check_notification_permission");
    } catch (error) {
      console.warn("Failed to check notification permission via Rust:", error);
      // Fallback to JS plugin
      try {
        const module = await import("@tauri-apps/plugin-notification");
        return await module.isPermissionGranted();
      } catch {
        // Plugin not available
      }
    }
  }

  // Fallback to web notifications
  if ("Notification" in window) {
    return Notification.permission === "granted";
  }

  return false;
}

/**
 * Request notification permission
 * Uses Rust command for native performance
 */
export async function requestPermission(): Promise<
  "granted" | "denied" | "default"
> {
  if (isTauri) {
    try {
      const result = await invoke<string>("request_notification_permission");
      if (result === "granted" || result === "denied") {
        return result;
      }
      return "default";
    } catch (error) {
      console.warn(
        "Failed to request notification permission via Rust:",
        error
      );
      // Fallback to JS plugin
      try {
        const module = await import("@tauri-apps/plugin-notification");
        return await module.requestPermission();
      } catch {
        // Plugin not available
      }
    }
  }

  // Fallback to web notifications
  if ("Notification" in window) {
    return await Notification.requestPermission();
  }

  return "denied";
}

/**
 * Send a native notification
 * Uses Rust command for native performance with sound support
 */
export async function sendNotification(
  options: NotificationOptions
): Promise<boolean> {
  if (isTauri) {
    try {
      await invoke("send_native_notification", {
        title: options.title,
        body: options.body ?? null,
        sound: options.sound ?? null,
      });
      return true;
    } catch (error) {
      console.warn("Failed to send notification via Rust:", error);
      // Fallback to JS plugin
      try {
        const module = await import("@tauri-apps/plugin-notification");
        const hasPermission = await module.isPermissionGranted();
        if (!hasPermission) {
          const permission = await module.requestPermission();
          if (permission !== "granted") {
            console.warn("Notification permission denied");
            return false;
          }
        }

        module.sendNotification({
          title: options.title,
          body: options.body,
          icon: options.icon,
        });
        return true;
      } catch {
        // Plugin not available
      }
    }
  }

  // Fallback to web notifications
  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return false;
      }
    }

    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
    });
    return true;
  }

  console.warn("Notifications not supported");
  return false;
}

/**
 * Send a typed notification with automatic sound mapping
 * Uses Rust command for native performance
 */
export async function sendTypedNotification(
  options: TypedNotificationOptions
): Promise<boolean> {
  if (isTauri) {
    try {
      await invoke("send_typed_notification", {
        notificationType: options.type,
        title: options.title,
        body: options.body ?? null,
      });
      return true;
    } catch (error) {
      console.warn("Failed to send typed notification via Rust:", error);
      // Fallback to regular notification
      return sendNotification({
        title: options.title,
        body: options.body,
      });
    }
  }

  // Fallback to regular notification (no sound support)
  return sendNotification({
    title: options.title,
    body: options.body,
  });
}

/**
 * Initialize notifications - request permission on first use
 */
export async function initializeNotifications(): Promise<boolean> {
  const hasPermission = await isPermissionGranted();

  if (!hasPermission) {
    const permission = await requestPermission();
    return permission === "granted";
  }

  return true;
}

export default {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  sendTypedNotification,
  initializeNotifications,
};
