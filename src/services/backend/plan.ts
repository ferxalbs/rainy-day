/**
 * Plan Service
 *
 * Handles interactions with the backend plan endpoints.
 */

import { get, post } from "./api";

// Types
export interface PlanSuggestion {
  id: string;
  type: "email" | "calendar" | "task" | "other";
  priority: number;
  title: string;
  description: string;
  estimatedMinutes?: number;
  sourceId?: string;
  dueAt?: string;
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  greeting: string;
  summary: string;
  suggestions: PlanSuggestion[];
  focusAreas: string[];
  createdAt: number;
  userFeedback?: {
    rating: number;
    comment?: string;
  };
}

export interface PlanHistoryItem {
  id: string;
  date: string;
  suggestionCount: number;
  userRating?: number;
  createdAt: number;
}

/**
 * Get today's plan
 */
export async function getTodayPlan(): Promise<DailyPlan | null> {
  const response = await get<{ plan: DailyPlan | null }>("/plan/today");
  return response.ok ? response.data?.plan ?? null : null;
}

/**
 * Generate a new plan for today
 */
export async function generatePlan(): Promise<DailyPlan | null> {
  const response = await post<{ plan: DailyPlan }>("/plan/generate");
  return response.ok ? response.data?.plan ?? null : null;
}

/**
 * Submit feedback for a plan
 */
export async function submitPlanFeedback(
  planId: string,
  rating: number,
  comment?: string
): Promise<boolean> {
  const response = await post(`/plan/${planId}/feedback`, { rating, comment });
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
 * Trigger data sync (emails, calendar, tasks)
 */
export async function triggerSync(): Promise<boolean> {
  const response = await post("/sync/trigger");
  return response.ok;
}
