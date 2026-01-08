/**
 * Plan Service
 *
 * Handles interactions with the backend plan endpoints for AI-generated daily plans.
 * Matches the backend DailyPlan interface from server/src/services/ai/plan.ts
 */

import { get, post } from "./api";

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
  defer_suggestions: string[];
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
 */
export async function getTodayPlan(): Promise<DailyPlan | null> {
  const response = await get<{ plan: DailyPlan | null }>("/plan/today");
  return response.ok ? response.data?.plan ?? null : null;
}

/**
 * Force regenerate the daily plan with updated context
 * This will create a new plan even if one already exists
 */
export async function regeneratePlan(): Promise<DailyPlan | null> {
  const response = await post<{ plan: DailyPlan }>("/plan/generate");
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
  itemId: string,
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
