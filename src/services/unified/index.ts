/**
 * Unified Service Layer - v0.5.20
 *
 * Provides a single abstraction layer for all data operations,
 * routing between Rust commands (performance) and API calls (features).
 *
 * Benefits:
 * - Single import point for all services
 * - Automatic routing to best implementation
 * - Consistent error handling
 * - Type-safe interfaces
 *
 * @since v0.5.20
 */

import * as rustService from "../rust";
import * as backendNotes from "../backend/notes";
import * as backendPlan from "../backend/plan";

// ============================================================================
// Types
// ============================================================================

export interface UnifiedContext {
    userId?: string;
    useRust: boolean; // Prefer Rust for perf-critical ops
    useCache: boolean; // Use cached data when available
}

// ============================================================================
// Data Processing (Rust-first)
// ============================================================================

/**
 * Process tasks in batch using Rust parallel processing
 */
export async function batchProcessTasks(
    tasks: rustService.TaskInput[]
): Promise<rustService.ProcessedTask[]> {
    return rustService.batchProcessTasks(tasks);
}

/**
 * Process emails in batch using Rust parallel processing
 */
export async function batchProcessEmails(
    emails: rustService.EmailInput[]
): Promise<rustService.ProcessedEmail[]> {
    return rustService.batch_process_emails(emails);
}

/**
 * Format relative time using Rust
 */
export async function formatRelativeTime(timestampMs: number): Promise<string> {
    return rustService.formatRelativeTime(timestampMs);
}

/**
 * Clean text snippet using Rust
 */
export async function cleanSnippet(
    text: string,
    maxLength?: number
): Promise<string> {
    return rustService.cleanSnippet(text, maxLength);
}

/**
 * Calculate priority score using Rust
 */
export async function calculatePriorityScore(
    input: rustService.PriorityInput
): Promise<number> {
    return rustService.calculatePriorityScore(input);
}

// ============================================================================
// Note AI (API-first with Rust data pipeline)
// ============================================================================

export interface NoteGenerationOptions {
    forceRegenerate?: boolean;
}

/**
 * Get or generate today's note
 * Uses Rust data pipeline for context preparation
 */
export async function getTodaysNote(
    options: NoteGenerationOptions = {}
): Promise<backendNotes.DailyNote | null> {
    if (options.forceRegenerate) {
        return backendNotes.regenerateNote();
    }
    return backendNotes.getTodaysNote();
}

/**
 * Expand a note paragraph with AI
 */
export async function expandNoteParagraph(params: {
    noteId: string;
    sectionId: string;
    paragraphIndex: number;
    prompt: string;
    content: string;
}): Promise<string | null> {
    return backendNotes.expandParagraph(params);
}

/**
 * Get note usage stats
 */
export async function getNoteUsageStats(): Promise<backendNotes.UsageStats | null> {
    return backendNotes.getUsageStats();
}

// Re-export note types
export type { DailyNote, NoteSection, UsageStats } from "../backend/notes";

// ============================================================================
// Plan (API with caching)
// ============================================================================

/**
 * Get today's plan with cache support
 */
export async function getTodaysPlan(): Promise<{
    plan: backendPlan.DailyPlan | null;
    fromCache: boolean;
    isStale: boolean;
}> {
    return backendPlan.getTodayPlanWithCache();
}

/**
 * Regenerate today's plan
 */
export async function regeneratePlan(
    language: "en" | "es" = "en"
): Promise<backendPlan.DailyPlan | null> {
    return backendPlan.regeneratePlan(language);
}

// Re-export plan types
export type { DailyPlan, PlanTask } from "../backend/plan";

// ============================================================================
// Cache Operations (Rust)
// ============================================================================

/**
 * Get cached value
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    return rustService.cacheGet<T>(key);
}

/**
 * Set cached value
 */
export async function cacheSet<T>(
    key: string,
    value: T,
    ttlSeconds?: number
): Promise<void> {
    return rustService.cacheSet(key, value, ttlSeconds);
}

/**
 * Clear cached value
 */
export async function cacheClear(): Promise<void> {
    return rustService.cacheClear();
}

// ============================================================================
// Unified Export
// ============================================================================

export const unified = {
    // Data processing
    batchProcessTasks,
    batchProcessEmails,
    formatRelativeTime,
    cleanSnippet,
    calculatePriorityScore,

    // Note AI
    getTodaysNote,
    expandNoteParagraph,
    getNoteUsageStats,

    // Plan
    getTodaysPlan,
    regeneratePlan,

    // Cache
    cacheGet,
    cacheSet,
    cacheClear,
};

export default unified;
