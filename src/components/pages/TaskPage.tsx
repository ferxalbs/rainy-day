import { useState, useCallback } from "react";
import type { Task } from "../../services/backend/data";
import { Skeleton } from "../ui/skeleton";
import { Circle, CheckCircle2, Trash2, Plus } from "lucide-react";
import { completeTask, deleteTask, createTask } from "../../services/backend";

interface TaskPageProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh?: () => void;
}

interface NotificationState {
  type: "success" | "error";
  message: string;
  id: number;
}

export function TaskPage({ tasks, isLoading, onRefresh }: TaskPageProps) {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [deletedTasks, setDeletedTasks] = useState<Set<string>>(new Set());
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const handleToggleComplete = useCallback(async (task: Task) => {
    // Use google_task_id for Google Tasks API
    const taskId = task.google_task_id;
    if (!taskId) {
      showNotification("error", "Task ID not found");
      return;
    }
    
    // Optimistic update
    setLoadingTasks((prev) => new Set(prev).add(task.id));
    
    if (task.status === "completed") {
      showNotification("error", "Uncomplete not supported yet");
      setLoadingTasks((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      return;
    }

    setCompletedTasks((prev) => new Set(prev).add(task.id));

    const result = await completeTask(taskId);
    
    setLoadingTasks((prev) => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });

    if (result.success) {
      showNotification("success", `✓ "${task.title}" completed`);
      onRefresh?.();
    } else {
      // Rollback
      setCompletedTasks((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      showNotification("error", result.message || "Failed to complete task");
    }
  }, [showNotification, onRefresh]);

  const handleDelete = useCallback(async (task: Task) => {
    // Use google_task_id for Google Tasks API
    const taskId = task.google_task_id;
    if (!taskId) {
      showNotification("error", "Task ID not found");
      return;
    }
    
    // Optimistic update
    setLoadingTasks((prev) => new Set(prev).add(task.id));
    setDeletedTasks((prev) => new Set(prev).add(task.id));

    const result = await deleteTask(taskId);
    
    setLoadingTasks((prev) => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });

    if (result.success) {
      showNotification("success", `🗑️ Task deleted`);
      onRefresh?.();
    } else {
      // Rollback
      setDeletedTasks((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      showNotification("error", result.message || "Failed to delete task");
    }
  }, [showNotification, onRefresh]);

  const handleCreateTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsCreating(true);
    
    const result = await createTask({ title: newTaskTitle.trim() });
    
    setIsCreating(false);

    if (result.success) {
      showNotification("success", `✅ Task created`);
      setNewTaskTitle("");
      setShowInput(false);
      onRefresh?.();
    } else {
      showNotification("error", result.message || "Failed to create task");
    }
  }, [newTaskTitle, showNotification, onRefresh]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setNewTaskTitle("");
    }
  }, [handleCreateTask]);

  // Filter out deleted tasks
  const visibleTasks = tasks.filter((t) => !deletedTasks.has(t.id));

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <Skeleton className="h-6 w-24 bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 flex items-start gap-4">
              <Skeleton className="h-5 w-5 rounded-full bg-muted" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-28 bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-primary/5">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all animate-in slide-in-from-right-5 ${
                notification.type === "success"
                  ? "bg-green-500/90 text-white border-green-400/50"
                  : "bg-destructive/90 text-destructive-foreground border-destructive/50"
              }`}
            >
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-card/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="text-xl">✅</span>
          Tasks
          {visibleTasks.length > 0 && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/30 px-2.5 py-1 rounded-full">
              {visibleTasks.filter(t => t.status !== "completed" && !completedTasks.has(t.id)).length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowInput(true)}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="Add task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Add Input */}
      {showInput && (
        <div className="px-5 py-3 border-b border-border bg-accent/30">
          <div className="flex items-center gap-3">
            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
              disabled={isCreating}
            />
            <button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim() || isCreating}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isCreating ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setNewTaskTitle("");
              }}
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {visibleTasks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-base mb-4">No pending tasks</p>
          <button
            onClick={() => setShowInput(true)}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            + Add your first task
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleTasks.map((task) => {
            const isCompleted = task.status === "completed" || completedTasks.has(task.id);
            const isTaskLoading = loadingTasks.has(task.id);
            
            return (
              <div
                key={task.id}
                className={`px-5 py-4 hover:bg-accent transition-colors group ${
                  isTaskLoading ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    disabled={isTaskLoading}
                    className="pt-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full disabled:cursor-not-allowed"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium transition-colors ${
                        isCompleted
                          ? "line-through text-muted-foreground"
                          : "text-foreground group-hover:text-accent-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.due && (
                      <p className={`text-sm mt-1 font-medium transition-colors ${
                        isCompleted 
                          ? "text-muted-foreground/60" 
                          : "text-muted-foreground group-hover:text-accent-foreground/80"
                      }`}>
                        Due: {new Date(task.due).toLocaleDateString()}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(task)}
                    disabled={isTaskLoading}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:cursor-not-allowed"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
