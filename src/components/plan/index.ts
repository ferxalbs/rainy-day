/**
 * Plan Components
 *
 * Export all plan-related components for easy importing.
 */

// Note: DailyPlan was a legacy component, now using DailyBriefing
export { DailyBriefing } from "./DailyBriefing";
export { TaskActionButton } from "./TaskActionButton";
export { QuickTaskInput } from "./QuickTaskInput";
export { MeetingJoinButton } from "./MeetingJoinButton";
export { EmailActionBar } from "./EmailActionBar";
export type { EmailActionBarProps } from "./EmailActionBar";

// New productivity components
export { PlanQuickStats } from "./PlanQuickStats";
export { PlanProgressBar, PlanProgressBarInline } from "./PlanProgressBar";
export { PlanQuickActions } from "./PlanQuickActions";
