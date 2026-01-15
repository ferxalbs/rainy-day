/**
 * NotificationToast Component
 *
 * Toast notifications for action feedback (success/error).
 * Displays in the top-right corner with dismiss and retry actions.
 */

import type { NotificationState } from "./types";

interface NotificationToastProps {
    notifications: NotificationState[];
    onDismiss: (id: number) => void;
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all animate-in slide-in-from-right-5 ${notification.type === "success"
                            ? "bg-green-500/90 text-white border-green-400/50"
                            : "bg-destructive/90 text-destructive-foreground border-destructive/50"
                        }`}
                >
                    <div className="flex items-start gap-2">
                        <span className="text-sm font-medium flex-1">
                            {notification.message}
                        </span>
                        {notification.action && (
                            <button
                                onClick={() => {
                                    onDismiss(notification.id);
                                    notification.action?.onClick();
                                }}
                                className="text-xs font-semibold underline underline-offset-2 hover:no-underline"
                            >
                                {notification.action.label}
                            </button>
                        )}
                        <button
                            onClick={() => onDismiss(notification.id)}
                            className="p-0.5 rounded hover:bg-white/20 transition-colors"
                            aria-label="Dismiss"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default NotificationToast;
