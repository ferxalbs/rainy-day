import type { ThreadSummary } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface InboxPageProps {
  threads: ThreadSummary[];
  isLoading: boolean;
}

export function InboxPage({ threads, isLoading }: InboxPageProps) {
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
            <span className="text-2xl">📬</span>
            Priority Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inbox zero! 🎉
            </p>
          ) : (
            <ul className="space-y-3">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="p-4 rounded-lg bg-background/5 border border-white/5 hover:bg-background/10 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="space-y-1">
                    <span className="font-medium text-sm text-foreground group-hover:text-blue-400 transition-colors">
                      {thread.subject || thread.snippet.slice(0, 50)}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {thread.snippet}
                    </p>
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
