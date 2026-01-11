/**
 * PlanQuickStats Component
 *
 * Compact stats bar displaying key metrics from the daily plan.
 * Shows: tasks count, high priority count, estimated time, emails pending
 *
 * Uses Tailwind CSS v4 for styling with responsive design.
 */

import React from "react";

interface PlanStats {
  total_tasks: number;
  high_priority_count: number;
  estimated_minutes: number;
  emails_pending: number;
  completion_percentage: number;
}

interface PlanQuickStatsProps {
  stats: PlanStats;
  className?: string;
}

/**
 * Format minutes into a human-readable duration
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Individual stat item with icon and value
 */
function StatItem({
  icon,
  value,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: "default" | "warning" | "success";
}) {
  const variantClasses = {
    default: "text-muted-foreground",
    warning: "text-amber-500",
    success: "text-green-500",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/50 border border-border/30 ${variantClasses[variant]}`}
      title={label}
    >
      {icon}
      <span className="text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

// Icons as inline SVGs for minimal footprint
function TasksIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function HighPriorityIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
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

function MailIcon() {
  return (
    <svg
      width="14"
      height="14"
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

export function PlanQuickStats({ stats, className = "" }: PlanQuickStatsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <StatItem
        icon={<TasksIcon />}
        value={stats.total_tasks}
        label={`${stats.total_tasks} tasks today`}
      />

      {stats.high_priority_count > 0 && (
        <StatItem
          icon={<HighPriorityIcon />}
          value={stats.high_priority_count}
          label={`${stats.high_priority_count} high priority`}
          variant="warning"
        />
      )}

      <StatItem
        icon={<ClockIcon />}
        value={formatDuration(stats.estimated_minutes)}
        label={`Estimated time: ${formatDuration(stats.estimated_minutes)}`}
      />

      {stats.emails_pending > 0 && (
        <StatItem
          icon={<MailIcon />}
          value={stats.emails_pending}
          label={`${stats.emails_pending} emails pending`}
        />
      )}
    </div>
  );
}

export default PlanQuickStats;
