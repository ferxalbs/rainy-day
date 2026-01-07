import type { Task } from "../../types";
import { Skeleton } from "../ui/skeleton";
import { Circle, CheckCircle2 } from "lucide-react";

interface TaskPageProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TaskPage({ tasks, isLoading }: TaskPageProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <Skeleton className="h-6 w-24 bg-slate-800" />
        </div>
        <div className="divide-y divide-slate-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 flex items-start gap-4">
              <Skeleton className="h-5 w-5 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-28 bg-slate-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-blue-500/5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-3">
          <span className="text-xl">✅</span>
          Tasks
        </h2>
      </div>

      {/* Content */}
      {tasks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-base">No pending tasks</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {tasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className="px-5 py-4 hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="pt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium transition-colors ${
                        isCompleted
                          ? "line-through text-slate-500"
                          : "text-white group-hover:text-blue-400"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.due && (
                      <p className="text-sm text-slate-400 mt-1 font-medium">
                        Due: {new Date(task.due).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
