/**
 * EmptyState Component
 *
 * Displayed when there are no action items in the plan.
 * Provides a button to generate a new plan.
 */

interface EmptyStateProps {
    dayClearTitle: string;
    dayClearDescription: string;
    generatePlanText: string;
    isGenerating: boolean;
    onGenerate: () => void;
}

export function EmptyState({
    dayClearTitle,
    dayClearDescription,
    generatePlanText,
    isGenerating,
    onGenerate,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
                {dayClearTitle}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {dayClearDescription}
            </p>
            <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
                {isGenerating ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Generating...
                    </>
                ) : (
                    <>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        {generatePlanText}
                    </>
                )}
            </button>
        </div>
    );
}

export default EmptyState;
