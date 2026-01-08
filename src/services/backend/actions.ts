/**
 * Actions Service
 *
 * Handles task, email, and calendar actions via the backend.
 * Matches the backend ActionResult interface from server/src/services/actions/tasks.ts
 */

import { post, patch, del } from "./api";
import type { Task } from "./data";

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  title: string;
  notes?: string;
  due_date?: string;
  task_list_id?: string;
}

/**
 * Input for updating an existing task
 */
export interface UpdateTaskInput {
  title?: string;
  notes?: string;
  due_date?: string;
  task_list_id?: string;
}

/**
 * Alias for backward compatibility
 */
export type CreateTaskRequest = CreateTaskInput;
export type UpdateTaskRequest = UpdateTaskInput;

/**
 * Result of an action execution
 * Matches backend ActionResult interface
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  action_id: string;
  message: string;
  data?: T;
}

/**
 * Create a new task in Google Tasks
 */
export async function createTask(
  input: CreateTaskInput
): Promise<ActionResult<Task>> {
  const response = await post<ActionResult<Task>>("/actions/tasks", input);
  if (response.ok && response.data) {
    return response.data;
  }
  return { 
    success: false, 
    action_id: "", 
    message: response.error || "Failed to create task" 
  };
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  updates: UpdateTaskInput
): Promise<ActionResult<Task>> {
  const response = await patch<ActionResult<Task>>(
    `/actions/tasks/${taskId}`,
    updates
  );
  if (response.ok && response.data) {
    return response.data;
  }
  return { 
    success: false, 
    action_id: "", 
    message: response.error || "Failed to update task" 
  };
}

/**
 * Mark a task as completed
 */
export async function completeTask(
  taskId: string,
  listId?: string
): Promise<ActionResult<Task>> {
  const url = listId
    ? `/actions/tasks/${taskId}/complete?list_id=${listId}`
    : `/actions/tasks/${taskId}/complete`;
  const response = await post<ActionResult<Task>>(url, {});
  if (response.ok && response.data) {
    return response.data;
  }
  return { 
    success: false, 
    action_id: "", 
    message: response.error || "Failed to complete task" 
  };
}

/**
 * Delete a task
 */
export async function deleteTask(
  taskId: string,
  listId?: string
): Promise<ActionResult> {
  const url = listId
    ? `/actions/tasks/${taskId}?list_id=${listId}`
    : `/actions/tasks/${taskId}`;
  const response = await del<ActionResult>(url);
  if (response.ok && response.data) {
    return response.data;
  }
  if (response.ok) {
    return { success: true, action_id: "", message: "Task deleted" };
  }
  return { 
    success: false, 
    action_id: "", 
    message: response.error || "Failed to delete task" 
  };
}

/**
 * Get action history
 */
export async function getActionHistory(
  limit = 50
): Promise<{ action_type: string; created_at: number }[]> {
  const response = await import("./api").then((api) =>
    api.get<{ history: { action_type: string; created_at: number }[] }>(
      `/actions/history?limit=${limit}`
    )
  );
  return response.ok ? response.data?.history ?? [] : [];
}
