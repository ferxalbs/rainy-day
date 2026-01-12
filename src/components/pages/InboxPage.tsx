import { useState, useCallback, useEffect } from "react";
import type { ThreadSummary } from "../../types";
import { Skeleton } from "../ui/skeleton";
import { EmailActionBar } from "../plan/EmailActionBar";
import { useEmailActions } from "../../hooks/useEmailActions";
import { EmailSummaryDialog } from "../email/EmailSummaryDialog";
import { SummaryButton, SummaryQuotaDisplay } from "../email/SummaryButton";
import { useSummary } from "../../hooks/useSummary";
import type { EmailSummary } from "../../services/backend/summary";

interface InboxPageProps {
  threads: ThreadSummary[];
  isLoading: boolean;
  onRefresh?: () => void;
}

/**
 * Notification state for displaying success/error messages
 */
interface NotificationState {
  type: "success" | "error";
  message: string;
  id: number;
}

export function InboxPage({ threads, isLoading, onRefresh }: InboxPageProps) {
  const {
    archiveEmail,
    markAsRead,
    convertToTask,
    loadingStates,
  } = useEmailActions();

  // Summary state
  const {
    summary,
    limits,
    isGenerating,
    generate,
    refreshLimits,
    error: summaryError
  } = useSummary();

  // Track which email has expanded summary
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
  // Store summaries per email
  const [summaries, setSummaries] = useState<Record<string, EmailSummary>>({});
  // Dialog open state
  const [dialogOpen, setDialogOpen] = useState(false);
  // Currently selected email subject for dialog
  const [selectedEmailSubject, setSelectedEmailSubject] = useState<string>("");

  // Notification state
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Track archived emails for optimistic UI
  const [archivedEmails, setArchivedEmails] = useState<Set<string>>(new Set());
  // Track read emails for optimistic UI
  const [readEmails, setReadEmails] = useState<Set<string>>(new Set());

  // Load limits on mount
  useEffect(() => {
    refreshLimits();
  }, [refreshLimits]);

  // Update summaries when a new one is generated
  useEffect(() => {
    if (summary && expandedSummaryId) {
      setSummaries(prev => ({ ...prev, [expandedSummaryId]: summary }));
    }
  }, [summary, expandedSummaryId]);

  // Show summary error as notification
  useEffect(() => {
    if (summaryError) {
      showNotification("error", summaryError);
    }
  }, [summaryError]);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const handleGenerateSummary = useCallback(async (emailId: string, subject?: string) => {
    setExpandedSummaryId(emailId);
    setSelectedEmailSubject(subject || "");
    setDialogOpen(true);
    const success = await generate(emailId);
    if (success) {
      showNotification("success", "✨ AI Summary generated");
    }
    return success;
  }, [generate, showNotification]);

  const handleArchive = useCallback(async (emailId: string) => {
    // Optimistic update
    setArchivedEmails((prev) => new Set(prev).add(emailId));

    const result = await archiveEmail(emailId);
    if (result.success) {
      showNotification("success", "📥 Email archived");
      onRefresh?.();
    } else {
      // Rollback
      setArchivedEmails((prev) => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
      showNotification("error", result.message || "Failed to archive");
    }
  }, [archiveEmail, showNotification, onRefresh]);

  const handleMarkRead = useCallback(async (emailId: string) => {
    // Optimistic update
    setReadEmails((prev) => new Set(prev).add(emailId));

    const result = await markAsRead(emailId);
    if (result.success) {
      showNotification("success", "✓ Marked as read");
    } else {
      // Rollback
      setReadEmails((prev) => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
      showNotification("error", result.message || "Failed to mark as read");
    }
  }, [markAsRead, showNotification]);

  const handleConvertToTask = useCallback(async (emailId: string) => {
    const result = await convertToTask(emailId);
    if (result.success && result.data) {
      showNotification("success", `✅ Task created: "${result.data.task_title}"`);
      // Refresh to show the new task in the task list
      onRefresh?.();
    } else {
      showNotification("error", result.message || "Failed to create task");
    }
  }, [convertToTask, showNotification, onRefresh]);

  // Filter out archived emails
  const visibleThreads = threads.filter((t) => !archivedEmails.has(t.id));
  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden">
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
    <div className="rounded-2xl border-2 border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-xl shadow-primary/5">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all animate-in slide-in-from-right-5 ${notification.type === "success"
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
      <div className="px-5 py-4 border-b border-border bg-card/30 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
          <span className="text-xl">📬</span>
          Priority Inbox
          {visibleThreads.length > 0 && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/30 px-2.5 py-1 rounded-full">
              {visibleThreads.length}
            </span>
          )}
        </h2>
        {/* Summary Quota Display */}
        {limits && (
          <SummaryQuotaDisplay remaining={limits.remaining} limit={limits.limit} />
        )}
      </div>

      {/* Content */}
      {visibleThreads.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-base">Inbox zero! 🎉</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleThreads.map((thread) => {
            const isOptimisticallyRead = readEmails.has(thread.id);
            const isRead = isOptimisticallyRead || !thread.is_unread;
            const loadingState = loadingStates[thread.id];
            const hasSummary = !!summaries[thread.id];

            return (
              <div key={thread.id}>
                <div
                  className={`px-5 py-4 hover:bg-accent transition-colors group flex items-start gap-4 ${isRead ? "opacity-60" : ""
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-foreground group-hover:text-accent-foreground transition-colors line-clamp-1 ${isRead ? "font-normal" : "font-medium"
                        }`}>
                        {thread.subject || thread.snippet.slice(0, 50)}
                      </p>
                      {!isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" title="Unread" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 line-clamp-2 mt-1.5 leading-relaxed">
                      {thread.snippet}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {thread.from_name || thread.from_email}
                    </p>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {/* AI Summary Button */}
                    <SummaryButton
                      emailId={thread.id}
                      emailSubject={thread.subject || thread.snippet.slice(0, 50)}
                      onGenerate={handleGenerateSummary}
                      isLoading={isGenerating && expandedSummaryId === thread.id}
                      remaining={limits?.remaining}
                      limit={limits?.limit}
                      hasSummary={hasSummary}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    {/* Email Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <EmailActionBar
                        email={{
                          id: thread.id,
                          subject: thread.subject || thread.snippet.slice(0, 50),
                          isUnread: !isRead,
                        }}
                        onArchive={() => handleArchive(thread.id)}
                        onMarkRead={!isRead ? () => handleMarkRead(thread.id) : undefined}
                        onConvertToTask={() => handleConvertToTask(thread.id)}
                        loadingState={loadingState}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Summary Dialog */}
      <EmailSummaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        summary={expandedSummaryId ? summaries[expandedSummaryId] : null}
        emailSubject={selectedEmailSubject}
        isLoading={isGenerating}
        onReplyClick={(reply) => {
          navigator.clipboard.writeText(reply);
          showNotification("success", "📋 Reply copied to clipboard");
        }}
      />
    </div>
  );
}
