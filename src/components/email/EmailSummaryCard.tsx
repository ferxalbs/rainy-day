/**
 * EmailSummaryCard Component
 *
 * Rich AI summary display with priority scoring, sentiment, action items,
 * entities, and suggested replies.
 */

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import {
    type EmailSummary,
    getPriorityColor,
    getPriorityLabel,
    getSentimentColor,
} from "../../services/backend/summary";

interface EmailSummaryCardProps {
    summary: EmailSummary;
    onReplyClick?: (reply: string) => void;
    onTaskClick?: (taskId: string) => void;
    onEventClick?: (eventId: string) => void;
    className?: string;
}

export function EmailSummaryCard({
    summary,
    onReplyClick,
    onTaskClick,
    onEventClick,
    className = "",
}: EmailSummaryCardProps) {
    const [actionsOpen, setActionsOpen] = useState(true);
    const [entitiesOpen, setEntitiesOpen] = useState(false);

    const hasEntities =
        summary.keyEntities.people.length > 0 ||
        summary.keyEntities.companies.length > 0 ||
        summary.keyEntities.dates.length > 0 ||
        summary.keyEntities.amounts.length > 0;

    return (
        <Card
            className={`border-blue-500/20 rounded-2xl bg-background/60 backdrop-blur-xl ${className}`}
        >
            <CardContent className="p-4 space-y-4">
                {/* Header: Priority Score + Sentiment */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${getPriorityColor(summary.priorityScore)} border-current font-semibold`}
                        >
                            {summary.priorityScore}/10 • {getPriorityLabel(summary.priorityScore)}
                        </Badge>
                        {summary.isThreadSummary && (
                            <Badge variant="secondary" className="text-xs">
                                Thread Summary
                            </Badge>
                        )}
                        {summary.cached && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                Cached
                            </Badge>
                        )}
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full text-sm ${getSentimentColor(summary.sentiment)}`}
                    >
                        {summary.sentimentEmoji} {summary.sentiment}
                    </span>
                </div>

                {/* Summary Text */}
                <p className="text-sm text-foreground leading-relaxed">
                    {summary.summary}
                </p>

                {/* Action Items */}
                {summary.actionItems.length > 0 && (
                    <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between px-2 py-1 h-8"
                            >
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                    </svg>
                                    Action Items ({summary.actionItems.length})
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${actionsOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                            {summary.actionItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 text-sm pl-2 py-1 rounded-lg bg-muted/50"
                                >
                                    <span
                                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.priority === "high"
                                                ? "bg-red-500"
                                                : item.priority === "medium"
                                                    ? "bg-yellow-500"
                                                    : "bg-blue-500"
                                            }`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-foreground">{item.action}</p>
                                        {item.dueDate && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Due: {item.dueDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Key Entities */}
                {hasEntities && (
                    <Collapsible open={entitiesOpen} onOpenChange={setEntitiesOpen}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between px-2 py-1 h-8"
                            >
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                    Key Details
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${entitiesOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                            <div className="flex flex-wrap gap-1.5">
                                {summary.keyEntities.people.map((person, idx) => (
                                    <Badge key={`person-${idx}`} variant="outline" className="text-xs">
                                        👤 {person}
                                    </Badge>
                                ))}
                                {summary.keyEntities.companies.map((company, idx) => (
                                    <Badge key={`company-${idx}`} variant="outline" className="text-xs">
                                        🏢 {company}
                                    </Badge>
                                ))}
                                {summary.keyEntities.dates.map((date, idx) => (
                                    <Badge key={`date-${idx}`} variant="outline" className="text-xs">
                                        📅 {date}
                                    </Badge>
                                ))}
                                {summary.keyEntities.amounts.map((amount, idx) => (
                                    <Badge key={`amount-${idx}`} variant="outline" className="text-xs">
                                        💰 {amount}
                                    </Badge>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Related Items */}
                {(summary.relatedTaskIds.length > 0 || summary.relatedEventIds.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                        {summary.relatedTaskIds.map((taskId) => (
                            <Badge
                                key={taskId}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => onTaskClick?.(taskId)}
                            >
                                📋 Related Task
                            </Badge>
                        ))}
                        {summary.relatedEventIds.map((eventId) => (
                            <Badge
                                key={eventId}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => onEventClick?.(eventId)}
                            >
                                📆 Related Event
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Suggested Quick Replies */}
                {summary.suggestedReplies.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                            Quick Replies
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {summary.suggestedReplies.map((reply, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 border-blue-500/30 hover:border-blue-500/50"
                                    onClick={() => onReplyClick?.(reply)}
                                >
                                    {reply.length > 40 ? `${reply.slice(0, 40)}...` : reply}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Model Used */}
                <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground/60">
                        via {summary.modelUsed}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
