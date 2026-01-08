import { useState, useEffect } from "react";
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
} from "../../services/backend/data";
import "./DailyPlan.css";

interface DailyPlanState {
  events: CalendarEvent[];
  emails: Email[];
  tasks: Task[];
  taskLists: TaskList[];
  isLoading: boolean;
  error: string | null;
}

export function DailyPlan() {
  const [state, setState] = useState<DailyPlanState>({
    events: [],
    emails: [],
    tasks: [],
    taskLists: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadDailyPlan();
  }, []);

  const loadDailyPlan = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // First trigger a sync to get fresh data
      await triggerSync("all").catch(() => {});

      // Wait a moment for sync to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const [events, emails, taskLists] = await Promise.all([
        getTodayEvents().catch(() => []),
        getEmails(10).catch(() => []),
        getTaskLists().catch(() => []),
      ]);

      // Get tasks from the first task list
      let tasks: Task[] = [];
      if (taskLists.length > 0) {
        tasks = await getTasks(taskLists[0].id, false).catch(() => []);
      }

      setState({
        events,
        emails,
        tasks,
        taskLists,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load daily plan",
      }));
    }
  };

  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (state.isLoading) {
    return (
      <div className="daily-plan loading">
        <div className="loading-spinner" />
        <p>Loading your daily plan...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="daily-plan error">
        <p>{state.error}</p>
        <button onClick={loadDailyPlan}>Retry</button>
      </div>
    );
  }

  return (
    <div className="daily-plan">
      <header className="plan-header titlebar-drag-region">
        <div className="greeting no-drag">
          <h1>{getGreeting()}</h1>
          <p className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button className="refresh-btn no-drag" onClick={loadDailyPlan}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 11-2.2-5.9M21 4v4h-4" />
          </svg>
        </button>
      </header>

      <main className="plan-content">
        {/* Agenda Block */}
        <section className="plan-block glass">
          <h2 className="block-title">
            <span className="block-icon">📅</span>
            Today's Agenda
          </h2>
          {state.events.length === 0 ? (
            <p className="empty-state">No events scheduled for today</p>
          ) : (
            <ul className="event-list">
              {state.events.map((event) => (
                <li key={event.id} className="event-item">
                  <div className="event-time">
                    {formatTime(event.start_time)}
                  </div>
                  <div className="event-details">
                    <span className="event-title">{event.title}</span>
                    {event.location && (
                      <span className="event-location">{event.location}</span>
                    )}
                    {event.meeting_link && (
                      <a
                        href={event.meeting_link}
                        className="meeting-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join meeting
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Priority Inbox Block */}
        <section className="plan-block glass">
          <h2 className="block-title">
            <span className="block-icon">📬</span>
            Priority Inbox
          </h2>
          {state.emails.length === 0 ? (
            <p className="empty-state">Inbox zero! 🎉</p>
          ) : (
            <ul className="thread-list">
              {state.emails.slice(0, 5).map((email) => (
                <li key={email.id} className="thread-item">
                  <div className="thread-content">
                    <span className="thread-subject">
                      {email.subject || email.snippet.slice(0, 50)}
                    </span>
                    <span className="thread-snippet">{email.snippet}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tasks Block */}
        <section className="plan-block glass">
          <h2 className="block-title">
            <span className="block-icon">✅</span>
            Tasks
          </h2>
          {state.tasks.length === 0 ? (
            <p className="empty-state">No pending tasks</p>
          ) : (
            <ul className="task-list">
              {state.tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="task-item">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    readOnly
                    className="task-checkbox"
                  />
                  <div className="task-content">
                    <span className="task-title">{task.title}</span>
                    {task.due && (
                      <span className="task-due">
                        Due: {new Date(task.due).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
