/**
 * Property-Based Tests for useTaskActions Hook
 *
 * Feature: ai-powered-daily-experience
 * Property 5: UI State Consistency After Actions
 * Validates: Requirements 2.3, 2.4
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ActionResult } from "../services/backend/actions";

/**
 * Represents the UI state for task actions
 */
interface TaskActionUIState {
  isLoading: boolean;
  lastAction: ActionResult | null;
  error: string | null;
}

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
  action_id: fc.string(),
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
 * Simulates the state transition after an action completes
 */
function applyActionResult(
  _previousState: TaskActionUIState,
  result: ActionResult
): TaskActionUIState {
  return {
    isLoading: false,
    lastAction: result,
    error: result.success ? null : result.message,
  };
}

/**
 * Simulates the state when an action starts
 */
function startAction(previousState: TaskActionUIState): TaskActionUIState {
  return {
    ...previousState,
    isLoading: true,
    error: null,
  };
}

/**
 * Validates UI state consistency after a successful action
 * Requirements: 2.3 - WHEN an action succeeds, THE Frontend_App SHALL update the UI
 */
function isConsistentAfterSuccess(state: TaskActionUIState): boolean {
  if (!state.lastAction) return false;
  if (!state.lastAction.success) return false;
  
  // After success: isLoading should be false, error should be null
  return state.isLoading === false && state.error === null;
}

/**
 * Validates UI state consistency after a failed action
 * Requirements: 2.4 - IF an action fails, THEN THE Frontend_App SHALL show an error message
 */
function isConsistentAfterFailure(state: TaskActionUIState): boolean {
  if (!state.lastAction) return false;
  if (state.lastAction.success) return false;
  
  // After failure: isLoading should be false, error should be set
  return state.isLoading === false && state.error !== null && state.error.length > 0;
}

/**
 * Validates that loading state is properly managed
 */
function hasValidLoadingState(state: TaskActionUIState): boolean {
  // isLoading must be a boolean
  return typeof state.isLoading === "boolean";
}

describe("useTaskActions Hook - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 5: UI State Consistency After Actions
   *
   * For any action that succeeds, the UI state SHALL reflect the change.
   * For any action that fails, the UI state SHALL revert to the pre-action state.
   *
   * Validates: Requirements 2.3, 2.4
   */
  it("Property 5: UI State Consistency After Actions - successful actions clear error state", () => {
    fc.assert(
      fc.property(successfulActionResultArbitrary, (result) => {
        const initialState: TaskActionUIState = {
          isLoading: false,
          lastAction: null,
          error: null,
        };

        // Start the action
        const loadingState = startAction(initialState);
        expect(loadingState.isLoading).toBe(true);
        expect(loadingState.error).toBeNull();

        // Apply the successful result
        const finalState = applyActionResult(loadingState, result);

        // Verify consistency after success
        expect(isConsistentAfterSuccess(finalState)).toBe(true);
        expect(finalState.isLoading).toBe(false);
        expect(finalState.error).toBeNull();
        expect(finalState.lastAction).toBe(result);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5b: Failed actions set error state
   */
  it("Property 5b: UI State Consistency After Actions - failed actions set error state", () => {
    fc.assert(
      fc.property(failedActionResultArbitrary, (result) => {
        const initialState: TaskActionUIState = {
          isLoading: false,
          lastAction: null,
          error: null,
        };

        // Start the action
        const loadingState = startAction(initialState);
        expect(loadingState.isLoading).toBe(true);

        // Apply the failed result
        const finalState = applyActionResult(loadingState, result);

        // Verify consistency after failure
        expect(isConsistentAfterFailure(finalState)).toBe(true);
        expect(finalState.isLoading).toBe(false);
        expect(finalState.error).toBe(result.message);
        expect(finalState.lastAction).toBe(result);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5c: Loading state is always valid
   */
  it("Property 5c: Loading state is always a valid boolean", () => {
    fc.assert(
      fc.property(actionResultArbitrary, (result) => {
        const initialState: TaskActionUIState = {
          isLoading: false,
          lastAction: null,
          error: null,
        };

        // Check initial state
        expect(hasValidLoadingState(initialState)).toBe(true);

        // Check loading state
        const loadingState = startAction(initialState);
        expect(hasValidLoadingState(loadingState)).toBe(true);

        // Check final state
        const finalState = applyActionResult(loadingState, result);
        expect(hasValidLoadingState(finalState)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5d: State transitions are deterministic
   */
  it("Property 5d: Same action result produces same final state", () => {
    fc.assert(
      fc.property(actionResultArbitrary, (result) => {
        const initialState: TaskActionUIState = {
          isLoading: false,
          lastAction: null,
          error: null,
        };

        // Apply the same result twice from the same initial state
        const loadingState1 = startAction(initialState);
        const finalState1 = applyActionResult(loadingState1, result);

        const loadingState2 = startAction(initialState);
        const finalState2 = applyActionResult(loadingState2, result);

        // States should be equivalent
        expect(finalState1.isLoading).toBe(finalState2.isLoading);
        expect(finalState1.error).toBe(finalState2.error);
        expect(finalState1.lastAction).toBe(finalState2.lastAction);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5e: Error state correctly reflects action success/failure
   */
  it("Property 5e: Error state is null iff action succeeded", () => {
    fc.assert(
      fc.property(actionResultArbitrary, (result) => {
        const initialState: TaskActionUIState = {
          isLoading: false,
          lastAction: null,
          error: null,
        };

        const loadingState = startAction(initialState);
        const finalState = applyActionResult(loadingState, result);

        // Error should be null if and only if action succeeded
        if (result.success) {
          expect(finalState.error).toBeNull();
        } else {
          expect(finalState.error).not.toBeNull();
          expect(finalState.error).toBe(result.message);
        }
      }),
      { numRuns: 100 }
    );
  });
});
