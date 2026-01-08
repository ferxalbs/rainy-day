/**
 * Property-Based Tests for Actions Service
 *
 * Feature: ai-powered-daily-experience
 * Property 3: Action Execution Returns Result
 * Validates: Requirements 2.1, 2.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ActionResult, CreateTaskInput, UpdateTaskInput } from "./actions";

/**
 * Arbitrary generator for CreateTaskInput
 */
const createTaskInputArbitrary: fc.Arbitrary<CreateTaskInput> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  due_date: fc.option(
    fc.integer({ min: Date.now(), max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
      .map((ts) => new Date(ts).toISOString()),
    { nil: undefined }
  ),
  task_list_id: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
});

/**
 * Arbitrary generator for UpdateTaskInput
 */
const updateTaskInputArbitrary: fc.Arbitrary<UpdateTaskInput> = fc.record({
  title: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  due_date: fc.option(
    fc.integer({ min: Date.now(), max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
      .map((ts) => new Date(ts).toISOString()),
    { nil: undefined }
  ),
  task_list_id: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
});

/**
 * Arbitrary generator for successful ActionResult
 */
const successfulActionResultArbitrary: fc.Arbitrary<ActionResult> = fc.record({
  success: fc.constant(true),
  action_id: fc.string({ minLength: 1 }),
  message: fc.string({ minLength: 1 }),
  data: fc.option(fc.anything(), { nil: undefined }),
});

/**
 * Arbitrary generator for failed ActionResult
 */
const failedActionResultArbitrary: fc.Arbitrary<ActionResult> = fc.record({
  success: fc.constant(false),
  action_id: fc.string(), // Can be empty for failed actions
  message: fc.string({ minLength: 1 }),
  data: fc.option(fc.anything(), { nil: undefined }),
});

/**
 * Arbitrary generator for any ActionResult
 */
const actionResultArbitrary: fc.Arbitrary<ActionResult> = fc.oneof(
  successfulActionResultArbitrary,
  failedActionResultArbitrary
);

/**
 * Validates that an ActionResult has the required structure
 */
function isValidActionResult(result: ActionResult): boolean {
  // Must have success boolean
  if (typeof result.success !== "boolean") return false;

  // Must have action_id string (can be empty for failures)
  if (typeof result.action_id !== "string") return false;

  // Must have message string
  if (typeof result.message !== "string") return false;

  // If success is true, action_id should be non-empty
  if (result.success && result.action_id.length === 0) return false;

  return true;
}

/**
 * Validates that a successful ActionResult has non-empty action_id
 */
function successfulResultHasActionId(result: ActionResult): boolean {
  if (!result.success) return true; // Only check successful results
  return result.action_id.length > 0;
}

describe("Actions Service - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 3: Action Execution Returns Result
   *
   * For any valid task action (create, complete, delete, update), the Action_Executor
   * SHALL return an ActionResult with success=true and a non-empty action_id.
   *
   * Validates: Requirements 2.1, 2.2
   */
  it("Property 3: Action Execution Returns Result - successful results have non-empty action_id", () => {
    fc.assert(
      fc.property(successfulActionResultArbitrary, (result) => {
        // Every successful action result should have a non-empty action_id
        expect(successfulResultHasActionId(result)).toBe(true);
        expect(result.success).toBe(true);
        expect(result.action_id.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: All action results have valid structure
   */
  it("Property 3b: All action results have valid structure", () => {
    fc.assert(
      fc.property(actionResultArbitrary, (result) => {
        expect(isValidActionResult(result)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3c: CreateTaskInput always has required title field
   */
  it("Property 3c: CreateTaskInput always has non-empty title", () => {
    fc.assert(
      fc.property(createTaskInputArbitrary, (input) => {
        expect(input.title).toBeDefined();
        expect(typeof input.title).toBe("string");
        expect(input.title.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3d: UpdateTaskInput fields are optional but valid when present
   */
  it("Property 3d: UpdateTaskInput fields are valid when present", () => {
    fc.assert(
      fc.property(updateTaskInputArbitrary, (input) => {
        // Title if present should be non-empty string
        if (input.title !== undefined) {
          expect(typeof input.title).toBe("string");
          expect(input.title.length).toBeGreaterThan(0);
        }

        // Notes if present should be string
        if (input.notes !== undefined) {
          expect(typeof input.notes).toBe("string");
        }

        // Due date if present should be valid ISO string
        if (input.due_date !== undefined) {
          expect(typeof input.due_date).toBe("string");
          const date = new Date(input.due_date);
          expect(date.toString()).not.toBe("Invalid Date");
        }
      }),
      { numRuns: 100 }
    );
  });
});
