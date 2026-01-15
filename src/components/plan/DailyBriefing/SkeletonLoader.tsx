/**
 * SkeletonLoader Component
 *
 * Loading skeleton UI displayed during plan regeneration.
 * Shows animated placeholders for the briefing content.
 */

interface SkeletonLoaderProps {
    regeneratingText: string;
}

export function SkeletonLoader({ regeneratingText }: SkeletonLoaderProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Skeleton Card */}
            <div className="p-6 rounded-2xl backdrop-blur-xl border-2 border-border/50 bg-card/30 shadow-xl">
                {/* Skeleton Summary */}
                <div className="space-y-3 mb-6">
                    <div className="h-4 bg-muted/40 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-muted/30 rounded-lg w-5/6 animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded-lg w-4/6 animate-pulse" />
                </div>

                {/* Skeleton Action Items */}
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-3 rounded-xl bg-background/30"
                        >
                            <div className="w-5 h-5 rounded-md bg-muted/40 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div
                                    className="h-4 bg-muted/30 rounded animate-pulse"
                                    style={{ width: `${50 + i * 8}%` }}
                                />
                                <div className="flex gap-3">
                                    <div className="h-3 bg-muted/20 rounded w-16 animate-pulse" />
                                    <div className="h-3 bg-muted/20 rounded w-12 animate-pulse" />
                                </div>
                            </div>
                            <div className="w-12 h-4 bg-muted/20 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Energy Tip Skeleton */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-500/30 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-amber-500/20 rounded w-full animate-pulse" />
                        <div className="h-3 bg-amber-500/10 rounded w-3/4 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Generating indicator */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center gap-3 z-20">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span className="text-sm font-medium">{regeneratingText}</span>
            </div>
        </div>
    );
}

export default SkeletonLoader;
