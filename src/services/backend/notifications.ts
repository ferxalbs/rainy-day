/**
 * Notifications Service
 *
 * Handles interactions with the backend notifications endpoints.
 * Matches the backend Notification interface from server/src/services/notifications/index.ts
 */

import { get, post, del } from "./api";
import {
  cacheSet,
  cacheGetStale,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  isNetworkError,
  type CacheResult,
} from "./cache";

/**
 * Notification type from the backend
 */
export interface Notification {
  id: string;
  type: "reminder" | "task_due" | "plan_ready" | "email_summary" | "system";
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  priority: "low" | "normal" | "high";
  createdAt: number;
  readAt?: number;
}

/**
 * Get notifications for the current user
 * Falls back to cached data on network errors
 * @param limit - Maximum number of notifications to return (default: 50)
 * @param includeRead - Whether to include read notifications (default: false)
 */
export async function getNotifications(
  limit = 50,
  includeRead = false
): Promise<Notification[]> {
  try {
    const response = await get<{ notifications: Notification[]; count: number }>(
      `/notifications?limit=${limit}&include_read=${includeRead}`
    );
    if (response.ok) {
      const notifications = response.data?.notifications ?? [];
      cacheSet(CACHE_KEYS.NOTIFICATIONS, notifications, CACHE_EXPIRATION.NOTIFICATIONS);
      return notifications;
    }
    return [];
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<Notification[]>(CACHE_KEYS.NOTIFICATIONS);
      if (cached) {
        return cached.data;
      }
    }
    throw error;
  }
}

/**
 * Get notifications with cache metadata
 */
export async function getNotificationsWithCache(
  limit = 50,
  includeRead = false
): Promise<{
  notifications: Notification[];
  fromCache: boolean;
  isStale: boolean;
  cachedAt?: number;
}> {
  try {
    const response = await get<{ notifications: Notification[]; count: number }>(
      `/notifications?limit=${limit}&include_read=${includeRead}`
    );
    if (response.ok) {
      const notifications = response.data?.notifications ?? [];
      cacheSet(CACHE_KEYS.NOTIFICATIONS, notifications, CACHE_EXPIRATION.NOTIFICATIONS);
      return { notifications, fromCache: false, isStale: false };
    }
    return { notifications: [], fromCache: false, isStale: false };
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<Notification[]>(CACHE_KEYS.NOTIFICATIONS);
      if (cached) {
        return {
          notifications: cached.data,
          fromCache: true,
          isStale: cached.isStale,
          cachedAt: cached.cachedAt,
        };
      }
    }
    throw error;
  }
}

/**
 * Get cached notifications (for offline indicator)
 */
export function getCachedNotifications(): CacheResult<Notification[]> | null {
  return cacheGetStale<Notification[]>(CACHE_KEYS.NOTIFICATIONS);
}

/**
 * Get the count of unread notifications
 * Falls back to cached data on network errors
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await get<{ unread_count: number }>("/notifications/count");
    if (response.ok) {
      const count = response.data?.unread_count ?? 0;
      cacheSet(CACHE_KEYS.NOTIFICATION_COUNT, count, CACHE_EXPIRATION.NOTIFICATION_COUNT);
      return count;
    }
    return 0;
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<number>(CACHE_KEYS.NOTIFICATION_COUNT);
      if (cached) {
        return cached.data;
      }
    }
    throw error;
  }
}

/**
 * Get unread count with cache metadata
 */
export async function getUnreadCountWithCache(): Promise<{
  count: number;
  fromCache: boolean;
  isStale: boolean;
  cachedAt?: number;
}> {
  try {
    const response = await get<{ unread_count: number }>("/notifications/count");
    if (response.ok) {
      const count = response.data?.unread_count ?? 0;
      cacheSet(CACHE_KEYS.NOTIFICATION_COUNT, count, CACHE_EXPIRATION.NOTIFICATION_COUNT);
      return { count, fromCache: false, isStale: false };
    }
    return { count: 0, fromCache: false, isStale: false };
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<number>(CACHE_KEYS.NOTIFICATION_COUNT);
      if (cached) {
        return {
          count: cached.data,
          fromCache: true,
          isStale: cached.isStale,
          cachedAt: cached.cachedAt,
        };
      }
    }
    throw error;
  }
}

/**
 * Mark a specific notification as read
 * @param notificationId - The ID of the notification to mark as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const response = await post(`/notifications/${notificationId}/read`);
  return response.ok;
}

/**
 * Mark all notifications as read
 * @returns The number of notifications marked as read
 */
export async function markAllAsRead(): Promise<number> {
  const response = await post<{ count: number }>("/notifications/read-all");
  return response.ok ? response.data?.count ?? 0 : 0;
}

/**
 * Delete a notification
 * @param notificationId - The ID of the notification to delete
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const response = await del(`/notifications/${notificationId}`);
  return response.ok;
}
