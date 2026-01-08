/**
 * Hook for managing notifications
 *
 * This hook provides state management for notifications,
 * including fetching, marking as read, and auto-refresh.
 *
 * Requirements: 3.4, 3.6
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  type Notification,
} from "../services/backend/notifications";

/** Default refresh interval in milliseconds (30 seconds) */
const DEFAULT_REFRESH_INTERVAL = 30000;

export interface UseNotificationsReturn {
  /** List of notifications */
  notifications: Notification[];
  /** Count of unread notifications */
  unreadCount: number;
  /** Whether notifications are being loaded */
  isLoading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Mark a specific notification as read */
  markAsRead: (notificationId: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Manually refresh notifications */
  refresh: () => Promise<void>;
}

export interface UseNotificationsOptions {
  /** Refresh interval in milliseconds (default: 30000) */
  refreshInterval?: number;
  /** Whether to include read notifications (default: false) */
  includeRead?: boolean;
  /** Maximum number of notifications to fetch (default: 50) */
  limit?: number;
  /** Whether to auto-refresh (default: true) */
  autoRefresh?: boolean;
}

/**
 * Hook for managing notifications with auto-refresh
 *
 * Automatically fetches notifications on mount and refreshes
 * at the specified interval.
 *
 * Requirements: 3.4, 3.6
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    includeRead = false,
    limit = 50,
    autoRefresh = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Fetch notifications and unread count from the backend
   */
  const fetchNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const [fetchedNotifications, count] = await Promise.all([
        getNotifications(limit, includeRead),
        getUnreadCount(),
      ]);

      if (isMountedRef.current) {
        setNotifications(fetchedNotifications);
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      if (isMountedRef.current) {
        setError("Failed to load notifications. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit, includeRead]);

  /**
   * Mark a specific notification as read
   * Requirements: 3.6
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const success = await markAsReadService(notificationId);

        if (success && isMountedRef.current) {
          // Update local state optimistically
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, readAt: Date.now() } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        setError("Failed to mark notification as read.");
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   * Requirements: 3.6
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const count = await markAllAsReadService();

      if (isMountedRef.current) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.readAt ? n : { ...n, readAt: Date.now() }))
        );
        setUnreadCount(0);

        // Log how many were marked
        if (count > 0) {
          console.log(`Marked ${count} notifications as read`);
        }
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchNotifications]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
