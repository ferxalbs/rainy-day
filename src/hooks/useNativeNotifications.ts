/**
 * useNativeNotifications Hook
 *
 * Connects the app notification system with native OS notifications.
 * Requests permission on first use and sends native notifications
 * for important events.
 *
 * Requirements: 8.1
 */

import { useEffect, useCallback, useRef, useState } from "react";
import {
  initializeNotifications,
  sendNotification,
  sendTypedNotification,
  isPermissionGranted,
} from "../services/nativeNotifications";
import { useNotifications } from "./useNotifications";
import type { Notification } from "../services/backend/notifications";

interface UseNativeNotificationsOptions {
  enabled?: boolean;
  onPermissionChange?: (granted: boolean) => void;
}

export function useNativeNotifications({
  enabled = true,
  onPermissionChange,
}: UseNativeNotificationsOptions = {}) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { notifications } = useNotifications();
  const lastNotificationIdRef = useRef<string | null>(null);
  const seenNotificationsRef = useRef<Set<string>>(new Set());

  // Initialize notifications on mount
  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      const granted = await initializeNotifications();
      setPermissionGranted(granted);
      setInitialized(true);
      onPermissionChange?.(granted);
    };

    init();
  }, [enabled, onPermissionChange]);

  // Check permission status
  const checkPermission = useCallback(async () => {
    const granted = await isPermissionGranted();
    setPermissionGranted(granted);
    return granted;
  }, []);

  // Request permission manually
  const requestPermission = useCallback(async () => {
    const granted = await initializeNotifications();
    setPermissionGranted(granted);
    onPermissionChange?.(granted);
    return granted;
  }, [onPermissionChange]);

  // Send a native notification
  const notify = useCallback(
    async (title: string, body?: string) => {
      if (!permissionGranted) {
        console.warn("Notification permission not granted");
        return false;
      }

      return sendNotification({ title, body });
    },
    [permissionGranted]
  );

  // Watch for new notifications and send native notifications
  useEffect(() => {
    if (!enabled || !initialized || !permissionGranted) return;
    if (notifications.length === 0) return;

    // Find new unread notifications
    const newNotifications = notifications.filter(
      (n) => !n.readAt && !seenNotificationsRef.current.has(n.id)
    );

    // Send native notification for each new notification
    for (const notification of newNotifications) {
      // Mark as seen to avoid duplicate native notifications
      seenNotificationsRef.current.add(notification.id);

      // Only send native notification for high priority or specific types
      if (shouldSendNativeNotification(notification)) {
        sendTypedNotification({
          type: notification.type,
          title: notification.title,
          body: notification.body,
        });
      }
    }

    // Update last notification ID
    if (notifications.length > 0) {
      lastNotificationIdRef.current = notifications[0].id;
    }
  }, [notifications, enabled, initialized, permissionGranted]);

  return {
    permissionGranted,
    initialized,
    checkPermission,
    requestPermission,
    notify,
  };
}

/**
 * Determine if a notification should trigger a native notification
 */
function shouldSendNativeNotification(notification: Notification): boolean {
  // Always send for high priority
  if (notification.priority === "high") {
    return true;
  }

  // Send for specific types
  const nativeTypes = ["task_due", "plan_ready", "reminder"];
  if (nativeTypes.includes(notification.type)) {
    return true;
  }

  return false;
}

export default useNativeNotifications;
