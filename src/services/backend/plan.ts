/**
 * Plan Service
 *
 * Handles interactions with the backend plan endpoints for AI-generated daily plans.
 * Matches the backend DailyPlan interface from server/src/services/ai/plan.ts
 */

import { get, post } from "./api";
import {
  cacheSet,
  cacheGetStale,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  isNetworkError,
  type CacheResult,
} from "./cache";

/**
 * A task item within the daily plan
 */
export interface PlanTask {
  id: string;
  title: string;
  type: "task" | "email" | "meeting" | "focus" | "break";
  priority: "high" | "medium" | "low";
  duration_minutes: number;
  suggested_time?: string;
  context?: string;
  source_id?: string;
  source_type?: "task" | "email" | "calendar";
}

/**
 * AI-generated daily plan structure
 */
export interface DailyPlan {
  date: string;
  summary: string;
  energy_tip?: string;
  focus_blocks: PlanTask[];
  quick_wins: PlanTask[];
  meetings: PlanTask[];
  defer_suggestions: (string | PlanTask)[];
  generated_at: number;
}

/**
 * Plan history item for listing past plans
 */
export interface PlanHistoryItem {
  id: string;
  date: string;
  suggestionCount: number;
  userRating?: number;
  createdAt: number;
}

/**
 * Get today's AI-generated plan
 * Returns null if no plan exists for today
 * Falls back to cached data on network errors
 */
export async function getTodayPlan(): Promise<DailyPlan | null> {
  try {
    const response = await get<{ plan: DailyPlan | null }>("/plan/today");
    if (response.ok && response.data?.plan) {
      // Cache successful response
      cacheSet(CACHE_KEYS.PLAN, response.data.plan, CACHE_EXPIRATION.PLAN);
      return response.data.plan;
    }
    return response.ok ? response.data?.plan ?? null : null;
  } catch (error) {
    // On network error, try to return cached data
    if (isNetworkError(error)) {
      const cached = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
      if (cached) {
        return cached.data;
      }
    }
    throw error;
  }
}

/**
 * Get today's plan with cache metadata
 * Useful for UI to show "cached" badge
 */
export async function getTodayPlanWithCache(): Promise<{
  plan: DailyPlan | null;
  fromCache: boolean;
  isStale: boolean;
  cachedAt?: number;
}> {
  try {
    const response = await get<{ plan: DailyPlan | null }>("/plan/today");
    if (response.ok && response.data?.plan) {
      cacheSet(CACHE_KEYS.PLAN, response.data.plan, CACHE_EXPIRATION.PLAN);
      return { plan: response.data.plan, fromCache: false, isStale: false };
    }
    return { plan: response.ok ? response.data?.plan ?? null : null, fromCache: false, isStale: false };
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
      if (cached) {
        return {
          plan: cached.data,
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
 * Get cached plan data (for offline indicator)
 */
export function getCachedPlan(): CacheResult<DailyPlan> | null {
  return cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
}

/**
 * Force regenerate the daily plan with updated context
 * This will create a new plan even if one already exists
 * Caches the new plan on success
 */
export async function regeneratePlan(): Promise<DailyPlan | null> {
  const response = await post<{ plan: DailyPlan }>("/plan/generate");
  if (response.ok && response.data?.plan) {
    cacheSet(CACHE_KEYS.PLAN, response.data.plan, CACHE_EXPIRATION.PLAN);
    return response.data.plan;
  }
  return response.ok ? response.data?.plan ?? null : null;
}

/**
 * Alias for regeneratePlan for backward compatibility
 */
export const generatePlan = regeneratePlan;

/**
 * Submit feedback for a plan
 * @param planId - The plan ID (or date string)
 * @param score - Rating score (1-5)
 * @param notes - Optional feedback notes
 */
export async function submitPlanFeedback(
  planId: string,
  score: number,
  notes?: string
): Promise<boolean> {
  const response = await post(`/plan/${planId}/feedback`, { 
    rating: score, 
    comment: notes 
  });
  return response.ok;
}

/**
 * Feedback type for plan items (thumbs up/down)
 */
export type ItemFeedbackType = "positive" | "negative";

/**
 * Submit feedback for a specific plan item (task, meeting, etc.)
 * This stores feedback as episodic memory for AI personalization
 * @param itemId - The item ID
 * @param itemTitle - The item title for context
 * @param feedbackType - "positive" (thumbs up) or "negative" (thumbs down)
 * @param itemType - The type of item (focus_block, quick_win, meeting, defer)
 */
export async function submitItemFeedback(
  _itemId: string,
  itemTitle: string,
  feedbackType: ItemFeedbackType,
  itemType: "focus_block" | "quick_win" | "meeting" | "defer"
): Promise<boolean> {
  // Calculate expiration: 30 days from now
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  
  const response = await post("/memory", {
    text: `User gave ${feedbackType} feedback on ${itemType}: "${itemTitle}"`,
    scope: "episodic",
    kind: "plan_feedback",
    source: "daily_plan",
    importance: feedbackType === "negative" ? 0.7 : 0.5,
    expires_at: expiresAt,
  });
  return response.ok;
}

/**
 * Get plan history
 */
export async function getPlanHistory(
  limit = 10
): Promise<PlanHistoryItem[] | null> {
  const response = await get<{ plans: PlanHistoryItem[] }>(
    `/plan/history?limit=${limit}`
  );
  return response.ok ? response.data?.plans ?? [] : null;
}
