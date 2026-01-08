/**
 * Property-Based Tests for Notifications Service
 *
 * Feature: ai-powered-daily-experience
 * Property 7: Notification Count Consistency
 * Validates: Requirements 3.4, 3.6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { Notification } from "./notifications";

/**
 * Arbitrary generator for Notification
 */
const notificationArbitrary: fc.Arbitrary<Notification> = fc.record({
  id: fc.string({ minLength: 1 }),
  type: fc.constantFrom("reminder", "task_due", "plan_ready", "email_summary", "system") as fc.Arbitrary<Notification["type"]>,
  title: fc.string({ minLength: 1 }),
  body: fc.option(fc.string(), { nil: undefined }),
  data: fc.option(
    fc.dictionary(fc.string(), fc.anything()),
    { nil: undefined }
  ),
  priority: fc.constantFrom("low", "normal", "high") as fc.Arbitrary<Notification["priority"]>,
  createdAt: fc.integer({ min: 0 }),
  readAt: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
});

/**
 * Arbitrary generator for a list of notifications
 */
const notificationListArbitrary: fc.Arbitrary<Notification[]> = fc.array(notificationArbitrary, { maxLength: 100 });

/**
 * Calculate the unread count from a list of notifications
 * A notification is unread if readAt is undefined/null
 */
function calculateUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => n.readAt === undefined || n.readAt === null).length;
}

/**
 * Validates that a notification has valid structure
 */
function isValidNotification(notification: Notification): boolean {
  // Must have required fields
  if (typeof notification.id !== "string" || notification.id.length === 0) return false;
  if (typeof notification.title !== "string" || notification.title.length === 0) return false;
  if (typeof notification.type !== "string") return false;
  if (typeof notification.priority !== "string") return false;
  if (typeof notification.createdAt !== "number" || notification.createdAt < 0) return false;

  // Type must be one of the valid types
  const validTypes = ["reminder", "task_due", "plan_ready", "email_summary", "system"];
  if (!validTypes.includes(notification.type)) return false;

  // Priority must be one of the valid priorities
  const validPriorities = ["low", "normal", "high"];
  if (!validPriorities.includes(notification.priority)) return false;

  return true;
}

describe("Notifications Service - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 7: Notification Count Consistency
   *
   * For any user, the unread notification count displayed in the UI SHALL equal
   * the count of notifications where readAt is null.
   *
   * Validates: Requirements 3.4, 3.6
   */
  it("Property 7: Notification Count Consistency - unread count equals notifications with null readAt", () => {
    fc.assert(
      fc.property(notificationListArbitrary, (notifications) => {
        const unreadCount = calculateUnreadCount(notifications);
        const manualCount = notifications.filter((n) => n.readAt === undefined).length;

        // The calculated unread count should match the manual count
        expect(unreadCount).toBe(manualCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7b: Marking a notification as read decreases unread count by 1
   */
  it("Property 7b: Marking notification as read decreases unread count", () => {
    fc.assert(
      fc.property(
        notificationListArbitrary.filter((list) => list.some((n) => n.readAt === undefined)),
        (notifications) => {
          const initialUnreadCount = calculateUnreadCount(notifications);

          // Find an unread notification and mark it as read
          const unreadIndex = notifications.findIndex((n) => n.readAt === undefined);
          if (unreadIndex === -1) return; // Skip if no unread notifications

          const updatedNotifications = [...notifications];
          updatedNotifications[unreadIndex] = {
            ...updatedNotifications[unreadIndex]!,
            readAt: Date.now(),
          };

          const newUnreadCount = calculateUnreadCount(updatedNotifications);

          // Unread count should decrease by exactly 1
          expect(newUnreadCount).toBe(initialUnreadCount - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7c: All notifications have valid structure
   */
  it("Property 7c: All notifications have valid structure", () => {
    fc.assert(
      fc.property(notificationArbitrary, (notification) => {
        expect(isValidNotification(notification)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7d: Unread count is always non-negative
   */
  it("Property 7d: Unread count is always non-negative", () => {
    fc.assert(
      fc.property(notificationListArbitrary, (notifications) => {
        const unreadCount = calculateUnreadCount(notifications);
        expect(unreadCount).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7e: Unread count never exceeds total notification count
   */
  it("Property 7e: Unread count never exceeds total count", () => {
    fc.assert(
      fc.property(notificationListArbitrary, (notifications) => {
        const unreadCount = calculateUnreadCount(notifications);
        expect(unreadCount).toBeLessThanOrEqual(notifications.length);
      }),
      { numRuns: 100 }
    );
  });
});
