/**
 * EmailActionBar Component
 *
 * Action bar for email items displaying Archive, Mark Read, and Convert to Task buttons.
 * Includes loading states, tooltips, and keyboard accessibility.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useCallback, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import type { EmailActionLoadingState } from "../../hooks/useEmailActions";

export interface EmailActionBarProps {
  email: {
    id: string;
    subject: string;
    isUnread: boolean;
  };
  onArchive?: () => void;
  onMarkRead?: () => void;
  onConvertToTask?: () => void;
  loadingState?: EmailActionLoadingState;
  compact?: boolean;
  /** Enable keyboard shortcuts when this email item is focused */
  enableKeyboardShortcuts?: boolean;
}

/**
 * EmailActionBar displays action buttons for email items.
 * Buttons are arranged in order: Archive, Mark Read (conditional), Convert to Task.
 *
 * Keyboard shortcuts (when enableKeyboardShortcuts is true):
 * - 'a' or 'e': Archive email
 * - 'r': Mark as read (only for unread emails)
 * - 't': Convert to task
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function EmailActionBar({
  email,
  onArchive,
  onMarkRead,
  onConvertToTask,
  loadingState,
  compact = false,
  enableKeyboardShortcuts = false,
}: EmailActionBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isArchiving = loadingState?.archive ?? false;
  const isMarkingRead = loadingState?.markRead ?? false;
  const isConvertingToTask = loadingState?.toTask ?? false;

  // Any action in progress disables all buttons
  const isAnyLoading = isArchiving || isMarkingRead || isConvertingToTask;

  /**
   * Handle keyboard shortcuts for email actions
   * Requirements: 5.5
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle if any action is loading or shortcuts are disabled
      if (isAnyLoading || !enableKeyboardShortcuts) return;

      // Don't handle if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "a":
        case "e":
          // Archive email
          if (onArchive) {
            event.preventDefault();
            onArchive();
          }
          break;
        case "r":
          // Mark as read (only for unread emails)
          if (email.isUnread && onMarkRead) {
            event.preventDefault();
            onMarkRead();
          }
          break;
        case "t":
          // Convert to task
          if (onConvertToTask) {
            event.preventDefault();
            onConvertToTask();
          }
          break;
      }
    },
    [
      isAnyLoading,
      enableKeyboardShortcuts,
      onArchive,
      onMarkRead,
      onConvertToTask,
      email.isUnread,
    ]
  );

  // Attach keyboard event listener when shortcuts are enabled
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const container = containerRef.current;
    if (!container) return;

    // Listen on the container for keyboard events when focused within
    container.addEventListener("keydown", handleKeyDown as EventListener);
    return () => {
      container.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [enableKeyboardShortcuts, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}
      role="toolbar"
      aria-label={`Actions for email: ${email.subject}`}
    >
      {/* Archive Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "icon"}
            onClick={onArchive}
            disabled={isAnyLoading || !onArchive}
            aria-label="Archive email"
            tabIndex={0}
            className="email-action-btn email-action-archive"
          >
            {isArchiving ? <LoadingSpinner /> : <ArchiveIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Archive</TooltipContent>
      </Tooltip>

      {/* Mark Read Button - Only visible for unread emails */}
      {email.isUnread && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={compact ? "icon-sm" : "icon"}
              onClick={onMarkRead}
              disabled={isAnyLoading || !onMarkRead}
              aria-label="Mark as read"
              tabIndex={0}
              className="email-action-btn email-action-mark-read"
            >
              {isMarkingRead ? <LoadingSpinner /> : <MarkReadIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark as read</TooltipContent>
        </Tooltip>
      )}

      {/* Convert to Task Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "icon"}
            onClick={onConvertToTask}
            disabled={isAnyLoading || !onConvertToTask}
            aria-label="Convert to task"
            tabIndex={0}
            className="email-action-btn email-action-to-task"
          >
            {isConvertingToTask ? <LoadingSpinner /> : <ConvertToTaskIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Convert to task</TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * Archive icon (box with arrow down)
 */
function ArchiveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

/**
 * Mark as read icon (envelope open)
 */
function MarkReadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
      <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </svg>
  );
}

/**
 * Convert to task icon (clipboard with plus)
 */
function ConvertToTaskIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11v6" />
      <path d="M9 14h6" />
    </svg>
  );
}

/**
 * Loading spinner for action buttons
 */
function LoadingSpinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

export default EmailActionBar;
