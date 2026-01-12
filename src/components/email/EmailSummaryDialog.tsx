/**
 * EmailSummaryDialog Component
 *
 * Premium floating dialog for AI email summary display.
 * Uses theme-adaptive colors for consistency with global theme.
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
import type { EmailSummary } from "../../services/backend/summary";

interface EmailSummaryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    summary: EmailSummary | null;
    emailSubject?: string;
    isLoading?: boolean;
}

// Priority label based on score
function getPriorityLabel(score: number): string {
    if (score >= 9) return "Critical";
    if (score >= 7) return "High";
    if (score >= 5) return "Medium";
    if (score >= 3) return "Low";
    return "Very Low";
}

export function EmailSummaryDialog({
    open,
    onOpenChange,
    summary,
    emailSubject,
    isLoading = false,
}: EmailSummaryDialogProps) {
    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg border-2 border-primary/20 rounded-2xl bg-background/25 backdrop-blur-xl">
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative w-14 h-14">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <div className="absolute inset-2 rounded-full border-2 border-muted border-b-primary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
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

    const priorityLabel = getPriorityLabel(summary.priorityScore);

    // Check if we have any key information
    const hasKeyInfo =
        summary.keyEntities.people.length > 0 ||
        summary.keyEntities.companies.length > 0 ||
        summary.keyEntities.dates.length > 0 ||
        summary.keyEntities.amounts.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl border-2 border-primary/20 rounded-2xl bg-background/25 backdrop-blur-xl p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                    <DialogTitle className="text-base font-semibold text-foreground line-clamp-2 pr-8">
                        {emailSubject || "Email Summary"}
                    </DialogTitle>

                    {/* Status Badges - Theme Colors Only */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge
                            variant="outline"
                            className="border-primary/50 text-primary text-xs font-semibold px-2.5 py-0.5"
                        >
                            Priority {summary.priorityScore}/10 • {priorityLabel}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="text-xs font-medium"
                        >
                            {summary.sentimentEmoji} {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
                        </Badge>
                        {summary.isThreadSummary && (
                            <Badge variant="outline" className="text-xs border-muted-foreground/30">
                                Thread
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="px-6 py-5 space-y-5">

                        {/* Summary Section */}
                        <section>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Summary
                            </h3>
                            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                <p className="text-sm text-foreground leading-relaxed">
                                    {summary.summary}
                                </p>
                            </div>
                        </section>

                        {/* Action Items Section */}
                        {summary.actionItems.length > 0 && (
                            <>
                                <Separator className="opacity-30" />
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            Action Items
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {summary.actionItems.length} item{summary.actionItems.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {summary.actionItems.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                                            >
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground">{item.action}</p>
                                                    {item.dueDate && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Due: {item.dueDate}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] border-muted-foreground/30 capitalize flex-shrink-0">
                                                    {item.priority}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        )}

                        {/* Key Information Section */}
                        {hasKeyInfo && (
                            <>
                                <Separator className="opacity-30" />
                                <section>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                        Key Information
                                    </h3>
                                    <div className="space-y-3">
                                        {summary.keyEntities.people.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-1">People</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.people.map((p, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.companies.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-1">Companies</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.companies.map((c, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                            {c}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.dates.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-1">Dates</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.dates.map((d, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                            {d}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {summary.keyEntities.amounts.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-1">Amounts</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {summary.keyEntities.amounts.map((a, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                            {a}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between bg-muted/10">
                    <span className="text-[10px] text-muted-foreground/60">
                        {summary.modelUsed}
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
