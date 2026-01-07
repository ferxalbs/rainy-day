import type { ThreadSummary } from "../../types";
import { Skeleton } from "../ui/skeleton";

interface InboxPageProps {
  threads: ThreadSummary[];
  isLoading: boolean;
}

export function InboxPage({ threads, isLoading }: InboxPageProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <Skeleton className="h-6 w-36 bg-slate-800" />
        </div>
        <div className="divide-y divide-slate-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-slate-800" />
              <Skeleton className="h-3 w-full bg-slate-800/60" />
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
          <span className="text-xl">📬</span>
          Priority Inbox
        </h2>
      </div>

      {/* Content */}
      {threads.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-base">Inbox zero! 🎉</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="px-5 py-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <p className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {thread.subject || thread.snippet.slice(0, 50)}
              </p>
              <p className="text-sm text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                {thread.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
