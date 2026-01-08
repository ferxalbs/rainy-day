/**
 * Hook for managing task actions
 *
 * This hook provides state management and actions for task operations,
 * including creating, completing, and deleting tasks with optimistic updates.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { useState, useCallback } from "react";
import {
  createTask as createTaskService,
  completeTask as completeTaskService,
  deleteTask as deleteTaskService,
  updateTask as updateTaskService,
  type CreateTaskInput,
  type UpdateTaskInput,
  type ActionResult,
} from "../services/backend/actions";

export interface UseTaskActionsReturn {
  /** Create a new task */
  createTask: (input: CreateTaskInput) => Promise<ActionResult>;
  /** Mark a task as completed */
  completeTask: (taskId: string, listId?: string) => Promise<ActionResult>;
  /** Delete a task */
  deleteTask: (taskId: string, listId?: string) => Promise<ActionResult>;
  /** Update a task */
  updateTask: (taskId: string, updates: UpdateTaskInput) => Promise<ActionResult>;
  /** Whether an action is currently in progress */
  isLoading: boolean;
  /** The result of the last action */
  lastAction: ActionResult | null;
  /** Error message if the last action failed */
  error: string | null;
  /** Clear the last action and error state */
  clearState: () => void;
}

/**
 * Hook for managing task actions with optimistic updates
 *
 * Provides functions to create, complete, delete, and update tasks.
 * Handles loading states and error handling.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function useTaskActions(): UseTaskActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<ActionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear the state
   */
  const clearState = useCallback(() => {
    setLastAction(null);
    setError(null);
  }, []);

  /**
   * Create a new task
   * Requirements: 2.2
   */
  const createTask = useCallback(async (input: CreateTaskInput): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createTaskService(input);
      setLastAction(result);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      const failedResult: ActionResult = {
        success: false,
        action_id: "",
        message: errorMessage,
      };
      setLastAction(failedResult);
      return failedResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a task as completed
   * Requirements: 2.1
   */
  const completeTask = useCallback(
    async (taskId: string, listId?: string): Promise<ActionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await completeTaskService(taskId, listId);
        setLastAction(result);

        if (!result.success) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to complete task";
        setError(errorMessage);
        const failedResult: ActionResult = {
          success: false,
          action_id: "",
          message: errorMessage,
        };
        setLastAction(failedResult);
        return failedResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a task
   * Requirements: 2.1
   */
  const deleteTask = useCallback(
    async (taskId: string, listId?: string): Promise<ActionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await deleteTaskService(taskId, listId);
        setLastAction(result);

        if (!result.success) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
        setError(errorMessage);
        const failedResult: ActionResult = {
          success: false,
          action_id: "",
          message: errorMessage,
        };
        setLastAction(failedResult);
        return failedResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update a task
   * Requirements: 2.1
   */
  const updateTask = useCallback(
    async (taskId: string, updates: UpdateTaskInput): Promise<ActionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateTaskService(taskId, updates);
        setLastAction(result);

        if (!result.success) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update task";
        setError(errorMessage);
        const failedResult: ActionResult = {
          success: false,
          action_id: "",
          message: errorMessage,
        };
        setLastAction(failedResult);
        return failedResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createTask,
    completeTask,
    deleteTask,
    updateTask,
    isLoading,
    lastAction,
    error,
    clearState,
  };
}
