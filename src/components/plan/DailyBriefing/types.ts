/**
 * DailyBriefing Types
 *
 * Shared types and interfaces for the DailyBriefing component family.
 */

import type { PlanTask, ItemFeedbackType, DailyPlan } from "../../../services/backend/plan";

// =============================================================================
// Notification Types
// =============================================================================

export interface NotificationState {
    type: "success" | "error";
    message: string;
    id: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// =============================================================================
// Email State Types
// =============================================================================

export interface OptimisticEmailState {
    archived: boolean;
    markedRead: boolean;
}

export interface EmailLoadingState {
    archive: boolean;
    markRead: boolean;
    toTask: boolean;
}

// =============================================================================
// Component Props
// =============================================================================

export interface DailyBriefingProps {
    onTaskComplete?: (taskId: string) => void;
    /** Externally controlled regenerating state (from Topbar) */
    isRegenerating?: boolean;
    /** Externally provided regenerate function (from Topbar) */
    onRegenerate?: () => void;
    /** Externally provided plan (from MainLayout) */
    plan?: DailyPlan | null;
    /** Externally provided loading state */
    isLoading?: boolean;
    /** Externally provided error state */
    error?: string | null;
}

export interface BriefingItemProps {
    task: PlanTask;
    isCompleted?: boolean;
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
    emailLoadingState?: EmailLoadingState;
    isOptimisticallyRead?: boolean;
}

// Re-export types from plan service for convenience
export type { PlanTask, ItemFeedbackType, DailyPlan };
