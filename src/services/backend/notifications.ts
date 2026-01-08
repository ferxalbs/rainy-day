/**
 * Notifications Service
 *
 * Handles interactions with the backend notifications endpoints.
 * Matches the backend Notification interface from server/src/services/notifications/index.ts
 */

import { get, post, del } from "./api";

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
 * @param limit - Maximum number of notifications to return (default: 50)
 * @param includeRead - Whether to include read notifications (default: false)
 */
export async function getNotifications(
  limit = 50,
  includeRead = false
): Promise<Notification[]> {
  const response = await get<{ notifications: Notification[]; count: number }>(
    `/notifications?limit=${limit}&include_read=${includeRead}`
  );
  return response.ok ? response.data?.notifications ?? [] : [];
}

/**
 * Get the count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  const response = await get<{ unread_count: number }>("/notifications/count");
  return response.ok ? response.data?.unread_count ?? 0 : 0;
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
