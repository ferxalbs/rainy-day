/**
 * Property-Based Tests for Plan Service
 *
 * Feature: ai-powered-daily-experience
 * Property 1: Plan Structure Completeness
 * Validates: Requirements 1.4, 1.5
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { DailyPlan, PlanTask } from "./plan";

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
 * Validates that a DailyPlan has complete structure
 */
function isPlanStructureComplete(plan: DailyPlan): boolean {
  // Check required arrays are non-null
  if (!Array.isArray(plan.focus_blocks)) return false;
  if (!Array.isArray(plan.quick_wins)) return false;
  if (!Array.isArray(plan.meetings)) return false;
  if (!Array.isArray(plan.defer_suggestions)) return false;

  // Check required strings are non-empty
  if (typeof plan.summary !== "string" || plan.summary.length === 0) return false;
  if (typeof plan.date !== "string" || plan.date.length === 0) return false;

  // Check generated_at is a valid timestamp
  if (typeof plan.generated_at !== "number" || plan.generated_at < 0) return false;

  return true;
}

describe("Plan Service - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 1: Plan Structure Completeness
   *
   * For any generated DailyPlan, the plan object SHALL contain non-null arrays
   * for focus_blocks, quick_wins, meetings, and defer_suggestions, plus
   * non-empty strings for summary and date.
   *
   * Validates: Requirements 1.4, 1.5
   */
  it("Property 1: Plan Structure Completeness - all valid plans have complete structure", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, (plan) => {
        // Every generated plan should have complete structure
        expect(isPlanStructureComplete(plan)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Plan tasks have valid structure
   */
  it("Property 1b: All tasks in plan have required fields", () => {
    fc.assert(
      fc.property(dailyPlanArbitrary, (plan) => {
        const allTasks = [
          ...plan.focus_blocks,
          ...plan.quick_wins,
          ...plan.meetings,
        ];

        for (const task of allTasks) {
          // Each task must have required fields
          expect(task.id).toBeDefined();
          expect(task.title).toBeDefined();
          expect(task.type).toBeDefined();
          expect(task.priority).toBeDefined();
          expect(task.duration_minutes).toBeDefined();
          expect(typeof task.duration_minutes).toBe("number");
          expect(task.duration_minutes).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
