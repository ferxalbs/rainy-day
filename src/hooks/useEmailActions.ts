/**
 * Hook for managing email actions
 *
 * This hook provides state management and actions for email operations,
 * including archiving, marking as read, and converting to tasks with
 * per-email loading state tracking.
 *
 * Requirements: 1.3, 1.4, 2.3, 3.5, 5.1
 */

import { useState, useCallback, useRef } from "react";
import {
  archiveEmail as archiveEmailService,
  markEmailAsRead as markEmailAsReadService,
  convertEmailToTask as convertEmailToTaskService,
  type ConvertToTaskOptions,
  type ActionResult,
  type EmailActionData,
  type EmailToTaskData,
} from "../services/backend";

/**
 * Configuration for retry logic
 * Requirements: 1.3, 2.3, 3.5
 */
const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 1000,
  retryableErrors: [
    "network",
    "timeout",
    "rate limit",
    "429",
    "500",
    "502",
    "503",
    "504",
  ],
};

/**
 * Check if an error is retryable (transient)
 */
function isRetryableError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return RETRY_CONFIG.retryableErrors.some((err) => lowerMessage.includes(err));
}

/**
 * Convert technical error messages to user-friendly messages
 * Requirements: 1.3, 2.3, 3.5
 */
function getUserFriendlyErrorMessage(
  error: string,
  action: "archive" | "markRead" | "toTask"
): string {
  const lowerError = error.toLowerCase();

  // Network errors
  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection")
  ) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  // Authentication errors
  if (
    lowerError.includes("401") ||
    lowerError.includes("unauthorized") ||
    lowerError.includes("not authenticated")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  // Permission errors
  if (lowerError.includes("403") || lowerError.includes("forbidden")) {
    return "You don't have permission to perform this action.";
  }

  // Not found errors
  if (lowerError.includes("404") || lowerError.includes("not found")) {
    return "This email could not be found. It may have been deleted.";
  }

  // Rate limiting
  if (lowerError.includes("429") || lowerError.includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // Server errors
  if (
    lowerError.includes("500") ||
    lowerError.includes("502") ||
    lowerError.includes("503") ||
    lowerError.includes("504")
  ) {
    return "Server is temporarily unavailable. Please try again in a moment.";
  }

  // Google API specific errors
  if (lowerError.includes("not connected to google")) {
    return "Not connected to Google. Please reconnect your account.";
  }

  // Default messages by action type
  const defaultMessages = {
    archive: "Failed to archive email. Please try again.",
    markRead: "Failed to mark email as read. Please try again.",
    toTask: "Failed to create task from email. Please try again.",
  };

  return defaultMessages[action];
}

/**
 * Loading state for each email action type
 */
export interface EmailActionLoadingState {
  archive: boolean;
  markRead: boolean;
  toTask: boolean;
}

/**
 * Return type for the useEmailActions hook
 */
export interface UseEmailActionsReturn {
  /** Archive an email */
  archiveEmail: (emailId: string) => Promise<ActionResult<EmailActionData>>;
  /** Mark an email as read */
  markAsRead: (emailId: string) => Promise<ActionResult<EmailActionData>>;
  /** Convert email to task */
  convertToTask: (
    emailId: string,
    options?: ConvertToTaskOptions
  ) => Promise<ActionResult<EmailToTaskData>>;
  /** Loading states by email ID */
  loadingStates: Record<string, EmailActionLoadingState>;
  /** Clear loading state for an email */
  clearLoadingState: (emailId: string) => void;
  /** Error message if the last action failed */
  error: string | null;
  /** Clear error state */
  clearError: () => void;
  /** Retry the last failed action */
  retryLastAction: () => Promise<ActionResult<EmailActionData | EmailToTaskData> | null>;
}

/**
 * Default loading state for an email
 */
const defaultLoadingState: EmailActionLoadingState = {
  archive: false,
  markRead: false,
  toTask: false,
};

/**
 * Hook for managing email actions with per-email loading states
 *
 * Provides functions to archive emails, mark them as read, and convert
 * them to tasks. Tracks loading state per email ID to allow multiple
 * concurrent actions on different emails.
 *
 * Includes retry logic for transient errors and user-friendly error messages.
 *
 * Requirements: 1.3, 1.4, 2.3, 3.5, 5.1
 */
export function useEmailActions(): UseEmailActionsReturn {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, EmailActionLoadingState>
  >({});
  const [error, setError] = useState<string | null>(null);

  // Track last failed action for retry functionality
  const lastFailedAction = useRef<{
    type: "archive" | "markRead" | "toTask";
    emailId: string;
    options?: ConvertToTaskOptions;
  } | null>(null);

  /**
   * Get or create loading state for an email
   */
  const getLoadingState = useCallback(
    (emailId: string): EmailActionLoadingState => {
      return loadingStates[emailId] || defaultLoadingState;
    },
    [loadingStates]
  );

  /**
   * Update loading state for a specific email and action
   */
  const setActionLoading = useCallback(
    (
      emailId: string,
      action: keyof EmailActionLoadingState,
      isLoading: boolean
    ) => {
      setLoadingStates((prev) => ({
        ...prev,
        [emailId]: {
          ...getLoadingState(emailId),
          [action]: isLoading,
        },
      }));
    },
    [getLoadingState]
  );

  /**
   * Clear loading state for an email
   */
  const clearLoadingState = useCallback((emailId: string) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[emailId];
      return newState;
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Archive an email with retry logic for transient errors
   * Requirements: 1.3, 1.4
   */
  const archiveEmail = useCallback(
    async (emailId: string): Promise<ActionResult<EmailActionData>> => {
      setActionLoading(emailId, "archive", true);
      setError(null);
      lastFailedAction.current = null;

      let lastError: string = "";
      let retryCount = 0;

      while (retryCount <= RETRY_CONFIG.maxRetries) {
        try {
          const result = await archiveEmailService(emailId);

          if (result.success) {
            return result;
          }

          lastError = result.message;

          // Check if error is retryable
          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          // Non-retryable error or max retries reached
          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "archive");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "archive", emailId };
          return {
            success: false,
            action_id: result.action_id,
            message: friendlyMessage,
          };
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Failed to archive email";

          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "archive");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "archive", emailId };
          return {
            success: false,
            action_id: "",
            message: friendlyMessage,
          };
        }
      }

      // Should not reach here, but handle just in case
      const friendlyMessage = getUserFriendlyErrorMessage(lastError, "archive");
      setError(friendlyMessage);
      lastFailedAction.current = { type: "archive", emailId };
      return {
        success: false,
        action_id: "",
        message: friendlyMessage,
      };
    },
    [setActionLoading]
  );

  // Ensure loading state is cleared after archive completes
  const archiveEmailWithCleanup = useCallback(
    async (emailId: string): Promise<ActionResult<EmailActionData>> => {
      try {
        return await archiveEmail(emailId);
      } finally {
        setActionLoading(emailId, "archive", false);
      }
    },
    [archiveEmail, setActionLoading]
  );

  /**
   * Mark an email as read with retry logic for transient errors
   * Requirements: 1.4, 2.3
   */
  const markAsRead = useCallback(
    async (emailId: string): Promise<ActionResult<EmailActionData>> => {
      setActionLoading(emailId, "markRead", true);
      setError(null);
      lastFailedAction.current = null;

      let lastError: string = "";
      let retryCount = 0;

      while (retryCount <= RETRY_CONFIG.maxRetries) {
        try {
          const result = await markEmailAsReadService(emailId);

          if (result.success) {
            return result;
          }

          lastError = result.message;

          // Check if error is retryable
          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          // Non-retryable error or max retries reached
          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "markRead");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "markRead", emailId };
          return {
            success: false,
            action_id: result.action_id,
            message: friendlyMessage,
          };
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Failed to mark email as read";

          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "markRead");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "markRead", emailId };
          return {
            success: false,
            action_id: "",
            message: friendlyMessage,
          };
        }
      }

      const friendlyMessage = getUserFriendlyErrorMessage(lastError, "markRead");
      setError(friendlyMessage);
      lastFailedAction.current = { type: "markRead", emailId };
      return {
        success: false,
        action_id: "",
        message: friendlyMessage,
      };
    },
    [setActionLoading]
  );

  // Ensure loading state is cleared after markAsRead completes
  const markAsReadWithCleanup = useCallback(
    async (emailId: string): Promise<ActionResult<EmailActionData>> => {
      try {
        return await markAsRead(emailId);
      } finally {
        setActionLoading(emailId, "markRead", false);
      }
    },
    [markAsRead, setActionLoading]
  );

  /**
   * Convert an email to a task with retry logic for transient errors
   * Requirements: 1.4, 3.5
   */
  const convertToTask = useCallback(
    async (
      emailId: string,
      options?: ConvertToTaskOptions
    ): Promise<ActionResult<EmailToTaskData>> => {
      setActionLoading(emailId, "toTask", true);
      setError(null);
      lastFailedAction.current = null;

      let lastError: string = "";
      let retryCount = 0;

      while (retryCount <= RETRY_CONFIG.maxRetries) {
        try {
          const result = await convertEmailToTaskService(emailId, options);

          if (result.success) {
            return result;
          }

          lastError = result.message;

          // Check if error is retryable
          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          // Non-retryable error or max retries reached
          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "toTask");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "toTask", emailId, options };
          return {
            success: false,
            action_id: result.action_id,
            message: friendlyMessage,
          };
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Failed to convert email to task";

          if (isRetryableError(lastError) && retryCount < RETRY_CONFIG.maxRetries) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount - 1))
            );
            continue;
          }

          const friendlyMessage = getUserFriendlyErrorMessage(lastError, "toTask");
          setError(friendlyMessage);
          lastFailedAction.current = { type: "toTask", emailId, options };
          return {
            success: false,
            action_id: "",
            message: friendlyMessage,
          };
        }
      }

      const friendlyMessage = getUserFriendlyErrorMessage(lastError, "toTask");
      setError(friendlyMessage);
      lastFailedAction.current = { type: "toTask", emailId, options };
      return {
        success: false,
        action_id: "",
        message: friendlyMessage,
      };
    },
    [setActionLoading]
  );

  // Ensure loading state is cleared after convertToTask completes
  const convertToTaskWithCleanup = useCallback(
    async (
      emailId: string,
      options?: ConvertToTaskOptions
    ): Promise<ActionResult<EmailToTaskData>> => {
      try {
        return await convertToTask(emailId, options);
      } finally {
        setActionLoading(emailId, "toTask", false);
      }
    },
    [convertToTask, setActionLoading]
  );

  /**
   * Retry the last failed action
   * Requirements: 1.3, 2.3, 3.5
   */
  const retryLastAction = useCallback(async (): Promise<ActionResult<
    EmailActionData | EmailToTaskData
  > | null> => {
    if (!lastFailedAction.current) {
      return null;
    }

    const { type, emailId, options } = lastFailedAction.current;

    switch (type) {
      case "archive":
        return archiveEmailWithCleanup(emailId);
      case "markRead":
        return markAsReadWithCleanup(emailId);
      case "toTask":
        return convertToTaskWithCleanup(emailId, options);
      default:
        return null;
    }
  }, [archiveEmailWithCleanup, markAsReadWithCleanup, convertToTaskWithCleanup]);

  return {
    archiveEmail: archiveEmailWithCleanup,
    markAsRead: markAsReadWithCleanup,
    convertToTask: convertToTaskWithCleanup,
    loadingStates,
    clearLoadingState,
    error,
    clearError,
    retryLastAction,
  };
}
