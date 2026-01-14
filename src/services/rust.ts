/**
 * Rust Performance Layer
 *
 * TypeScript bindings for high-performance Rust commands.
 * These provide faster client-side processing compared to JavaScript.
 *
 * @module services/rust
 * @since v0.6.0
 */

import { invoke } from "@tauri-apps/api/core";

// ============================================================================
// Cache Operations
// ============================================================================

export interface CacheStats {
    total_entries: number;
    expired_entries: number;
    active_entries: number;
}

/**
 * Get a value from the Rust cache
 * @param key Cache key
 * @returns Cached value or null if not found/expired
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const value = await invoke<string | null>("cache_get", { key });
        if (value) {
            return JSON.parse(value) as T;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Set a value in the Rust cache with TTL
 * @param key Cache key
 * @param value Value to cache (will be JSON stringified)
 * @param ttlSeconds Time-to-live in seconds (default: 300 = 5 minutes)
 */
export async function cacheSet<T>(
    key: string,
    value: T,
    ttlSeconds: number = 300
): Promise<void> {
    try {
        await invoke("cache_set", {
            key,
            value: JSON.stringify(value),
            ttlSeconds,
        });
    } catch (e) {
        console.warn("[RustCache] Failed to set cache:", e);
    }
}

/**
 * Remove a value from the cache
 * @param key Cache key
 */
