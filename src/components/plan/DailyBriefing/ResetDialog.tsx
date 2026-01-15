/**
 * ResetDialog Component
 *
 * Premium macOS-style alert dialog for resetting the plan and clearing all caches.
 * Features glassmorphism design with backdrop blur.
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../ui/alert-dialog";

interface ResetDialogProps {
    isClearing: boolean;
    onReset: () => Promise<void>;
}

export function ResetDialog({ isClearing, onReset }: ResetDialogProps) {
    return (
        <div className="pt-6 border-t border-border/30 mt-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        disabled={isClearing}
                        className="w-full py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20 transition-all disabled:opacity-50"
                    >
                        {isClearing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                                Resetting System...
                            </span>
                        ) : (
                            "Reset Plan & Clear All Cache"
                        )}
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card/25 backdrop-blur-xl border-border/50 shadow-2xl max-w-md p-0 overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300">
                    <div className="p-6 space-y-6">
                        <AlertDialogHeader className="space-y-3">
                            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[15px] text-muted-foreground leading-relaxed">
                                This will perform a{" "}
                                <span className="text-foreground font-semibold">
                                    total system reset
                                </span>{" "}
                                for today:
                                <ul className="list-none mt-4 space-y-2">
                                    {[
                                        "Delete your current AI plan",
                                        "Clear all cached emails and events",
                                        "Reset all task completions",
                                        "Force a fresh data sync",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-6 p-4 rounded-xl bg-destructive/50 text-primary border border-destructive/10 font-medium text-sm text-center">
                                    You will need to generate a completely new plan after the
                                    reset.
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-3">
                            <AlertDialogCancel className="rounded-xl px-4 py-2 border-border/30 bg-background/50 hover:bg-background transition-colors">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onReset}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-4 py-2 shadow-sm transition-colors font-medium"
                            >
                                Yes, Reset Everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ResetDialog;
