/**
 * DailyBriefing Component
 *
 * A clean, interactive daily briefing component that displays AI-generated
 * plans in a conversational format with actionable items.
 *
 * Features:
 * - Date header with beautiful formatting
 * - Concise AI summary paragraph
 * - Unified action item list with checkboxes
 * - Dynamic action buttons per item type
 * - AI recommendations section
 *
 * Requirements: 1.6, 1.7, 5.1, 5.5, 6.4, 8.4, 8.5
 */

import React, { useState, useEffect, useCallback } from "react";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import { useEmailActions } from "../../hooks/useEmailActions";
import { REGENERATE_PLAN_EVENT } from "../../hooks/useKeyboardShortcuts";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import type { PlanTask, ItemFeedbackType } from "../../services/backend/plan";

// =============================================================================
// Icons (Clean SVG, no emojis)
// =============================================================================

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CheckCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TargetIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CoffeeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <path d="M6 2v2" />
    </svg>
  );
}

function ArchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

function MarkReadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
      <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </svg>
  );
}

function TaskPlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11v6" />
      <path d="M9 14h6" />
    </svg>
  );
}

function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function ThumbsUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbsDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

function LightbulbIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

interface NotificationState {
  type: "success" | "error";
  message: string;
  id: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OptimisticEmailState {
  archived: boolean;
  markedRead: boolean;
}

interface DailyBriefingProps {
  onTaskComplete?: (taskId: string) => void;
}

// =============================================================================
// Main Component
// =============================================================================

export function DailyBriefing({ onTaskComplete }: DailyBriefingProps) {
  const {
    plan,
    isLoading,
    isGenerating,
    error,
    regenerate,
    submitItemFeedback,
  } = useDailyPlan();

  const {
    archiveEmail,
    markAsRead,
    convertToTask,
    loadingStates: emailLoadingStates,
  } = useEmailActions();

  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [optimisticStates, setOptimisticStates] = useState<
    Record<string, OptimisticEmailState>
  >({});

  // Listen for keyboard shortcut to regenerate plan (Cmd+R)
  useEffect(() => {
    const handleRegenerate = () => {
      if (!isGenerating) {
        regenerate();
      }
    };

    window.addEventListener(REGENERATE_PLAN_EVENT, handleRegenerate);
    return () =>
      window.removeEventListener(REGENERATE_PLAN_EVENT, handleRegenerate);
  }, [regenerate, isGenerating]);

  // =============================================================================
  // Notification Handlers
  // =============================================================================

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (
      type: "success" | "error",
      message: string,
      action?: { label: string; onClick: () => void }
    ) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { type, message, id, action }]);
      const dismissTime = type === "success" ? 4000 : 6000;
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, dismissTime);
    },
    []
  );

  // =============================================================================
  // Optimistic State Handlers
  // =============================================================================

  const setOptimisticState = useCallback(
    (emailId: string, state: Partial<OptimisticEmailState>) => {
      setOptimisticStates((prev) => ({
        ...prev,
        [emailId]: {
          archived: prev[emailId]?.archived ?? false,
          markedRead: prev[emailId]?.markedRead ?? false,
          ...state,
        },
      }));
    },
    []
  );

  const rollbackOptimisticState = useCallback(
    (emailId: string, state: Partial<OptimisticEmailState>) => {
      setOptimisticStates((prev) => {
        const current = prev[emailId];
        if (!current) return prev;

        const updated = { ...current };
        if (state.archived !== undefined) updated.archived = false;
        if (state.markedRead !== undefined) updated.markedRead = false;

        if (!updated.archived && !updated.markedRead) {
          const { [emailId]: _, ...rest } = prev;
          return rest;
        }

        return { ...prev, [emailId]: updated };
      });
    },
    []
  );

  // =============================================================================
  // Email Action Handlers
  // =============================================================================

  const handleArchiveEmail = useCallback(
    async (emailId: string) => {
      setOptimisticState(emailId, { archived: true });
      const result = await archiveEmail(emailId);
      if (result.success) {
        showNotification("success", "Email archived");
      } else {
        rollbackOptimisticState(emailId, { archived: true });
        showNotification("error", result.message || "Failed to archive email", {
          label: "Retry",
          onClick: () => handleArchiveEmail(emailId),
        });
      }
    },
    [
      archiveEmail,
      showNotification,
      setOptimisticState,
      rollbackOptimisticState,
    ]
  );

  const handleMarkAsRead = useCallback(
    async (emailId: string) => {
      setOptimisticState(emailId, { markedRead: true });
      const result = await markAsRead(emailId);
      if (result.success) {
        showNotification("success", "Marked as read");
      } else {
        rollbackOptimisticState(emailId, { markedRead: true });
        showNotification("error", result.message || "Failed to mark as read", {
          label: "Retry",
          onClick: () => handleMarkAsRead(emailId),
        });
      }
    },
    [markAsRead, showNotification, setOptimisticState, rollbackOptimisticState]
  );

  const handleConvertToTask = useCallback(
    async (emailId: string) => {
      const result = await convertToTask(emailId);
      if (result.success && result.data) {
        showNotification(
          "success",
          `Task created: "${result.data.task_title}"`
        );
      } else {
        showNotification("error", result.message || "Failed to create task", {
          label: "Retry",
          onClick: () => handleConvertToTask(emailId),
        });
      }
    },
    [convertToTask, showNotification]
  );

  // =============================================================================
  // Utility Functions
  // =============================================================================

  const formatSuggestedTime = (time?: string) => {
    if (!time) return null;
    if (/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)?$/i.test(time)) return time;
    if (/^(morning|afternoon|evening|noon|early|late)/i.test(time)) {
      return time.charAt(0).toUpperCase() + time.slice(1);
    }
    try {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch {
      // Parsing failed
    }
    return time;
  };

  const filterArchivedTasks = useCallback(
    (tasks: PlanTask[]) => {
      return tasks.filter((task) => {
        if (task.type !== "email" && task.source_type !== "email") return true;
        const emailId = task.source_id;
        if (!emailId) return true;
        return !optimisticStates[emailId]?.archived;
      });
    },
    [optimisticStates]
  );

  const getTypeIcon = (task: PlanTask) => {
    switch (task.type) {
      case "email":
        return <MailIcon className="text-primary" />;
      case "meeting":
        return <CalendarIcon className="text-primary" />;
      case "task":
        return <CheckCircleIcon className="text-primary" />;
      case "focus":
        return <TargetIcon className="text-primary" />;
      case "break":
        return <CoffeeIcon className="text-primary" />;
      default:
        return <CheckCircleIcon className="text-primary" />;
    }
  };

  const getPriorityColor = (priority: PlanTask["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  // =============================================================================
  // Combine All Tasks into Single List
  // =============================================================================

  const getAllActionItems = (): PlanTask[] => {
    if (!plan) return [];
    const allItems: PlanTask[] = [];

    // Add focus blocks (with null check)
    if (plan.focus_blocks) {
      filterArchivedTasks(plan.focus_blocks).forEach((item) =>
        allItems.push(item)
      );
    }
    // Add quick wins (with null check)
    if (plan.quick_wins) {
      filterArchivedTasks(plan.quick_wins).forEach((item) =>
        allItems.push(item)
      );
    }
    // Add meetings (with null check)
    if (plan.meetings) {
      plan.meetings.forEach((item) => allItems.push(item));
    }

    // Sort by suggested_time if available
    return allItems.sort((a, b) => {
      if (!a.suggested_time && !b.suggested_time) return 0;
      if (!a.suggested_time) return 1;
      if (!b.suggested_time) return -1;
      return a.suggested_time.localeCompare(b.suggested_time);
    });
  };

  // =============================================================================
  // Loading State
  // =============================================================================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-muted/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">Loading your daily briefing...</p>
      </div>
    );
  }

  // =============================================================================
  // Error State
  // =============================================================================

  if (error && !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground">
        <p className="text-destructive text-sm">{error}</p>
        <Button onClick={regenerate} variant="default">
          Generate Plan
        </Button>
      </div>
    );
  }

  // =============================================================================
  // No Plan State
  // =============================================================================

  if (!plan) {
    return (
      <div className="daily-briefing-container p-6 rounded-2xl backdrop-blur-xl border-2 border-border/50 bg-card/30 text-center">
        <p className="text-muted-foreground">
          No plan generated yet. Use the refresh button in the top bar to
          generate your AI daily briefing.
        </p>
      </div>
    );
  }

  // =============================================================================
  // Main Render
  // =============================================================================

  const actionItems = getAllActionItems();

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all animate-in slide-in-from-right-5 ${
                notification.type === "success"
                  ? "bg-green-500/90 text-white border-green-400/50"
                  : "bg-destructive/90 text-destructive-foreground border-destructive/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium flex-1">
                  {notification.message}
                </span>
                {notification.action && (
                  <button
                    onClick={() => {
                      dismissNotification(notification.id);
                      notification.action?.onClick();
                    }}
                    className="text-xs font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    {notification.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-0.5 rounded hover:bg-white/20 transition-colors"
                  aria-label="Dismiss"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Briefing Card */}
      <div className="daily-briefing-container p-6 rounded-2xl backdrop-blur-xl border-2 border-border/50 bg-card/30 shadow-xl">
        {/* AI Summary */}
        {plan.summary && (
          <p className="text-foreground/80 leading-relaxed mb-6 text-[15px]">
            {plan.summary}
          </p>
        )}

        {/* Action Items List */}
        {actionItems.length > 0 && (
          <div className="space-y-2">
            {actionItems.map((task) => (
              <BriefingItem
                key={task.id}
                task={task}
                onComplete={onTaskComplete}
                onFeedback={submitItemFeedback}
                formatTime={formatSuggestedTime}
                getTypeIcon={getTypeIcon}
                getPriorityColor={getPriorityColor}
                onArchiveEmail={handleArchiveEmail}
                onMarkAsRead={handleMarkAsRead}
                onConvertToTask={handleConvertToTask}
                emailLoadingState={
                  task.source_id
                    ? emailLoadingStates[task.source_id]
                    : undefined
                }
                isOptimisticallyRead={
                  task.source_id
                    ? optimisticStates[task.source_id]?.markedRead ?? false
                    : false
                }
              />
            ))}
          </div>
        )}

        {actionItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Your day is clear!
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              No pending tasks, meetings, or important emails for today. Enjoy
              your free time or generate a new plan.
            </p>
            <button
              onClick={regenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Generate Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Energy Tip / Recommendations */}
      {plan.energy_tip && (
        <div className="p-4 rounded-xl backdrop-blur-xl border-2 border-border/30 bg-card/20 flex items-start gap-3">
          <LightbulbIcon className="text-primary mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            {plan.energy_tip}
          </p>
        </div>
      )}

      {/* Defer Suggestions */}
      {plan.defer_suggestions && plan.defer_suggestions.length > 0 && (
        <div className="p-4 rounded-xl backdrop-blur-xl border-2 border-border/30 bg-card/20">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Consider Deferring
          </h3>
          <div className="space-y-2">
            {plan.defer_suggestions.map((suggestion, index) => {
              const text =
                typeof suggestion === "string" ? suggestion : suggestion.title;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground/80"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BriefingItem Component
// =============================================================================

interface BriefingItemProps {
  task: PlanTask;
  onComplete?: (taskId: string) => void;
  onFeedback?: (
    itemId: string,
    itemTitle: string,
    feedbackType: ItemFeedbackType,
    itemType: "focus_block" | "quick_win" | "meeting" | "defer"
  ) => Promise<boolean>;
  formatTime: (time?: string) => string | null;
  getTypeIcon: (task: PlanTask) => React.ReactNode;
  getPriorityColor: (priority: PlanTask["priority"]) => string;
  onArchiveEmail?: (emailId: string) => Promise<void>;
  onMarkAsRead?: (emailId: string) => Promise<void>;
  onConvertToTask?: (emailId: string) => Promise<void>;
  emailLoadingState?: {
    archive: boolean;
    markRead: boolean;
    toTask: boolean;
  };
  isOptimisticallyRead?: boolean;
}

function BriefingItem({
  task,
  onComplete,
  onFeedback,
  formatTime,
  getTypeIcon,
  getPriorityColor,
  onArchiveEmail,
  onMarkAsRead,
  onConvertToTask,
  emailLoadingState,
  isOptimisticallyRead = false,
}: BriefingItemProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<ItemFeedbackType | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const isEmail = task.type === "email" || task.source_type === "email";
  const isMeeting = task.type === "meeting";
  const isTask = task.source_type === "task";

  const handleComplete = () => {
    setIsChecked(true);
    if (task.source_id && onComplete) {
      onComplete(task.source_id);
    }
  };

  const handleFeedback = async (type: ItemFeedbackType) => {
    if (!onFeedback || isSubmitting) return;
    setIsSubmitting(true);

    const itemType =
      task.type === "focus"
        ? "focus_block"
        : task.type === "meeting"
        ? "meeting"
        : "quick_win";

    const success = await onFeedback(task.id, task.title, type, itemType);
    if (success) {
      setFeedbackGiven(type);
    }
    setIsSubmitting(false);
  };

  const formattedTime = formatTime(task.suggested_time);

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-card/40 transition-all border border-transparent hover:border-border/40 ${
        isChecked || isOptimisticallyRead ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      {isTask && (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleComplete}
          className="mt-1 w-4 h-4 rounded border-2 border-muted-foreground/40 accent-primary cursor-pointer"
        />
      )}

      {/* Type Icon */}
      <div className="mt-0.5">{getTypeIcon(task)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium text-foreground text-sm ${
              isChecked ? "line-through" : ""
            }`}
          >
            {task.title}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Time & Duration */}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {formattedTime && (
            <span className="flex items-center gap-1">
              <ClockIcon />
              {formattedTime}
            </span>
          )}
          {task.duration_minutes > 0 && (
            <span>{task.duration_minutes} min</span>
          )}
        </div>

        {/* Context */}
        {task.context && (
          <p className="mt-1.5 text-xs text-foreground/50 leading-relaxed">
            {task.context}
          </p>
        )}
      </div>

      {/* Action Buttons - appear on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Email Actions */}
        {isEmail && task.source_id && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onArchiveEmail?.(task.source_id!)}
                  disabled={emailLoadingState?.archive}
                >
                  {emailLoadingState?.archive ? (
                    <SpinnerIcon />
                  ) : (
                    <ArchiveIcon />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>

            {!isOptimisticallyRead && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onMarkAsRead?.(task.source_id!)}
                    disabled={emailLoadingState?.markRead}
                  >
                    {emailLoadingState?.markRead ? (
                      <SpinnerIcon />
                    ) : (
                      <MarkReadIcon />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as Read</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onConvertToTask?.(task.source_id!)}
                  disabled={emailLoadingState?.toTask}
                >
                  {emailLoadingState?.toTask ? (
                    <SpinnerIcon />
                  ) : (
                    <TaskPlusIcon />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Convert to Task</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Meeting Actions */}
        {isMeeting && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <VideoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Join Meeting</TooltipContent>
          </Tooltip>
        )}

        {/* Feedback Buttons */}
        {onFeedback && !feedbackGiven && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleFeedback("positive")}
                  disabled={isSubmitting}
                  className={
                    feedbackGiven === "positive" ? "text-green-500" : ""
                  }
                >
                  <ThumbsUpIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Helpful</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleFeedback("negative")}
                  disabled={isSubmitting}
                  className={
                    feedbackGiven === "negative" ? "text-destructive" : ""
                  }
                >
                  <ThumbsDownIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Not helpful</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}

export default DailyBriefing;
