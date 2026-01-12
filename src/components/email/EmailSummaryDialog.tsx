/**
 * EmailSummaryDialog Component
 *
 * Premium floating dialog for AI email summary display.
 * Clean, organized design with clear sections and bullet points.
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
    type EmailSummary,
    getPriorityColor,
    getPriorityLabel,
} from "../../services/backend/summary";

interface EmailSummaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    summary: EmailSummary | null;
    emailSubject?: string;
    isLoading?: boolean;
    onReplyClick?: (reply: string) => void;
}

export function EmailSummaryDialog({
    open,
    onOpenChange,
    summary,
    emailSubject,
    isLoading = false,
    onReplyClick,
}: EmailSummaryDialogProps) {
    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg border-2 border-blue-500/20 rounded-2xl bg-background/95 backdrop-blur-xl">
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative w-14 h-14">
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                            <div className="absolute inset-2 rounded-full border-2 border-primary/20 border-b-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-foreground">Analyzing email...</p>
                            <p className="text-xs text-muted-foreground">Extracting key information</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!summary) return null;

    // Determine priority styling
    const priorityColor = getPriorityColor(summary.priorityScore);
    const priorityLabel = getPriorityLabel(summary.priorityScore);

    const sentimentConfig: Record<string, { bg: string; text: string }> = {
        urgent: { bg: "bg-red-500/10", text: "text-red-400" },
        friendly: { bg: "bg-green-500/10", text: "text-green-400" },
        formal: { bg: "bg-blue-500/10", text: "text-blue-400" },
        frustrated: { bg: "bg-orange-500/10", text: "text-orange-400" },
        neutral: { bg: "bg-gray-500/10", text: "text-gray-400" },
    };

    const sentiment = sentimentConfig[summary.sentiment] || sentimentConfig.neutral;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl border-2 border-blue-500/20 rounded-2xl bg-background/95 backdrop-blur-xl p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                    <DialogTitle className="text-base font-semibold text-foreground line-clamp-2 pr-8">
                        {emailSubject || "Email Summary"}
                    </DialogTitle>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge
                            variant="outline"
                            className={`${priorityColor} border-current text-xs font-semibold px-2.5 py-0.5`}
                        >
                            Priority {summary.priorityScore}/10 • {priorityLabel}
                        </Badge>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${sentiment.bg} ${sentiment.text} font-medium`}>
                            {summary.sentimentEmoji} {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
                        </span>
                        {summary.isThreadSummary && (
                            <Badge variant="secondary" className="text-xs">📧 Thread</Badge>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[65vh]">
                    <div className="px-6 py-5 space-y-6">

                        {/* General Summary Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">📝</span>
                                <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                            </div>
                            <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                    {summary.summary}
                                </p>
                            </div>
                        </section>

                        {/* Action Items Section */}
                        {summary.actionItems.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-base">✅</span>
                                    <h3 className="text-sm font-semibold text-foreground">Action Items</h3>
                                    <Badge variant="secondary" className="text-[10px] ml-auto">
                                        {summary.actionItems.length}
                                    </Badge>
                                </div>
                                <ul className="space-y-2">
                                    {summary.actionItems.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                                        >
                                            <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.priority === "high" ? "bg-red-500" :
                                                    item.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground">{item.action}</p>
                                                {item.dueDate && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        ⏰ {item.dueDate}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Key Information Section */}
                        {(summary.keyEntities.people.length > 0 ||
                            summary.keyEntities.companies.length > 0 ||
                            summary.keyEntities.dates.length > 0 ||
                            summary.keyEntities.amounts.length > 0) && (
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base">🔍</span>
                                        <h3 className="text-sm font-semibold text-foreground">Key Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {summary.keyEntities.people.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">People:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.people.map((p, i) => (
                                                        <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.companies.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Companies:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.companies.map((c, i) => (
                                                        <span key={i} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.dates.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Dates:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.dates.map((d, i) => (
                                                        <span key={i} className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md">
                                                            {d}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.amounts.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Amounts:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.amounts.map((a, i) => (
                                                        <span key={i} className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-md">
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                        <Separator className="opacity-30" />

                        {/* Quick Replies Section */}
                        {summary.suggestedReplies.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-base">💬</span>
                                    <h3 className="text-sm font-semibold text-foreground">Quick Replies</h3>
                                    <span className="text-[10px] text-muted-foreground ml-auto">Click to copy</span>
                                </div>
                                <div className="grid gap-2">
                                    {summary.suggestedReplies.map((reply, idx) => (
                                        <Button
                                            key={idx}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-left h-auto py-2.5 px-3 bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-blue-500/30 rounded-lg transition-all group"
                                            onClick={() => onReplyClick?.(reply)}
                                        >
                                            <span className="text-xs text-muted-foreground mr-2 group-hover:text-blue-400 transition-colors">
                                                {idx + 1}.
                                            </span>
                                            <span className="text-sm text-foreground/80 group-hover:text-foreground truncate">
                                                {reply}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                    <span className="text-[10px] text-muted-foreground/60">
                        Powered by {summary.modelUsed}
                        {summary.cached && " • Cached"}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
