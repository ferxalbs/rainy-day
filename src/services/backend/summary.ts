/**
 * Email Summary Service
 *
 * Handles interactions with the backend summary endpoints for AI-generated email summaries.
 */

import { get, post, del } from "./api";
import {
    cacheSet,
    cacheGet,
    cacheGetStale,
    isNetworkError,
} from "./cache";

// =============================================================================
// Types
// =============================================================================

export interface ActionItem {
    action: string;
    dueDate?: string;
    priority: "high" | "medium" | "low";
}

export interface KeyEntities {
    people: string[];
    companies: string[];
    dates: string[];
    amounts: string[];
}

export interface EmailSummary {
    summary: string;
    priorityScore: number;
    sentiment: "urgent" | "friendly" | "formal" | "frustrated" | "neutral";
    sentimentEmoji: string;
    actionItems: ActionItem[];
    keyEntities: KeyEntities;
    suggestedReplies: string[];
    relatedTaskIds: string[];
    relatedEventIds: string[];
    isThreadSummary: boolean;
    modelUsed: string;
    cached?: boolean;
    wasDowngraded?: boolean;
}

export interface SummaryLimits {
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
}

export interface SummaryHistoryItem {
    id: string;
    emailId: string;
    summary: string;
    priorityScore: number;
    sentiment: EmailSummary["sentiment"];
    sentimentEmoji: string;
    createdAt: number;
}

// Cache key prefix for summaries
const SUMMARY_CACHE_PREFIX = "email_summary_";

// =============================================================================
// Summary Operations
// =============================================================================

/**
 * Get cached summary from localStorage
 */
function getCachedSummary(emailId: string): EmailSummary | null {
    const cached = cacheGet<EmailSummary>(`${SUMMARY_CACHE_PREFIX}${emailId}`);
    return cached?.data ?? null;
}

/**
 * Cache summary to localStorage (1 hour expiry)
 */
function cacheSummary(emailId: string, summary: EmailSummary): void {
    cacheSet(
        `${SUMMARY_CACHE_PREFIX}${emailId}`,
        summary,
        60 * 60 * 1000 // 1 hour cache
    );
}

/**
 * Get summary for an email (uses cache first)
 */
export async function getEmailSummary(
    emailId: string
): Promise<EmailSummary | null> {
    // Check local cache first
    const cached = getCachedSummary(emailId);
    if (cached) {
        console.log("[SummaryService] Using local cached summary for", emailId);
        return { ...cached, cached: true };
    }

    try {
        const response = await get<{ summary: EmailSummary | null; cached: boolean }>(
            `/summary/email/${emailId}`
        );

        if (response.ok && response.data?.summary) {
            const summary = { ...response.data.summary, cached: response.data.cached };
            cacheSummary(emailId, summary);
            return summary;
        }

        return null;
    } catch (error) {
        if (isNetworkError(error)) {
            const stale = cacheGetStale<EmailSummary>(`${SUMMARY_CACHE_PREFIX}${emailId}`);
            if (stale) {
                return { ...stale.data, cached: true };
            }
        }
        throw error;
    }
}

/**
 * Generate a new summary for an email
 */
export async function generateEmailSummary(
    emailId: string,
    options?: { forceRegenerate?: boolean }
): Promise<{
    summary: EmailSummary;
    limits: SummaryLimits;
} | null> {
    try {
        const response = await post<{
            summary: EmailSummary;
            limits: SummaryLimits;
        }>(`/summary/email/${emailId}`, {
            force_regenerate: options?.forceRegenerate ?? false,
            include_thread: true,
        });

        if (response.ok && response.data?.summary) {
            cacheSummary(emailId, response.data.summary);
            return {
                summary: response.data.summary,
                limits: response.data.limits,
            };
        }

        // Handle error responses
        if (!response.ok) {
            const error = response.error as { message?: string } | undefined;
            throw new Error(error?.message || "Failed to generate summary");
        }

        return null;
    } catch (error) {
        console.error("[SummaryService] Generate error:", error);
        throw error;
    }
}

/**
 * Get summary usage limits
 */
export async function getSummaryLimits(): Promise<SummaryLimits | null> {
    try {
        const response = await get<SummaryLimits>("/summary/limits");
        return response.ok ? response.data ?? null : null;
    } catch (error) {
        console.error("[SummaryService] Limits error:", error);
        return null;
    }
}

/**
 * Get recent summary history
 */
export async function getSummaryHistory(
    limit = 10
): Promise<SummaryHistoryItem[]> {
    try {
        const response = await get<{ summaries: SummaryHistoryItem[] }>(
            `/summary/history?limit=${limit}`
        );
        return response.ok ? response.data?.summaries ?? [] : [];
    } catch (error) {
        console.error("[SummaryService] History error:", error);
        return [];
    }
}

/**
 * Delete a cached summary
 */
export async function deleteSummary(emailId: string): Promise<boolean> {
    try {
        const response = await del<{ success: boolean }>(`/summary/email/${emailId}`);
        if (response.ok) {
            // Clear local cache too
            localStorage.removeItem(`${SUMMARY_CACHE_PREFIX}${emailId}`);
        }
        return response.ok;
    } catch (error) {
        console.error("[SummaryService] Delete error:", error);
        return false;
    }
}

/**
 * Clear all cached summaries from localStorage
 */
export function clearCachedSummaries(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(SUMMARY_CACHE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get priority color based on score
 */
export function getPriorityColor(score: number): string {
    if (score >= 9) return "text-red-500"; // Critical
    if (score >= 7) return "text-orange-500"; // High
    if (score >= 5) return "text-yellow-500"; // Medium
    if (score >= 3) return "text-blue-500"; // Low
    return "text-gray-500"; // Very low
}

/**
 * Get priority label based on score
 */
export function getPriorityLabel(score: number): string {
    if (score >= 9) return "Critical";
    if (score >= 7) return "High";
    if (score >= 5) return "Medium";
    if (score >= 3) return "Low";
    return "Very Low";
}

/**
 * Get sentiment color
 */
export function getSentimentColor(
    sentiment: EmailSummary["sentiment"]
): string {
    switch (sentiment) {
        case "urgent":
            return "text-red-500 bg-red-500/10";
        case "friendly":
            return "text-green-500 bg-green-500/10";
        case "formal":
            return "text-blue-500 bg-blue-500/10";
        case "frustrated":
            return "text-orange-500 bg-orange-500/10";
        default:
            return "text-gray-500 bg-gray-500/10";
    }
}
