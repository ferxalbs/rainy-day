/**
 * TaskActionButton Component
 *
 * Action buttons for completing and deleting tasks with loading states.
 *
 * Requirements: 2.1, 2.6
 */

import { useState } from "react";
import { useTaskActions } from "../../hooks/useTaskActions";
import { Button } from "../ui/button";

type ActionType = "complete" | "delete";

interface TaskActionButtonProps {
  taskId: string;
  listId?: string;
  action: ActionType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: "default" | "sm" | "icon" | "icon-sm";
  variant?: "default" | "ghost" | "outline" | "destructive";
  showLabel?: boolean;
}

export function TaskActionButton({
  taskId,
  listId,
  action,
  onSuccess,
  onError,
  size = "icon-sm",
  variant,
  showLabel = false,
}: TaskActionButtonProps) {
  const { completeTask, deleteTask } = useTaskActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      let result;
      if (action === "complete") {
        result = await completeTask(taskId, listId);
      } else {
        result = await deleteTask(taskId, listId);
      }

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Action failed";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (action === "complete") {
      return {
        icon: isLoading ? <LoadingSpinner /> : <CheckIcon />,
        label: "Complete",
        title: "Mark as complete",
        defaultVariant: "ghost" as const,
      };
    }
    return {
      icon: isLoading ? <LoadingSpinner /> : <TrashIcon />,
      label: "Delete",
      title: "Delete task",
      defaultVariant: "ghost" as const,
    };
  };

  const config = getButtonConfig();

  return (
    <Button
      variant={variant || config.defaultVariant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      title={config.title}
      className={`task-action-btn task-action-${action}`}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </Button>
  );
}

function CheckIcon() {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export default TaskActionButton;
