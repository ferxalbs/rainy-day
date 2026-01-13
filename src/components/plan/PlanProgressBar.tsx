/**
 * PlanProgressBar Component
 *
 * Visual progress indicator showing daily completion percentage.
 * Uses shadcn Progress component with theme-aware colors.
 *
 * Uses Tailwind CSS v4 for styling with responsive design.
 */

import { Progress } from "../ui/progress";
import { useTranslation } from "../../hooks/useTranslation";

interface PlanProgressBarProps {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Estimated minutes remaining */
  estimatedMinutes?: number;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Format minutes into human-readable duration
 */
function formatTimeRemaining(minutes: number): string {
  if (minutes <= 0) return "Done!";
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
}

export function PlanProgressBar({
  percentage,
  estimatedMinutes,
  showLabel = true,
  className = "",
}: PlanProgressBarProps) {
  const { t } = useTranslation();
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header with label and time remaining */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {t("plan.todaysProgress")}
        </span>
        <div className="flex items-center gap-2">
          {estimatedMinutes !== undefined && estimatedMinutes > 0 && (
            <span className="text-muted-foreground/70">
              {formatTimeRemaining(estimatedMinutes)}
            </span>
          )}
          {showLabel && (
            <span className="font-semibold text-foreground tabular-nums">
              {clampedPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Shadcn Progress component - uses theme primary color */}
      <Progress value={clampedPercentage} className="h-2" />
    </div>
  );
}

/**
 * Compact inline version of the progress bar
 */
export function PlanProgressBarInline({
  percentage,
  className = "",
}: {
  percentage: number;
  className?: string;
}) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Progress value={clampedPercentage} className="h-1.5 w-16" />
      <span className="text-xs font-medium text-muted-foreground tabular-nums">
        {clampedPercentage}%
      </span>
    </div>
  );
}

export default PlanProgressBar;
