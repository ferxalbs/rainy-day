/**
 * Property-Based Tests for Cache Service
 *
 * Feature: ai-powered-daily-experience
 * Property 13: Offline Fallback to Cache
 * Validates: Requirements 8.4
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import {
  cacheSet,
  cacheGet,
  cacheGetFresh,
  cacheGetStale,
  cacheRemove,
  cacheClearAll,
  CACHE_KEYS,
  CACHE_EXPIRATION,
} from "./cache";
import type { DailyPlan, PlanTask } from "./plan";
import type { Notification } from "./notifications";

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

// Set up localStorage mock before tests
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

/**
 * Arbitrary generator for PlanTask
 */
const planTaskArbitrary: fc.Arbitrary<PlanTask> = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  type: fc.constantFrom("task", "email", "meeting", "focus", "break") as fc.Arbitrary<PlanTask["type"]>,
  priority: fc.constantFrom("high", "medium", "low") as fc.Arbitrary<PlanTask["priority"]>,
  duration_minutes: fc.integer({ min: 1, max: 480 }),
  suggested_time: fc.option(fc.string(), { nil: undefined }),
  context: fc.option(fc.string(), { nil: undefined }),
  source_id: fc.option(fc.string(), { nil: undefined }),
  source_type: fc.option(
    fc.constantFrom("task", "email", "calendar") as fc.Arbitrary<"task" | "email" | "calendar">,
    { nil: undefined }
  ),
});

/**
 * Arbitrary generator for DailyPlan
 */
const dailyPlanArbitrary: fc.Arbitrary<DailyPlan> = fc.record({
  date: fc.constantFrom("2024-01-01", "2024-06-15", "2025-01-08", "2025-12-31"),
  summary: fc.string({ minLength: 1 }),
  energy_tip: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  focus_blocks: fc.array(planTaskArbitrary),
  quick_wins: fc.array(planTaskArbitrary),
  meetings: fc.array(planTaskArbitrary),
  defer_suggestions: fc.array(fc.string()),
  generated_at: fc.integer({ min: 0 }),
});

/**
 * Arbitrary generator for Notification
 */
const notificationArbitrary: fc.Arbitrary<Notification> = fc.record({
  id: fc.string({ minLength: 1 }),
  type: fc.constantFrom("reminder", "task_due", "plan_ready", "email_summary", "system") as fc.Arbitrary<Notification["type"]>,
  title: fc.string({ minLength: 1 }),
  body: fc.option(fc.string(), { nil: undefined }),
  data: fc.option(
    fc.dictionary(fc.string(), fc.jsonValue()),
    { nil: undefined }
  ),
  priority: fc.constantFrom("low", "normal", "high") as fc.Arbitrary<Notification["priority"]>,
  createdAt: fc.integer({ min: 0 }),
  readAt: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
});

/**
 * Arbitrary generator for cache key
 */
const cacheKeyArbitrary = fc.constantFrom(
  CACHE_KEYS.PLAN,
  CACHE_KEYS.NOTIFICATIONS,
  CACHE_KEYS.NOTIFICATION_COUNT,
  CACHE_KEYS.EMAILS,
  CACHE_KEYS.EVENTS,
  CACHE_KEYS.TASKS,
  CACHE_KEYS.SYNC_STATUS
);

/**
 * Arbitrary generator for expiration time
 */
const expirationArbitrary = fc.integer({ min: 1000, max: 3600000 }); // 1 second to 1 hour

describe("Cache Service - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 13: Offline Fallback to Cache
   *
   * For any API request that fails due to network error, the Frontend_App
   * SHALL return cached data if available, or display an offline indicator.
   *
   * Validates: Requirements 8.4
   */
  it("Property 13: Offline Fallback to Cache - cached data is retrievable after set", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, expirationArbitrary, (plan, expiration) => {
        // Set data in cache
        cacheSet(CACHE_KEYS.PLAN, plan, expiration);

        // Get data from cache
        const cached = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);

        // Cached data should be available
        expect(cached).not.toBeNull();
        expect(cached?.data).toEqual(plan);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13b: Fresh cache returns data within expiration window
   */
  it("Property 13b: Fresh cache returns data within expiration window", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, (plan) => {
        // Set data with long expiration
        cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);

        // Get fresh data (should not be stale)
        const fresh = cacheGetFresh<DailyPlan>(CACHE_KEYS.PLAN);

        // Fresh data should be available
        expect(fresh).not.toBeNull();
        expect(fresh).toEqual(plan);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13c: Stale cache still returns data for offline fallback
   */
  it("Property 13c: Stale cache still returns data for offline fallback", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, (plan) => {
        // Set data with very short expiration (1ms)
        cacheSet(CACHE_KEYS.PLAN, plan, 1);

        // Wait a bit to ensure expiration
        const start = Date.now();
        while (Date.now() - start < 5) {
          // busy wait
        }

        // Fresh should return null (expired)
        const fresh = cacheGetFresh<DailyPlan>(CACHE_KEYS.PLAN);
        expect(fresh).toBeNull();

        // Stale should still return data
        const stale = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
        expect(stale).not.toBeNull();
        expect(stale?.data).toEqual(plan);
        expect(stale?.isStale).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13d: Cache removal clears data
   */
  it("Property 13d: Cache removal clears data", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, (plan) => {
        // Set data
        cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);

        // Verify it's there
        expect(cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN)).not.toBeNull();

        // Remove it
        cacheRemove(CACHE_KEYS.PLAN);

        // Verify it's gone
        expect(cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13e: Notifications cache works correctly
   */
  it("Property 13e: Notifications cache works correctly", () => {
    fc.assert(
      fc.property(fc.array(notificationArbitrary, { maxLength: 50 }), (notifications) => {
        // Set notifications in cache
        cacheSet(CACHE_KEYS.NOTIFICATIONS, notifications, CACHE_EXPIRATION.NOTIFICATIONS);

        // Get from cache
        const cached = cacheGetStale<Notification[]>(CACHE_KEYS.NOTIFICATIONS);

        // Should match
        expect(cached).not.toBeNull();
        expect(cached?.data).toEqual(notifications);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13f: Cache clear all removes all entries
   */
  it("Property 13f: Cache clear all removes all entries", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, fc.array(notificationArbitrary), fc.integer(), (plan, notifications, count) => {
        // Set multiple cache entries
        cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);
        cacheSet(CACHE_KEYS.NOTIFICATIONS, notifications, CACHE_EXPIRATION.NOTIFICATIONS);
        cacheSet(CACHE_KEYS.NOTIFICATION_COUNT, count, CACHE_EXPIRATION.NOTIFICATION_COUNT);

        // Clear all
        cacheClearAll();

        // All should be null
        expect(cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN)).toBeNull();
        expect(cacheGetStale<Notification[]>(CACHE_KEYS.NOTIFICATIONS)).toBeNull();
        expect(cacheGetStale<number>(CACHE_KEYS.NOTIFICATION_COUNT)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13g: Cache metadata includes correct timestamps
   */
  it("Property 13g: Cache metadata includes correct timestamps", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, expirationArbitrary, (plan, expiration) => {
        const beforeSet = Date.now();
        cacheSet(CACHE_KEYS.PLAN, plan, expiration);
        const afterSet = Date.now();

        const cached = cacheGet<DailyPlan>(CACHE_KEYS.PLAN);

        expect(cached).not.toBeNull();
        // cachedAt should be between beforeSet and afterSet
        expect(cached!.cachedAt).toBeGreaterThanOrEqual(beforeSet);
        expect(cached!.cachedAt).toBeLessThanOrEqual(afterSet);
      }),
      { numRuns: 100 }
    );
  });
});
