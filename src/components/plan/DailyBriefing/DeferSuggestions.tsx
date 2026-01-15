/**
 * DeferSuggestions Component
 *
 * Displays AI suggestions for tasks to defer/postpone.
 */

import type { PlanTask } from "./types";

interface DeferSuggestionsProps {
    suggestions: (string | PlanTask)[];
    title: string;
}

export function DeferSuggestions({ suggestions, title }: DeferSuggestionsProps) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="p-4 rounded-xl backdrop-blur-xl border-2 border-border/30 bg-card/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {title}
            </h3>
            <div className="space-y-2">
                {suggestions.map((suggestion, index) => {
                    const text =
                        typeof suggestion === "string" ? suggestion : suggestion.title;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground/80"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                            {text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DeferSuggestions;
