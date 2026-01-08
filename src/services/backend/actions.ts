/**
 * Actions Service
 *
 * Handles task, email, and calendar actions via the backend
 */

import { post, patch, del } from "./api";
import type { Task } from "./data";

export interface CreateTaskRequest {
  title: string;
  notes?: string;
  due_date?: string;
  task_list_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  notes?: string;
  due_date?: string;
  task_list_id?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new task
 */
export async function createTask(
  request: CreateTaskRequest
): Promise<ActionResult<Task>> {
  const response = await post<ActionResult<Task>>("/actions/tasks", request);
  return response.ok && response.data
    ? response.data
    : { success: false, error: response.error || "Failed to create task" };
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  request: UpdateTaskRequest
): Promise<ActionResult<Task>> {
  const response = await patch<ActionResult<Task>>(
    `/actions/tasks/${taskId}`,
    request
  );
  return response.ok && response.data
    ? response.data
    : { success: false, error: response.error || "Failed to update task" };
}

/**
 * Complete a task
 */
export async function completeTask(
  taskId: string,
  listId?: string
): Promise<ActionResult<Task>> {
  const url = listId
    ? `/actions/tasks/${taskId}/complete?list_id=${listId}`
    : `/actions/tasks/${taskId}/complete`;
  const response = await post<ActionResult<Task>>(url, {});
  return response.ok && response.data
    ? response.data
    : { success: false, error: response.error || "Failed to complete task" };
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
  return response.ok
    ? { success: true }
    : { success: false, error: response.error || "Failed to delete task" };
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
