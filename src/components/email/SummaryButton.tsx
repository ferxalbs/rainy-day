/**
 * SummaryButton Component
 *
 * Button to trigger email AI summarization with quota display.
 */

import { Button } from "../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

interface SummaryButtonProps {
    emailId: string;
    emailSubject?: string;
    onGenerate: (emailId: string, subject?: string) => Promise<boolean>;
    onView?: (emailId: string, subject?: string) => void;
    isLoading?: boolean;
    remaining?: number;
    limit?: number;
    hasSummary?: boolean;
    className?: string;
}

export function SummaryButton({
    emailId,
    emailSubject,
    onGenerate,
    onView,
    isLoading = false,
    remaining,
    limit,
    hasSummary = false,
    className = "",
}: SummaryButtonProps) {
    const canGenerate = remaining === undefined || remaining > 0;
    const showQuota = remaining !== undefined && limit !== undefined;

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click

        if (hasSummary && onView) {
            onView(emailId, emailSubject);
            return;
        }

        if (!canGenerate || isLoading) return;
        await onGenerate(emailId, emailSubject);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={hasSummary ? "secondary" : "outline"} // Distinct style for View
                        size="sm"
                        onClick={handleClick}
                        disabled={(!hasSummary && !canGenerate) || isLoading}
                        className={`h-7 text-xs border-blue-500/30 hover:border-blue-500/50 ${className}`}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="w-3 h-3 mr-1 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Summarizing...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                {hasSummary ? "View Summary" : "AI Summary"}
                            </>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {!canGenerate ? (
                        <span className="text-red-400">
                            Daily limit reached. Upgrade for more summaries.
                        </span>
                    ) : showQuota ? (
                        <span>
                            {remaining} of {limit} summaries remaining today
                        </span>
                    ) : (
                        <span>Generate AI summary for this email</span>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * SummaryQuotaDisplay Component
 *
 * Shows remaining quota as a compact badge.
 */
interface SummaryQuotaDisplayProps {
    remaining: number;
    limit: number;
    className?: string;
}

export function SummaryQuotaDisplay({
    remaining,
    limit,
    className = "",
}: SummaryQuotaDisplayProps) {
    const percentage = (remaining / limit) * 100;
    const colorClass =
        percentage > 50
            ? "text-green-500"
            : percentage > 20
                ? "text-yellow-500"
                : "text-red-500";

    return (
        <div className={`flex items-center gap-1.5 text-xs ${className}`}>
            <svg
                className={`w-3.5 h-3.5 ${colorClass}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
            <span className="text-muted-foreground">
                <span className={colorClass}>{remaining}</span>/{limit} summaries
            </span>
        </div>
    );
}
