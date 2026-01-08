/**
 * Hook for managing AI-generated daily plans
 *
 * This hook provides state management and actions for the daily plan feature,
 * including fetching, regenerating, and submitting feedback on plans.
 *
 * Requirements: 1.1, 1.2, 1.8
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTodayPlan,
  regeneratePlan,
  submitPlanFeedback,
  type DailyPlan,
} from "../services/backend/plan";

export interface UseDailyPlanReturn {
  /** The current daily plan, or null if not loaded */
  plan: DailyPlan | null;
  /** Whether the initial plan is being loaded */
  isLoading: boolean;
  /** Whether a new plan is being generated */
  isGenerating: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Regenerate the plan with updated context */
  regenerate: () => Promise<void>;
  /** Submit feedback for the current plan */
  submitFeedback: (score: number, notes?: string) => Promise<void>;
  /** Refresh the plan from the server */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing the AI-generated daily plan
 *
 * Automatically fetches the plan on mount and provides functions
 * to regenerate and submit feedback.
 */
export function useDailyPlan(): UseDailyPlanReturn {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch today's plan from the backend
   */
  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedPlan = await getTodayPlan();
      setPlan(fetchedPlan);
    } catch (err) {
      console.error("Failed to fetch daily plan:", err);
      setError("Failed to load daily plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Regenerate the plan with updated context
   * Requirements: 1.8
   */
  const regenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newPlan = await regeneratePlan();
      if (newPlan) {
        setPlan(newPlan);
      } else {
        setError("Failed to generate plan. Please try again.");
      }
    } catch (err) {
      console.error("Failed to regenerate plan:", err);
      setError("Failed to regenerate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Submit feedback for the current plan
   * Requirements: 5.1, 5.5
   */
  const submitFeedback = useCallback(
    async (score: number, notes?: string) => {
      if (!plan) {
        setError("No plan available to provide feedback for.");
        return;
      }

      try {
        const success = await submitPlanFeedback(plan.date, score, notes);
        if (!success) {
          setError("Failed to submit feedback. Please try again.");
        }
      } catch (err) {
        console.error("Failed to submit plan feedback:", err);
        setError("Failed to submit feedback. Please try again.");
      }
    },
    [plan]
  );

  // Auto-fetch plan on mount
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    isLoading,
    isGenerating,
    error,
    regenerate,
    submitFeedback,
    refresh: fetchPlan,
  };
}