export async function cacheRemove(key: string): Promise<void> {
    try {
        await invoke("cache_remove", { key });
    } catch {
        // Ignore errors
    }
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern Pattern to match (supports * for prefix matching)
 * @returns Number of entries removed
 */
export async function cacheInvalidate(pattern: string): Promise<number> {
    try {
        return await invoke<number>("cache_invalidate", { pattern });
    } catch {
        return 0;
    }
}

/**
 * Clear all cache entries
 */
export async function cacheClear(): Promise<void> {
    try {
        await invoke("cache_clear");
    } catch {
        // Ignore errors
    }
}

/**
 * Get cache statistics
 */
export async function cacheStats(): Promise<CacheStats> {
    try {
        return await invoke<CacheStats>("cache_stats");
    } catch {
        return { total_entries: 0, expired_entries: 0, active_entries: 0 };
    }
}

// ============================================================================
// Date/Time Formatting
// ============================================================================

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 * Uses Rust's chrono for fast, accurate calculation
 */
export async function formatRelativeTime(timestampMs: number): Promise<string> {
    try {
        return await invoke<string>("format_relative_time", { timestampMs });
    } catch {
        return "Unknown";
    }
}

/**
 * Format a timestamp for display (local time)
 * @param timestampMs Unix timestamp in milliseconds
 * @param format Optional strftime format (default: "%I:%M %p")
 */
export async function formatTime(
    timestampMs: number,
    format?: string
): Promise<string> {
    try {
        return await invoke<string>("format_time", { timestampMs, format });
    } catch {
        return "Unknown";
    }
}

/**
 * Format a date for display (local time)
 * @param timestampMs Unix timestamp in milliseconds
 * @param format Optional strftime format (default: "%B %d, %Y")
 */
export async function formatDate(
    timestampMs: number,
    format?: string
): Promise<string> {
    try {
        return await invoke<string>("format_date", { timestampMs, format });
    } catch {
        return "Unknown";
    }
}

/**
 * Get a greeting based on current time of day
 * @returns "Good morning", "Good afternoon", "Good evening", or "Good night"
 */
export async function getTimeGreeting(): Promise<string> {
    try {
        return await invoke<string>("get_time_greeting");
    } catch {
        return "Hello";
    }
}

/**
 * Check if a timestamp is today (in local timezone)
 */
export async function isToday(timestampMs: number): Promise<boolean> {
    try {
        return await invoke<boolean>("is_today", { timestampMs });
    } catch {
        return false;
    }
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 */
export async function getTodayDateString(): Promise<string> {
    try {
        return await invoke<string>("get_today_date_string");
    } catch {
        return new Date().toISOString().split("T")[0];
    }
}

// ============================================================================
// Priority Scoring
// ============================================================================

export interface PriorityInput {
    is_unread: boolean;
    age_hours: number;
    from_known_contact: boolean;
    has_urgent_keywords: boolean;
    recipient_count: number;
    is_direct: boolean;
    thread_size: number;
}

/**
 * Calculate email priority score (0.0 - 1.0)
 * Uses Rust for fast calculation
 */
export async function calculatePriorityScore(
    input: PriorityInput
): Promise<number> {
    try {
        return await invoke<number>("calculate_priority_score", { input });
    } catch {
        return 0.5;
    }
}

// ============================================================================
// Text Processing
// ============================================================================

/**
 * Clean and truncate a text snippet
 * Removes HTML tags and collapses whitespace
 */
export async function cleanSnippet(
    text: string,
    maxLength?: number
): Promise<string> {
    try {
        return await invoke<string>("clean_snippet", { text, maxLength });
    } catch {
        return text.slice(0, maxLength ?? 150);
    }
}

/**
 * Check if text contains urgent keywords
 */
export async function hasUrgentKeywords(text: string): Promise<boolean> {
    try {
        return await invoke<boolean>("has_urgent_keywords", { text });
    } catch {
        return false;
    }
}

// ============================================================================
// Batch Processing
// ============================================================================

export interface TaskInput {
    id: string;
    title: string;
    due_ms: number | null;
    completed: boolean;
}

export interface ProcessedTask {
    id: string;
    title: string;
    due_ms: number | null;
    completed: boolean;
    is_overdue: boolean;
    is_due_today: boolean;
    is_due_soon: boolean;
    relative_due: string | null;
}

/**
 * Batch process tasks for optimized display
 * Calculates overdue status, due today, due soon, etc.
 */
export async function batchProcessTasks(
    tasks: TaskInput[]
): Promise<ProcessedTask[]> {
    try {
        return await invoke<ProcessedTask[]>("batch_process_tasks", { tasks });
    } catch {
        // Fallback: return unprocessed
        return tasks.map((t) => ({
            ...t,
            is_overdue: false,
            is_due_today: false,
            is_due_soon: false,
            relative_due: null,
        }));
    }
}

// ============================================================================
// Email Processing (Parallelized with Rayon)
// ============================================================================

export interface EmailInput {
    id: string;
    subject: string;
    snippet: string;
    sender: string;
    timestamp_ms: number;
    is_unread: boolean;
    thread_size: number;
    is_direct: boolean;
}

export interface ProcessedEmail {
    id: string;
    subject: string;
    snippet: string;
    sender: string;
    timestamp_ms: number;
    is_unread: boolean;
    thread_size: number;
    priority_score: number;
    relative_time: string;
    has_urgent_keywords: boolean;
}

/**
 * Batch process emails for optimized display (Parallelized with Rayon)
 */
export async function batch_process_emails(
    emails: EmailInput[]
): Promise<ProcessedEmail[]> {
    try {
        return await invoke<ProcessedEmail[]>("batch_process_emails", { emails });
    } catch {
        // Fallback: return unprocessed
        return emails.map((e) => ({
            ...e,
            priority_score: 0.5,
            relative_time: new Date(e.timestamp_ms).toLocaleDateString(),
            has_urgent_keywords: false,
        }));
    }
}

// ============================================================================
// Search Operations (Regex Engine)
// ============================================================================

export interface SearchResult {
    matches: string[]; // List of IDs
    total_found: number;
}

/**
 * Search for tasks using Rust's regex engine
 */
export async function searchTasks(
    query: string,
    tasks: TaskInput[]
): Promise<SearchResult> {
    try {
        return await invoke<SearchResult>("search_tasks", { query, tasks });
    } catch {
        return { matches: [], total_found: 0 };
    }
}

/**
 * Search for emails using Rust's regex engine
 */
export async function searchEmails(
    query: string,
    emails: EmailInput[]
): Promise<SearchResult> {
    try {
        return await invoke<SearchResult>("search_emails", { query, emails });
    } catch {
        return { matches: [], total_found: 0 };
    }
}


// ============================================================================
// Utility: Cache-through pattern
// ============================================================================

/**
 * Get data with Rust cache fallback
 * 1. Try Rust cache first (sub-ms)
 * 2. If miss, call fetcher function
 * 3. Cache the result
 */
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
): Promise<T> {
    // 1. Try cache
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
        return cached;
    }

    // 2. Fetch fresh data
    const data = await fetcher();

    // 3. Cache for future use
    await cacheSet(key, data, ttlSeconds);

    return data;
}
