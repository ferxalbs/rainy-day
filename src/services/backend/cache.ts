/**
 * Cache Service
 *
 * Provides caching layer for API responses with expiration support.
 * Used for offline fallback when network requests fail.
 *
 * Feature: ai-powered-daily-experience
 * Validates: Requirements 8.4
 */

// Cache keys for different data types
export const CACHE_KEYS = {
  PLAN: "rainy_day_cache_plan",
  NOTIFICATIONS: "rainy_day_cache_notifications",
  NOTIFICATION_COUNT: "rainy_day_cache_notification_count",
  EMAILS: "rainy_day_cache_emails",
  EVENTS: "rainy_day_cache_events",
  TASKS: "rainy_day_cache_tasks",
  SYNC_STATUS: "rainy_day_cache_sync_status",
} as const;

// Cache expiration times in milliseconds
export const CACHE_EXPIRATION = {
  PLAN: 60 * 60 * 1000, // 1 hour
  NOTIFICATIONS: 5 * 60 * 1000, // 5 minutes
  NOTIFICATION_COUNT: 5 * 60 * 1000, // 5 minutes
  EMAILS: 15 * 60 * 1000, // 15 minutes
  EVENTS: 15 * 60 * 1000, // 15 minutes
  TASKS: 15 * 60 * 1000, // 15 minutes
  SYNC_STATUS: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Cached data wrapper with metadata
 */
export interface CachedData<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Cache entry with staleness info for UI display
 */
export interface CacheResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: number;
}

/**
 * Store data in cache with expiration
 */
export function cacheSet<T>(key: string, data: T, expirationMs: number): void {
  const cachedData: CachedData<T> = {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + expirationMs,
  };
  try {
    localStorage.setItem(key, JSON.stringify(cachedData));
  } catch (e) {
    console.warn("Failed to cache data:", e);
  }
}

/**
 * Get data from cache
 * Returns null if not found or expired
 */
export function cacheGet<T>(key: string): CacheResult<T> | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CachedData<T>;
    const now = Date.now();
    const isStale = now > parsed.expiresAt;

    return {
      data: parsed.data,
      isStale,
      cachedAt: parsed.cachedAt,
    };
  } catch (e) {
    console.warn("Failed to read cache:", e);
    return null;
  }
}

/**
 * Get cached data only if not expired
 */
export function cacheGetFresh<T>(key: string): T | null {
  const result = cacheGet<T>(key);
  if (!result || result.isStale) return null;
  return result.data;
}

/**
 * Get cached data even if stale (for offline fallback)
 */
export function cacheGetStale<T>(key: string): CacheResult<T> | null {
  return cacheGet<T>(key);
}

/**
 * Remove item from cache
 */
export function cacheRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Failed to remove cache:", e);
  }
}

/**
 * Clear all cache entries
 */
export function cacheClearAll(): void {
  Object.values(CACHE_KEYS).forEach((key) => {
    cacheRemove(key);
  });
}

/**
 * Check if we're currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  if (error instanceof Error && error.message.includes("network")) {
    return true;
  }
  return false;
}
