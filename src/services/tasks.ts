/**
 * @deprecated This file is deprecated. Use services from './backend/data' and './backend/actions' instead.
 * 
 * This file contained Tauri-based Tasks commands that have been
 * replaced by HTTP-based services through the backend server.
 * 
 * Migration guide:
 * - getTaskLists() -> getTaskLists() from './backend/data'
 * - getTasks() -> getTasks() from './backend/data'
 * - createTask() -> createTask() from './backend/actions'
 * - updateTask() -> updateTask() from './backend/actions'
 * - completeTask() -> completeTask() from './backend/actions'
 * - deleteTask() -> deleteTask() from './backend/actions'
 */

import { getTaskLists as backendGetTaskLists, getTasks as backendGetTasks, type Task as BackendTask, type TaskList as BackendTaskList } from './backend/data';
import { createTask as backendCreateTask, updateTask as backendUpdateTask, completeTask as backendCompleteTask, deleteTask as backendDeleteTask } from './backend/actions';
import type { TaskList, Task, NewTask, TaskUpdate } from '../types';

/**
 * Convert backend TaskList to legacy TaskList
 */
function toTaskList(list: BackendTaskList): TaskList {
  return {
    id: list.id,
    title: list.title,
    updated: null,
    google_list_id: list.google_list_id,
  };
}

/**
 * Convert backend Task to legacy Task
 */
function toTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    status: task.status,
    due: task.due,
    completed: null,
    updated: null,
    parent: null,
    position: null,
    list_id: task.list_id,
    google_task_id: task.google_task_id,
  };
}

/**
 * @deprecated Use getTaskLists() from './backend/data' instead
 */
export async function getTaskLists(): Promise<TaskList[]> {
  console.warn('getTaskLists from tasks.ts is deprecated. Use getTaskLists from backend/data instead.');
  
  const lists = await backendGetTaskLists();
  return lists.map(toTaskList);
}

/**
 * @deprecated Use getTasks() from './backend/data' instead
 */
export async function getTasks(
  listId: string,
  showCompleted: boolean = false
): Promise<Task[]> {
  console.warn('getTasks from tasks.ts is deprecated. Use getTasks from backend/data instead.');
  
  const tasks = await backendGetTasks(listId, showCompleted);
  return tasks.map(toTask);
}

/**
 * @deprecated Use createTask() from './backend/actions' instead
 */
export async function createTask(listId: string, task: NewTask): Promise<Task> {
  console.warn('createTask from tasks.ts is deprecated. Use createTask from backend/actions instead.');
  
  const result = await backendCreateTask({
    title: task.title,
    notes: task.notes ?? undefined,
    due_date: task.due ?? undefined,
    task_list_id: listId,
  });
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create task');
  }
  
  return toTask(result.data);
}

/**
 * @deprecated Use updateTask() from './backend/actions' instead
 */
export async function updateTask(
  _listId: string,
  taskId: string,
  update: TaskUpdate
): Promise<Task> {
  console.warn('updateTask from tasks.ts is deprecated. Use updateTask from backend/actions instead.');
  
  const result = await backendUpdateTask(taskId, {
    title: update.title ?? undefined,
    notes: update.notes ?? undefined,
    due_date: update.due ?? undefined,
  });
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to update task');
  }
  
  return toTask(result.data);
}

/**
 * @deprecated Use completeTask() from './backend/actions' instead
 */
export async function completeTask(listId: string, taskId: string): Promise<Task> {
  console.warn('completeTask from tasks.ts is deprecated. Use completeTask from backend/actions instead.');
  
  const result = await backendCompleteTask(taskId, listId);
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to complete task');
  }
  
  return toTask(result.data);
}

/**
 * @deprecated Use completeTask() with status update from './backend/actions' instead
 */
export async function reopenTask(_listId: string, taskId: string): Promise<Task> {
  console.warn('reopenTask from tasks.ts is deprecated. Use updateTask from backend/actions instead.');
  
  const result = await backendUpdateTask(taskId, {});
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to reopen task');
  }
  
  return toTask(result.data);
}

/**
 * @deprecated Use deleteTask() from './backend/actions' instead
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  console.warn('deleteTask from tasks.ts is deprecated. Use deleteTask from backend/actions instead.');
  
  const result = await backendDeleteTask(taskId, listId);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete task');
  }
}
