/**
 * Plan Service
 *
 * Handles interactions with the backend plan endpoints for AI-generated daily plans.
 * Matches the backend DailyPlan interface from server/src/services/ai/plan.ts
 */

import { get, post, del } from "./api";
import {
  cacheSet,
  cacheGetStale,
  cacheRemove,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  isNetworkError,
  type CacheResult,
} from "./cache";

/**
 * Get today's date string in YYYY-MM-DD format
 * Used for validating cached plans are for today
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]!;
}

/**
 * Invalidate (clear) the plan cache
 * Call this when you need to ensure fresh data is fetched
 */
export function invalidatePlanCache(): void {
  console.log('[PlanService] Invalidating plan cache');
  cacheRemove(CACHE_KEYS.PLAN);
}

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

  // Productivity insights for smarter planning
  productivity_insights?: {
    estimated_focus_hours: number;
    meeting_load: 'light' | 'moderate' | 'heavy';
    suggested_breaks: { time: string; duration_minutes: number }[];
    batch_suggestions?: { category: string; task_ids: string[] }[];
    optimal_focus_window?: string;
  };

  // Quick stats for UI display
  stats?: {
    total_tasks: number;
    high_priority_count: number;
    estimated_minutes: number;
    emails_pending: number;
    completion_percentage: number;
  };
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
 * @param language - Language for AI to respond in ('en' or 'es')
 */
export async function getTodayPlan(language: 'en' | 'es' = 'en'): Promise<DailyPlan | null> {
  const today = getTodayDateString();

  try {
    const response = await get<{ plan: DailyPlan | null }>(`/plan/today?lang=${language}`);
    if (response.ok && response.data?.plan) {
      const plan = response.data.plan;
      // Only cache if plan is for today (avoid caching stale plans)
      if (plan.date === today) {
        cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);
      } else {
        console.warn('[PlanService] Received plan with mismatched date:', plan.date, 'expected:', today);
        // Clear stale cache if exists
        cacheRemove(CACHE_KEYS.PLAN);
      }
      return plan;
    }
    return response.ok ? response.data?.plan ?? null : null;
  } catch (error) {
    // On network error, try to return cached data only if it's for today
    if (isNetworkError(error)) {
      const cached = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
      if (cached && cached.data.date === today) {
        console.log('[PlanService] Using cached plan for today (offline fallback)');
        return cached.data;
      } else if (cached) {
        console.log('[PlanService] Cached plan is stale (wrong date), clearing');
        cacheRemove(CACHE_KEYS.PLAN);
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
  const today = getTodayDateString();

  try {
    const response = await get<{ plan: DailyPlan | null }>("/plan/today");
    if (response.ok && response.data?.plan) {
      const plan = response.data.plan;
      // Only cache if plan is for today
      if (plan.date === today) {
        cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);
      } else {
        cacheRemove(CACHE_KEYS.PLAN);
      }
      return { plan, fromCache: false, isStale: false };
    }
    return { plan: response.ok ? response.data?.plan ?? null : null, fromCache: false, isStale: false };
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = cacheGetStale<DailyPlan>(CACHE_KEYS.PLAN);
      // Only return cached data if it's for today
      if (cached && cached.data.date === today) {
        return {
          plan: cached.data,
          fromCache: true,
          isStale: cached.isStale,
          cachedAt: cached.cachedAt,
        };
      } else if (cached) {
        // Clear stale cache
        cacheRemove(CACHE_KEYS.PLAN);
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
 * @param language - Language for AI to respond in ('en' or 'es')
 */
export async function regeneratePlan(language: 'en' | 'es' = 'en'): Promise<DailyPlan | null> {
  const today = getTodayDateString();
  console.log('[PlanService] Calling /plan/generate...');

  // Clear old cache before regenerating to avoid stale data issues
  cacheRemove(CACHE_KEYS.PLAN);

  const response = await post<{ plan: DailyPlan; plan_id?: string; message?: string }>("/plan/generate", { lang: language });

  console.log('[PlanService] Response:', { ok: response.ok, hasPlan: !!response.data?.plan });

  if (response.ok && response.data?.plan) {
    const plan = response.data.plan;
    console.log('[PlanService] Plan received, caching...', { date: plan.date, summary: plan.summary?.substring(0, 50) });
    // Only cache if plan is for today
    if (plan.date === today) {
      cacheSet(CACHE_KEYS.PLAN, plan, CACHE_EXPIRATION.PLAN);
    }
    return plan;
  }

  console.error('[PlanService] Failed to get plan:', response.error);
  return null;
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

/**
 * Delete today's plan and clear cache
 * Allows user to generate a completely fresh plan
 */
export async function deleteTodayPlan(): Promise<boolean> {
  console.log('[PlanService] Deleting today\'s plan...');

  // Clear local cache first
  cacheRemove(CACHE_KEYS.PLAN);

  // Clear completed tasks storage for today
  const today = getTodayDateString();
  try {
    localStorage.removeItem(`plan_completed_${today}`);
  } catch (e) {
    console.warn('Failed to clear completed tasks:', e);
  }

  // Delete from backend
  const response = await del<{ deleted: boolean }>('/plan/today');

  if (response.ok) {
    console.log('[PlanService] Plan deleted successfully');
    return true;
  }

  console.error('[PlanService] Failed to delete plan:', response.error);
  return false;
}
