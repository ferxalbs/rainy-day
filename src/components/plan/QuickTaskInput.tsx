/**
 * QuickTaskInput Component
 *
 * Inline input for quickly creating tasks. Submits on Enter key
 * and clears input on success.
 *
 * Requirements: 2.2
 */

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useTaskActions } from "../../hooks/useTaskActions";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { ActionResult } from "../../services/backend/actions";

interface QuickTaskInputProps {
  onTaskCreated?: (result: ActionResult) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  taskListId?: string;
  className?: string;
}

export function QuickTaskInput({
  onTaskCreated,
  onError,
  placeholder = "Add a quick task...",
  taskListId,
  className = "",
}: QuickTaskInputProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createTask } = useTaskActions();

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await createTask({
        title: trimmedTitle,
        task_list_id: taskListId,
      });

      if (result.success) {
        setTitle("");
        onTaskCreated?.(result);
        // Keep focus on input for quick successive entries
        inputRef.current?.focus();
      } else {
        onError?.(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, isSubmitting, createTask, taskListId, onTaskCreated, onError]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`quick-task-input ${className}`}>
      <div className="quick-task-input-wrapper">
        <Input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="quick-task-input-field"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          title="Add task"
          className="quick-task-submit-btn"
        >
          {isSubmitting ? <LoadingSpinner /> : <PlusIcon />}
        </Button>
      </div>
    </div>
  );
}

function PlusIcon() {
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
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

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
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

export default QuickTaskInput;
