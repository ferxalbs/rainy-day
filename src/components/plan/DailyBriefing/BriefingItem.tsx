/**
 * BriefingItem Component
 *
 * Individual task/item row in the daily briefing list.
 * Displays task info with checkbox, type icon, and action buttons.
 */

import { useState } from "react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../ui/tooltip";
import { Checkbox } from "../../ui/checkbox";
import type { BriefingItemProps, ItemFeedbackType } from "./types";
import {
    ClockIcon,
    ArchiveIcon,
    MarkReadIcon,
    TaskPlusIcon,
    VideoIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    SpinnerIcon,
} from "./icons";

export function BriefingItem({
    task,
    isCompleted = false,
    onComplete,
    onFeedback,
    formatTime,
    getTypeIcon,
    getPriorityColor,
    onArchiveEmail,
    onMarkAsRead,
    onConvertToTask,
    emailLoadingState,
    isOptimisticallyRead = false,
}: BriefingItemProps) {
    const [feedbackGiven, setFeedbackGiven] = useState<ItemFeedbackType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEmail = task.type === "email" || task.source_type === "email";
    const isMeeting = task.type === "meeting";

    // Use task.id as identifier (more reliable than source_id)
    const taskIdentifier = task.id;

    const handleToggleComplete = () => {
        if (onComplete && taskIdentifier) {
            onComplete(taskIdentifier);
        }
    };

    const handleFeedback = async (type: ItemFeedbackType) => {
        if (!onFeedback || isSubmitting) return;
        setIsSubmitting(true);

        const itemType =
            task.type === "focus"
                ? "focus_block"
                : task.type === "meeting"
                    ? "meeting"
                    : "quick_win";

        const success = await onFeedback(task.id, task.title, type, itemType);
        if (success) {
            setFeedbackGiven(type);
        }
        setIsSubmitting(false);
    };

    const formattedTime = formatTime(task.suggested_time);

    return (
        <div
            className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-card/40 transition-all border border-transparent hover:border-border/40 ${isCompleted || isOptimisticallyRead ? "opacity-50" : ""
                }`}
        >
            {/* Checkbox - Show for all items so users can track completion */}
            <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="mt-1 w-4 h-4 rounded border-2 border-muted-foreground/40 accent-primary cursor-pointer"
            />

            {/* Type Icon */}
            <div className="mt-0.5">{getTypeIcon(task)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`font-medium text-foreground text-sm ${isCompleted ? "line-through opacity-60" : ""
                            }`}
                    >
                        {task.title}
                    </span>
                    <span
                        className={`text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(
                            task.priority
                        )}`}
                    >
                        {task.priority}
                    </span>
                </div>

                {/* Time & Duration */}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {formattedTime && (
                        <span className="flex items-center gap-1">
                            <ClockIcon />
                            {formattedTime}
                        </span>
                    )}
                    {task.duration_minutes > 0 && (
                        <span>{task.duration_minutes} min</span>
                    )}
                </div>

                {/* Context */}
                {task.context && (
                    <p className="mt-1.5 text-xs text-foreground/50 leading-relaxed">
                        {task.context}
                    </p>
                )}
            </div>

            {/* Action Buttons - appear on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Email Actions */}
                {isEmail && task.source_id && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onArchiveEmail?.(task.source_id!)}
                                    disabled={emailLoadingState?.archive}
                                >
                                    {emailLoadingState?.archive ? <SpinnerIcon /> : <ArchiveIcon />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Archive</TooltipContent>
                        </Tooltip>

                        {!isOptimisticallyRead && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onMarkAsRead?.(task.source_id!)}
                                        disabled={emailLoadingState?.markRead}
                                    >
                                        {emailLoadingState?.markRead ? <SpinnerIcon /> : <MarkReadIcon />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark as Read</TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onConvertToTask?.(task.source_id!)}
                                    disabled={emailLoadingState?.toTask}
                                >
                                    {emailLoadingState?.toTask ? <SpinnerIcon /> : <TaskPlusIcon />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Convert to Task</TooltipContent>
                        </Tooltip>
                    </>
                )}

                {/* Meeting Actions */}
                {isMeeting && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                                <VideoIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Join Meeting</TooltipContent>
                    </Tooltip>
                )}

                {/* Feedback Buttons */}
                {onFeedback && !feedbackGiven && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleFeedback("positive")}
                                    disabled={isSubmitting}
                                    className={feedbackGiven === "positive" ? "text-green-500" : ""}
                                >
                                    <ThumbsUpIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Helpful</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleFeedback("negative")}
                                    disabled={isSubmitting}
                                    className={feedbackGiven === "negative" ? "text-destructive" : ""}
                                >
                                    <ThumbsDownIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Not helpful</TooltipContent>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
}

export default BriefingItem;
