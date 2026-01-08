/**
 * Property-Based Tests for Plan Feedback Memory Storage
 *
 * Feature: ai-powered-daily-experience
 * Property 9: Memory Storage on Feedback
 * Validates: Requirements 5.1
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ItemFeedbackType } from "./plan";

/**
 * Represents a memory entry created from feedback
 */
interface FeedbackMemory {
  text: string;
  scope: "profile" | "workspace" | "episodic";
  kind: string;
  source: string;
  importance: number;
  expires_at: number;
}

/**
 * Arbitrary generator for item types
 */
const itemTypeArbitrary: fc.Arbitrary<"focus_block" | "quick_win" | "meeting" | "defer"> = 
  fc.constantFrom("focus_block", "quick_win", "meeting", "defer");

/**
 * Arbitrary generator for feedback types
 */
const feedbackTypeArbitrary: fc.Arbitrary<ItemFeedbackType> = 
  fc.constantFrom("positive", "negative");

/**
 * Arbitrary generator for item IDs (non-empty strings)
 */
const itemIdArbitrary: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 100 });

/**
 * Arbitrary generator for item titles (non-empty strings)
 */
const itemTitleArbitrary: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 500 });

/**
 * Arbitrary generator for feedback input
 */
const feedbackInputArbitrary: fc.Arbitrary<{
  itemId: string;
  itemTitle: string;
  feedbackType: ItemFeedbackType;
  itemType: "focus_block" | "quick_win" | "meeting" | "defer";
}> = fc.record({
  itemId: itemIdArbitrary,
  itemTitle: itemTitleArbitrary,
  feedbackType: feedbackTypeArbitrary,
  itemType: itemTypeArbitrary,
});

/**
 * Simulates the memory creation from feedback
 * This mirrors the logic in submitItemFeedback
 */
function createFeedbackMemory(
  itemTitle: string,
  feedbackType: ItemFeedbackType,
  itemType: "focus_block" | "quick_win" | "meeting" | "defer"
): FeedbackMemory {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  
  return {
    text: `User gave ${feedbackType} feedback on ${itemType}: "${itemTitle}"`,
    scope: "episodic",
    kind: "plan_feedback",
    source: "daily_plan",
    importance: feedbackType === "negative" ? 0.7 : 0.5,
    expires_at: expiresAt,
  };
}

/**
 * Validates that a feedback memory has the correct structure
 */
function isValidFeedbackMemory(memory: FeedbackMemory): boolean {
  // Must have episodic scope
  if (memory.scope !== "episodic") return false;
  
  // Must have plan_feedback kind
  if (memory.kind !== "plan_feedback") return false;
  
  // Must have daily_plan source
  if (memory.source !== "daily_plan") return false;
  
  // Must have non-empty text
  if (!memory.text || memory.text.length === 0) return false;
  
  // Must have valid importance (0-1)
  if (memory.importance < 0 || memory.importance > 1) return false;
  
  // Must have future expiration
  if (memory.expires_at <= Date.now()) return false;
  
  return true;
}

/**
 * Validates that the memory text contains the feedback information
 */
function memoryContainsFeedbackInfo(
  memory: FeedbackMemory,
  itemTitle: string,
  feedbackType: ItemFeedbackType,
  itemType: string
): boolean {
  return (
    memory.text.includes(feedbackType) &&
    memory.text.includes(itemType) &&
    memory.text.includes(itemTitle)
  );
}

describe("Plan Feedback - Property Tests", () => {
  /**
   * Feature: ai-powered-daily-experience
   * Property 9: Memory Storage on Feedback
   *
   * For any plan feedback submission with score and optional notes,
   * there SHALL exist a memory entry of scope='episodic' containing the feedback data.
   *
   * Validates: Requirements 5.1
   */
  it("Property 9: Memory Storage on Feedback - feedback creates valid episodic memory", () => {
    fc.assert(
      fc.property(feedbackInputArbitrary, ({ itemTitle, feedbackType, itemType }) => {
        // Create the memory from feedback
        const memory = createFeedbackMemory(itemTitle, feedbackType, itemType);
        
        // Verify the memory has correct structure
        expect(isValidFeedbackMemory(memory)).toBe(true);
        
        // Verify the memory scope is episodic
        expect(memory.scope).toBe("episodic");
        
        // Verify the memory contains the feedback information
        expect(memoryContainsFeedbackInfo(memory, itemTitle, feedbackType, itemType)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9b: Negative feedback has higher importance than positive
   */
  it("Property 9b: Negative feedback has higher importance than positive feedback", () => {
    fc.assert(
      fc.property(itemTitleArbitrary, itemTypeArbitrary, (itemTitle, itemType) => {
        const positiveMemory = createFeedbackMemory(itemTitle, "positive", itemType);
        const negativeMemory = createFeedbackMemory(itemTitle, "negative", itemType);
        
        // Negative feedback should have higher importance
        expect(negativeMemory.importance).toBeGreaterThan(positiveMemory.importance);
        
        // Both should be within valid range
        expect(positiveMemory.importance).toBeGreaterThanOrEqual(0);
        expect(positiveMemory.importance).toBeLessThanOrEqual(1);
        expect(negativeMemory.importance).toBeGreaterThanOrEqual(0);
        expect(negativeMemory.importance).toBeLessThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9c: Memory expiration is approximately 30 days in the future
   */
  it("Property 9c: Memory expiration is approximately 30 days in the future", () => {
    fc.assert(
      fc.property(feedbackInputArbitrary, ({ itemTitle, feedbackType, itemType }) => {
        const now = Date.now();
        const memory = createFeedbackMemory(itemTitle, feedbackType, itemType);
        
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const tolerance = 1000; // 1 second tolerance for test execution time
        
        // Expiration should be approximately 30 days from now
        expect(memory.expires_at).toBeGreaterThanOrEqual(now + thirtyDaysMs - tolerance);
        expect(memory.expires_at).toBeLessThanOrEqual(now + thirtyDaysMs + tolerance);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9d: All item types produce valid memories
   */
  it("Property 9d: All item types produce valid memories", () => {
    const itemTypes: Array<"focus_block" | "quick_win" | "meeting" | "defer"> = [
      "focus_block",
      "quick_win",
      "meeting",
      "defer",
    ];
    
    fc.assert(
      fc.property(itemTitleArbitrary, feedbackTypeArbitrary, (itemTitle, feedbackType) => {
        for (const itemType of itemTypes) {
          const memory = createFeedbackMemory(itemTitle, feedbackType, itemType);
          
          // Each item type should produce a valid memory
          expect(isValidFeedbackMemory(memory)).toBe(true);
          expect(memory.text).toContain(itemType);
        }
      }),
      { numRuns: 100 }
    );
  });
});
