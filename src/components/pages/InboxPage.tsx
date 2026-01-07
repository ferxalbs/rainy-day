import type { ThreadSummary } from "../../types";
import { Skeleton } from "../ui/skeleton";

interface InboxPageProps {
  threads: ThreadSummary[];
  isLoading: boolean;
}

export function InboxPage({ threads, isLoading }: InboxPageProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <Skeleton className="h-6 w-36 bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-3 w-full bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-primary/5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-card/50">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="text-xl">📬</span>
          Priority Inbox
        </h2>
      </div>

      {/* Content */}
      {threads.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-base">Inbox zero! 🎉</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="px-5 py-4 hover:bg-accent transition-colors cursor-pointer group"
            >
              <p className="font-medium text-foreground group-hover:text-accent-foreground transition-colors line-clamp-1">
                {thread.subject || thread.snippet.slice(0, 50)}
              </p>
              <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 line-clamp-2 mt-1.5 leading-relaxed">
                {thread.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
