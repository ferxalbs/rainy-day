/**
 * useKeyboardShortcuts Hook
 *
 * Provides global keyboard shortcuts for the application.
 * - Cmd+R: Refresh/regenerate plan
 * - Cmd+N: Focus quick task input
 * - Cmd+S: Trigger sync
 *
 * Requirements: 8.5
 */

import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcutsOptions {
  onRegeneratePlan?: () => void;
  onFocusQuickTask?: () => void;
  onTriggerSync?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onRegeneratePlan,
  onFocusQuickTask,
  onTriggerSync,
  enabled = true,
}: KeyboardShortcutsOptions) {
  // Use refs to avoid stale closures
  const onRegeneratePlanRef = useRef(onRegeneratePlan);
  const onFocusQuickTaskRef = useRef(onFocusQuickTask);
  const onTriggerSyncRef = useRef(onTriggerSync);

  // Update refs when callbacks change
  useEffect(() => {
    onRegeneratePlanRef.current = onRegeneratePlan;
    onFocusQuickTaskRef.current = onFocusQuickTask;
    onTriggerSyncRef.current = onTriggerSync;
  }, [onRegeneratePlan, onFocusQuickTask, onTriggerSync]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      // Ignore if user is typing in an input field (except for our shortcuts)
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      switch (e.key.toLowerCase()) {
        case "r":
          // Cmd+R: Regenerate plan (prevent browser refresh)
          e.preventDefault();
          onRegeneratePlanRef.current?.();
          break;

        case "n":
          // Cmd+N: Focus quick task input (prevent new window)
          e.preventDefault();
          onFocusQuickTaskRef.current?.();
          break;

        case "s":
          // Cmd+S: Trigger sync (prevent save dialog)
          // Only if not in an input field
          if (!isInputField) {
            e.preventDefault();
            onTriggerSyncRef.current?.();
          }
          break;
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Custom event for focusing quick task input
export const FOCUS_QUICK_TASK_EVENT = "focus-quick-task";

export function dispatchFocusQuickTask() {
  window.dispatchEvent(new CustomEvent(FOCUS_QUICK_TASK_EVENT));
}

// Custom event for regenerating plan
export const REGENERATE_PLAN_EVENT = "regenerate-plan";

export function dispatchRegeneratePlan() {
  window.dispatchEvent(new CustomEvent(REGENERATE_PLAN_EVENT));
}

// Custom event for triggering sync
export const TRIGGER_SYNC_EVENT = "trigger-sync";

export function dispatchTriggerSync() {
  window.dispatchEvent(new CustomEvent(TRIGGER_SYNC_EVENT));
}

export default useKeyboardShortcuts;
