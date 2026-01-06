/**
 * Tasks service for Google Tasks CRUD operations
 */
import { invoke } from '@tauri-apps/api/core';
import type { TaskList, Task, NewTask, TaskUpdate } from '../types';

/**
 * Get all task lists for the user
 */
export async function getTaskLists(): Promise<TaskList[]> {
  try {
    return await invoke<TaskList[]>('get_task_lists');
  } catch (error) {
    console.error('Failed to get task lists:', error);
    throw error;
  }
}

/**
 * Get all tasks from a specific list
 */
export async function getTasks(
  listId: string,
  showCompleted: boolean = false
): Promise<Task[]> {
  try {
    return await invoke<Task[]>('get_tasks', {
      listId,
      showCompleted,
    });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    throw error;
  }
}

/**
 * Create a new task in a list
 */
export async function createTask(listId: string, task: NewTask): Promise<Task> {
  try {
    return await invoke<Task>('create_task', {
      listId,
      task,
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  listId: string,
  taskId: string,
  update: TaskUpdate
): Promise<Task> {
  try {
    return await invoke<Task>('update_task', {
      listId,
      taskId,
      update,
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
}

/**
 * Mark a task as completed
 */
export async function completeTask(listId: string, taskId: string): Promise<Task> {
  try {
    return await invoke<Task>('complete_task', {
      listId,
      taskId,
    });
  } catch (error) {
    console.error('Failed to complete task:', error);
    throw error;
  }
}

/**
 * Reopen a completed task
 */
export async function reopenTask(listId: string, taskId: string): Promise<Task> {
  try {
    return await invoke<Task>('reopen_task', {
      listId,
      taskId,
    });
  } catch (error) {
    console.error('Failed to reopen task:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  try {
    await invoke('delete_task', {
      listId,
      taskId,
    });
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
}
