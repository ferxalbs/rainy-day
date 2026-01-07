import type { Task } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface TaskPageProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TaskPage({ tasks, isLoading }: TaskPageProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-24">
      <Card className="bg-background/10 backdrop-blur-md border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">✅</span>
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending tasks
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-4 rounded-lg bg-background/5 border border-white/5 hover:bg-background/10 hover:border-blue-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      readOnly
                      className="mt-0.5 w-4 h-4 rounded border-blue-500/50 bg-background/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <span
                        className={`font-medium text-sm block ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.due && (
                        <span className="text-xs text-muted-foreground block">
                          Due: {new Date(task.due).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
