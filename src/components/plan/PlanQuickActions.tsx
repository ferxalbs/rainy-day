/**
 * PlanQuickActions Component
 *
 * Quick action buttons for common workflow operations:
 * - Start Focus Mode (timer + highlight current task)
 * - Reschedule task to tomorrow
 * - Email triage mode
 * - Batch complete tasks
 *
 * Uses Tailwind CSS v4 for styling.
 */

import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface PlanQuickActionsProps {
  /** Currently focused task ID */
  focusTaskId?: string;
  /** Handler for starting focus mode */
  onStartFocus?: (taskId?: string) => void;
  /** Handler for entering email triage mode */
  onEmailTriage?: () => void;
  /** Number of emails pending */
  emailsPending?: number;
  /** Whether focus mode is active */
  isFocusActive?: boolean;
  /** Handler for stopping focus mode */
  onStopFocus?: () => void;
  /** Optional CSS class */
  className?: string;
}

// Icons as inline SVGs
function FocusIcon({ className = "" }: { className?: string }) {
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

function MailCheckIcon({ className = "" }: { className?: string }) {
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
      <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="m16 19 2 2 4-4" />
    </svg>
  );
}

function PauseIcon({ className = "" }: { className?: string }) {
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
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function ZapIcon({ className = "" }: { className?: string }) {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function PlanQuickActions({
  onStartFocus,
  onEmailTriage,
  emailsPending = 0,
  isFocusActive = false,
  onStopFocus,
  className = "",
}: PlanQuickActionsProps) {
  const [isTriaging, setIsTriaging] = useState(false);

  const handleEmailTriage = useCallback(() => {
    if (onEmailTriage) {
      setIsTriaging(true);
      onEmailTriage();
      // Reset after brief animation
      setTimeout(() => setIsTriaging(false), 300);
    }
  }, [onEmailTriage]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Focus Mode Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          {isFocusActive ? (
            <Button
              variant="default"
              size="sm"
              onClick={onStopFocus}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              <PauseIcon className="w-4 h-4" />
              <span className="text-xs">Stop Focus</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartFocus?.()}
              className="gap-1.5 hover:bg-primary/10 hover:border-primary/50"
            >
              <FocusIcon className="w-4 h-4 text-primary" />
              <span className="text-xs">Focus Mode</span>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isFocusActive
            ? "Stop focus mode and timer"
            : "Start focus mode with timer (⌘F)"}
        </TooltipContent>
      </Tooltip>

      {/* Email Triage (only show if emails pending) */}
      {emailsPending > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmailTriage}
              disabled={isTriaging}
              className="gap-1.5 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              <MailCheckIcon
                className={`w-4 h-4 text-amber-500 ${
                  isTriaging ? "animate-pulse" : ""
                }`}
              />
              <span className="text-xs">Triage ({emailsPending})</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Process {emailsPending} pending emails sequentially
          </TooltipContent>
        </Tooltip>
      )}

      {/* Quick Win Mode */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 hover:bg-green-500/10 text-muted-foreground hover:text-green-600"
          >
            <ZapIcon className="w-4 h-4" />
            <span className="text-xs">Quick Wins</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Focus on quick 5-15 min tasks
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default PlanQuickActions;
