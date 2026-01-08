/**
 * Type definitions for the application
 * 
 * These types are used throughout the frontend and are compatible
 * with both the backend HTTP API and legacy Tauri commands.
 */

// Auth types
export interface UserInfo {
  email: string;
  name: string | null;
  picture: string | null;
}

export interface AuthStatus {
  is_authenticated: boolean;
  user: UserInfo | null;
  expires_at: number | null;
}

// Gmail/Email types (backward compatible with Tauri types)
export interface ThreadSummary {
  id: string;
  subject: string;
  snippet: string;
  from_name: string;
  from_email: string;
  date: string;
  is_unread: boolean;
  message_count: number;
  priority_score: number;
}

export interface GmailThreadDetail {
  id: string;
  messages: GmailMessage[] | null;
}

export interface GmailMessage {
  id: string;
  thread_id: string;
  label_ids: string[] | null;
  snippet: string;
  payload: GmailPayload | null;
  internal_date: string | null;
}

export interface GmailPayload {
  headers: GmailHeader[] | null;
  mime_type: string | null;
}

export interface GmailHeader {
  name: string;
  value: string;
}

// Calendar types (backward compatible with Tauri types)
export interface ProcessedEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  attendees_count: number;
}

export interface CalendarEvent {
  id: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  start: EventDateTime | null;
  end: EventDateTime | null;
  attendees: EventAttendee[] | null;
  hangout_link: string | null;
  html_link: string | null;
  status: string | null;
}

export interface EventDateTime {
  date: string | null;
  date_time: string | null;
  time_zone: string | null;
}

export interface EventAttendee {
  email: string;
  display_name: string | null;
  response_status: string | null;
  is_self: boolean | null;
}

// Tasks types (backward compatible with Tauri types)
export interface TaskList {
  id: string;
  title: string;
  updated?: string | null;
  google_list_id?: string;
}

export interface Task {
  id: string | null;
  title: string;
  notes: string | null;
  status: string | null;
  due: string | null;
  completed?: string | null;
  updated?: string | null;
  parent?: string | null;
  position?: string | null;
  list_id?: string;
  google_task_id?: string;
}

export interface NewTask {
  title: string;
  notes: string | null;
  due: string | null;
}

export interface TaskUpdate {
  title: string | null;
  notes: string | null;
  status: string | null;
  due: string | null;
}

// Backend-specific types (re-exported from services)
export type {
  Email,
  CalendarEvent as BackendCalendarEvent,
  Task as BackendTask,
  TaskList as BackendTaskList,
} from "../services/backend/data";

export type { BackendUser } from "../services/backend/auth";
