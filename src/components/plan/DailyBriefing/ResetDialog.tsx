/**
 * ResetDialog Component
 *
 * Alert dialog for resetting the plan and clearing all caches.
 * Uses native AlertDialog for macOS compatibility.
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

                <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            This will perform a **total system reset** for today:
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-foreground/80">
                                <li>Delete your current AI plan</li>
                                <li>Clear all cached emails and calendar events</li>
                                <li>Reset all task completion checkmarks</li>
                                <li>Force a fresh data sync from Gmail & Calendar</li>
                            </ul>
                            <p className="mt-4 font-medium text-destructive/80">
                                You will need to generate a completely new plan after the reset.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onReset}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                        >
                            Yes, Reset Everything
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default ResetDialog;
