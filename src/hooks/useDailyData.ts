/**
 * Hook for loading daily data from the backend
 * 
 * This hook fetches events, emails, and tasks from the HTTP backend
 * and provides a unified interface for components to consume.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTodayEvents,
  getEmails,
  getTasks,
  getTaskLists,
  triggerSync,
  type CalendarEvent,
  type Email,
  type Task,
  type TaskList,
} from "../services/backend/data";

// Re-export types for convenience
export type { CalendarEvent, Email, Task, TaskList };

// Mapped types for backward compatibility with old components
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

export interface ProcessedEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  attendees_count: number;
}

interface DailyDataState {
  events: ProcessedEvent[];
  threads: ThreadSummary[];
  tasks: Task[];
  taskLists: TaskList[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Convert backend Email to ThreadSummary for backward compatibility
 */
function emailToThread(email: Email): ThreadSummary {
  return {
    id: email.id,
    subject: email.subject,
    snippet: email.snippet,
    from_name: email.sender.split("<")[0]?.trim() || email.sender,
    from_email: email.sender.match(/<(.+)>/)?.[1] || email.sender,
    date: new Date(email.received_at).toISOString(),
    is_unread: !email.is_read,
    message_count: 1,
    priority_score: email.is_important ? 100 : 50,
  };
}

/**
 * Convert backend CalendarEvent to ProcessedEvent for backward compatibility
 */
function calendarEventToProcessed(event: CalendarEvent): ProcessedEvent {
  return {
    id: event.id,
    title: event.title,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    meeting_link: event.meeting_link,
    attendees_count: 0,
  };
}

export function useDailyData() {
  const [state, setState] = useState<DailyDataState>({
    events: [],
    threads: [],
    tasks: [],
    taskLists: [],
    isLoading: true,
    error: null,
  });

  const loadDailyData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Trigger sync in background (don't wait for it)
      triggerSync("all").catch(() => {});

      const [calendarEvents, emails, taskLists] = await Promise.all([
        getTodayEvents().catch(() => []),
        getEmails(10).catch(() => []),
        getTaskLists().catch(() => []),
      ]);

      // Convert to backward-compatible types
      const events = calendarEvents.map(calendarEventToProcessed);
      const threads = emails.map(emailToThread);

      // Get tasks from the first task list
      let tasks: Task[] = [];
      if (taskLists.length > 0) {
        tasks = await getTasks(taskLists[0].id, false).catch(() => []);
      }

      setState({
        events,
        threads,
        tasks,
        taskLists,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to load daily data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load daily data. Please check your connection.",
      }));
    }
  }, []);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  return {
    ...state,
    refresh: loadDailyData,
  };
}
