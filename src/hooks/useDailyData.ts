import { useState, useEffect } from "react";
import { getTodayEvents } from "../services/calendar";
import { getInboxSummary } from "../services/gmail";
import { getTaskLists, getTasks } from "../services/tasks";
import type {
  ProcessedEvent,
  ThreadSummary,
  Task,
  TaskList,
} from "../types";

interface DailyDataState {
  events: ProcessedEvent[];
  threads: ThreadSummary[];
  tasks: Task[];
  taskLists: TaskList[];
  isLoading: boolean;
  error: string | null;
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

  const loadDailyData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [events, threads, taskLists] = await Promise.all([
        getTodayEvents().catch(() => []),
        getInboxSummary(10, "in:inbox is:unread").catch(() => []),
        getTaskLists().catch(() => []),
      ]);

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
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load daily data",
      }));
    }
  };

  useEffect(() => {
    loadDailyData();
  }, []);

  return {
    ...state,
    refresh: loadDailyData,
  };
}
