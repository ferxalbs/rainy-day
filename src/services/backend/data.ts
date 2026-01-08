/**
 * Data Service
 *
 * Fetches synced data from the backend (emails, events, tasks)
 */

import { get, post } from "./api";

// Types
export interface Email {
  id: string;
  gmail_id: string;
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: number;
  labels: string[];
  is_read: boolean;
  is_important: boolean;
}

export interface CalendarEvent {
  id: string;
  google_event_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  meeting_link: string | null;
}

export interface Task {
  id: string;
  google_task_id: string;
  list_id: string;
  title: string;
  notes: string | null;
  due: string | null;
  status: string;
}

export interface TaskList {
  id: string;
  google_list_id: string;
  title: string;
}

/**
 * Get emails from backend
 */
export async function getEmails(
  limit = 20,
  offset = 0
): Promise<Email[]> {
  const response = await get<{ emails: Email[] }>(
    `/data/emails?limit=${limit}&offset=${offset}`
  );
  return response.ok ? response.data?.emails ?? [] : [];
}

/**
 * Get calendar events from backend
 */
export async function getEvents(
  limit = 20,
  startDate?: string,
  endDate?: string
): Promise<CalendarEvent[]> {
  let url = `/data/events?limit=${limit}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  const response = await get<{ events: CalendarEvent[] }>(url);
  return response.ok ? response.data?.events ?? [] : [];
}

/**
 * Get today's events
 */
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getEvents(50, today.toISOString(), tomorrow.toISOString());
}

/**
 * Get tasks from backend
 */
export async function getTasks(
  listId?: string,
  showCompleted = false,
  limit = 50
): Promise<Task[]> {
  let url = `/data/tasks?limit=${limit}&show_completed=${showCompleted}`;
  if (listId) url += `&list_id=${listId}`;

  const response = await get<{ tasks: Task[] }>(url);
  return response.ok ? response.data?.tasks ?? [] : [];
}

/**
 * Get task lists from backend
 */
export async function getTaskLists(): Promise<TaskList[]> {
  const response = await get<{ lists: TaskList[] }>("/data/task-lists");
  return response.ok ? response.data?.lists ?? [] : [];
}

/**
 * Trigger data sync
 */
export async function triggerSync(
  source: "gmail" | "calendar" | "tasks" | "all" = "all"
): Promise<boolean> {
  const response = await post("/sync/trigger", { source });
  return response.ok;
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  gmail: { count: number; last_synced: number | null };
  calendar: { count: number; last_synced: number | null };
  tasks: { count: number; last_synced: number | null };
} | null> {
  const response = await get<{
    gmail: { count: number; last_synced: number | null };
    calendar: { count: number; last_synced: number | null };
    tasks: { count: number; last_synced: number | null };
  }>("/sync/status");
  return response.ok ? response.data ?? null : null;
}
