/**
 * ============================================================================
 * DailyBriefing Component
 * ============================================================================
 *
 * The main orchestrator component for the AI-generated daily plan view.
 * This component has been modularized for better maintainability.
 *
 * ARCHITECTURE:
 * -------------
 * This file serves as the main entry point and orchestrator. All sub-components
 * are located in the ./DailyBriefing/ folder:
 *
 *   DailyBriefing/
 *   ├── index.ts           - Barrel exports
 *   ├── types.ts           - Shared TypeScript interfaces
 *   ├── icons.tsx          - 14 SVG icons (Calendar, Mail, Check, etc.)
 *   ├── BriefingItem.tsx   - Individual task row with actions
 *   ├── SkeletonLoader.tsx - Loading state skeleton UI
 *   ├── NotificationToast.tsx - Toast notification system
 *   ├── EnergyTip.tsx      - AI energy/productivity tip
 *   ├── DeferSuggestions.tsx - Tasks to defer/postpone
 *   ├── ResetDialog.tsx    - System reset confirmation dialog
 *   └── EmptyState.tsx     - Empty plan state with generate button
 *
 * FEATURES:
 * ---------
 * - Date header with beautiful formatting
 * - Concise AI summary paragraph
 * - Unified action item list with checkboxes
 * - Dynamic action buttons per item type (email, meeting, task)
 * - AI recommendations section
 * - Progress tracking with localStorage persistence
 * - Keyboard shortcut support (Cmd+R to regenerate)
 *
 * STATE MANAGEMENT:
 * -----------------
 * - Uses useDailyPlan hook for plan data
 * - Uses useEmailActions for email operations
 * - Supports external state injection via props (for Topbar sync)
 * - LocalStorage for completed task persistence
 *
 * REQUIREMENTS: 1.6, 1.7, 5.1, 5.5, 6.4, 8.4, 8.5
 *
 * @module DailyBriefing
 * @version 0.5.16
 * @lastModified 2026-01-14
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import { useEmailActions } from "../../hooks/useEmailActions";
import { useTranslation } from "../../hooks/useTranslation";
import { REGENERATE_PLAN_EVENT } from "../../hooks/useKeyboardShortcuts";
import { Button } from "../ui/button";
import { deleteTodayPlan } from "../../services/backend/plan";
import { PlanQuickStats } from "./PlanQuickStats";
import { PlanProgressBar } from "./PlanProgressBar";

// Sub-components from DailyBriefing folder
import {
  type DailyBriefingProps,
  type NotificationState,
  type OptimisticEmailState,
  type PlanTask,
  BriefingItem,
  SkeletonLoader,
  NotificationToast,
  EnergyTip,
  DeferSuggestions,
  ResetDialog,
  EmptyState,
  CalendarIcon,
  MailIcon,
  CheckCircleIcon,
  TargetIcon,
  CoffeeIcon,
} from "./DailyBriefing/index";

// =============================================================================
// Main Component
// =============================================================================

export function DailyBriefing({
  onTaskComplete,
  isRegenerating,
  onRegenerate,
  plan: externalPlan,
  isLoading: externalIsLoading,
  error: externalError,
}: DailyBriefingProps) {
  // ---------------------------------------------------------------------------
  // Hooks & State
  // ---------------------------------------------------------------------------

  const {
    plan: internalPlan,
    isLoading: internalIsLoading,
    isGenerating: internalIsGenerating,
    error: internalError,
    regenerate: internalRegenerate,
    submitItemFeedback,
  } = useDailyPlan();

  // Use external state if provided, otherwise use internal
  const isGenerating = isRegenerating ?? internalIsGenerating;
  const regenerate = onRegenerate ?? internalRegenerate;
  const plan = externalPlan !== undefined ? externalPlan : internalPlan;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const {
    archiveEmail,
    markAsRead,
    convertToTask,
    loadingStates: emailLoadingStates,
  } = useEmailActions();

  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [optimisticStates, setOptimisticStates] = useState<
    Record<string, OptimisticEmailState>
  >({});
  const [isClearing, setIsClearing] = useState(false);

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && plan?.date) {
      try {
        const stored = localStorage.getItem(`plan_completed_${plan.date}`);
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Failed to load completed tasks from localStorage:", e);
      }
    }
    return new Set();
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Load completed tasks when plan changes (new day)
  useEffect(() => {
    if (plan?.date) {
      const key = `plan_completed_${plan.date}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setCompletedTaskIds(new Set(JSON.parse(stored)));
        } else {
          setCompletedTaskIds(new Set());
        }
      } catch (e) {
        console.warn("Failed to load completed tasks:", e);
        setCompletedTaskIds(new Set());
      }
    }
  }, [plan?.date]);

  // Save completed tasks to localStorage
  useEffect(() => {
    if (plan?.date && completedTaskIds.size >= 0) {
      const key = `plan_completed_${plan.date}`;
      try {
        localStorage.setItem(key, JSON.stringify([...completedTaskIds]));
      } catch (e) {
        console.warn("Failed to save completed tasks:", e);
      }
    }
  }, [plan?.date, completedTaskIds]);

  // Listen for keyboard shortcut to regenerate plan (Cmd+R)
  useEffect(() => {
    const handleRegenerate = () => {
      if (!isGenerating) {
        regenerate();
      }
    };
    window.addEventListener(REGENERATE_PLAN_EVENT, handleRegenerate);
    return () => window.removeEventListener(REGENERATE_PLAN_EVENT, handleRegenerate);
  }, [regenerate, isGenerating]);

  // ---------------------------------------------------------------------------
  // Memoized Computations
  // ---------------------------------------------------------------------------

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

  const activeActionItems = useMemo(() => {
    if (!plan) return [];
    const allItems: PlanTask[] = [];

    if (plan.focus_blocks) {
      filterArchivedTasks(plan.focus_blocks).forEach((item) => allItems.push(item));
    }
    if (plan.quick_wins) {
      filterArchivedTasks(plan.quick_wins).forEach((item) => allItems.push(item));
    }
    if (plan.meetings) {
      plan.meetings.forEach((item) => allItems.push(item));
    }

    return allItems.sort((a, b) => {
      if (!a.suggested_time && !b.suggested_time) return 0;
      if (!a.suggested_time) return 1;
      if (!b.suggested_time) return -1;
      return a.suggested_time.localeCompare(b.suggested_time);
    });
  }, [plan, filterArchivedTasks]);

  const { completionPercentage, remainingMinutes } = useMemo(() => {
    if (!plan) return { completionPercentage: 0, remainingMinutes: 0 };

    const totalTasks = activeActionItems.length;
    if (totalTasks === 0) return { completionPercentage: 100, remainingMinutes: 0 };

    const completedCount = activeActionItems.filter((task) =>
      completedTaskIds.has(task.id)
    ).length;
    const percentage = Math.min(100, Math.round((completedCount / totalTasks) * 100));

    const totalMinutes = plan.stats?.estimated_minutes || 0;
    const completedRatio = completedCount / totalTasks;
    const remaining = Math.round(totalMinutes * (1 - completedRatio));

    return { completionPercentage: percentage, remainingMinutes: remaining };
  }, [plan, completedTaskIds, activeActionItems]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTaskComplete = useCallback(
    (taskId: string) => {
      setCompletedTaskIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
      onTaskComplete?.(taskId);
    },
    [onTaskComplete]
  );

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

  const handleClearPlan = useCallback(async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      console.log("[DailyBriefing] Performing total reset...");
      const success = await deleteTodayPlan();
      if (success) {
        showNotification("success", "System reset successful. Getting fresh data...");
        setCompletedTaskIds(new Set());
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showNotification("error", "Failed to clear plan. Please try again.");
      }
    } catch (err) {
      console.error("[DailyBriefing] Reset error:", err);
      showNotification("error", "An unexpected error occurred during reset.");
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, showNotification]);

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
    [archiveEmail, showNotification, setOptimisticState, rollbackOptimisticState]
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
        showNotification("success", `Task created: "${result.data.task_title}"`);
      } else {
        showNotification("error", result.message || "Failed to create task", {
          label: "Retry",
          onClick: () => handleConvertToTask(emailId),
        });
      }
    },
    [convertToTask, showNotification]
  );

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Render States
  // ---------------------------------------------------------------------------

  // Loading State (initial load only)
  if (isLoading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-muted/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">{t("plan.loading")}</p>
      </div>
    );
  }

  // Error State
  if (error && !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted-foreground">
        <p className="text-destructive text-sm">{error}</p>
        <Button onClick={regenerate} variant="default">
          {t("plan.generatePlan")}
        </Button>
      </div>
    );
  }

  // No Plan State
  if (!plan) {
    return (
      <div className="daily-briefing-container p-6 rounded-2xl backdrop-blur-xl border-2 border-border/50 bg-card/30 text-center">
        <p className="text-muted-foreground">{t("plan.noPlanYet")}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  const actionItems = activeActionItems;

  return (
    <div className="space-y-4 relative">
      {/* Skeleton Loading State when Regenerating */}
      {isGenerating && <SkeletonLoader regeneratingText={t("plan.regenerating")} />}

      {/* Actual Content (hidden when regenerating) */}
      {!isGenerating && (
        <>
          {/* Notifications */}
          <NotificationToast
            notifications={notifications}
            onDismiss={dismissNotification}
          />

          {/* Main Briefing Card */}
          <div className="daily-briefing-container p-6 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-xl transition-all duration-500">
            {/* Quick Stats Bar */}
            {plan.stats && (
              <div className="mb-4 pb-4 border-b border-border/30">
                <PlanQuickStats stats={plan.stats} />
              </div>
            )}

            {/* Progress Bar */}
            {plan.stats && (
              <div className="mb-5">
                <PlanProgressBar
                  percentage={completionPercentage}
                  estimatedMinutes={remainingMinutes}
                />
              </div>
            )}

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
                    isCompleted={completedTaskIds.has(task.id)}
                    onComplete={handleTaskComplete}
                    onFeedback={submitItemFeedback}
                    formatTime={formatSuggestedTime}
                    getTypeIcon={getTypeIcon}
                    getPriorityColor={getPriorityColor}
                    onArchiveEmail={handleArchiveEmail}
                    onMarkAsRead={handleMarkAsRead}
                    onConvertToTask={handleConvertToTask}
                    emailLoadingState={
                      task.source_id ? emailLoadingStates[task.source_id] : undefined
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

            {/* Empty State */}
            {actionItems.length === 0 && (
              <EmptyState
                dayClearTitle={t("plan.dayClear")}
                dayClearDescription={t("plan.dayClearDescription")}
                generatePlanText={t("plan.generatePlan")}
                isGenerating={isGenerating}
                onGenerate={regenerate}
              />
            )}
          </div>

          {/* Energy Tip */}
          {plan.energy_tip && <EnergyTip tip={plan.energy_tip} />}

          {/* Defer Suggestions */}
          {plan.defer_suggestions && plan.defer_suggestions.length > 0 && (
            <DeferSuggestions
              suggestions={plan.defer_suggestions}
              title={t("plan.considerDeferring")}
            />
          )}

          {/* Reset Dialog */}
          <ResetDialog isClearing={isClearing} onReset={handleClearPlan} />
        </>
      )}
    </div>
  );
}

export default DailyBriefing;
