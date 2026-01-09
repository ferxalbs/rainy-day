/**
 * UpdateModal Component
 *
 * Modal for displaying update availability, download progress, and install actions.
 * Uses glassmorphism design with Tailwind CSS v4.
 */

import { useEffect } from "react";
import { useUpdate } from "../../hooks/useUpdate";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateModal({ isOpen, onClose }: UpdateModalProps) {
  const {
    status,
    updateInfo,
    progress,
    error,
    check,
    download,
    install,
    dismiss,
    clearError,
  } = useUpdate();

  // Check for updates when modal opens
  useEffect(() => {
    if (isOpen && status === "idle") {
      check();
    }
  }, [isOpen, status, check]);

  const handleClose = () => {
    dismiss();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-card/10 backdrop-blur-xl border-2 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            Software Update
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content based on status */}
        {status === "checking" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Checking for updates...</p>
          </div>
        )}

        {status === "up-to-date" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <span className="text-5xl">✅</span>
            <div className="text-center">
              <p className="text-foreground font-medium">You're up to date!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Rainy Day {updateInfo?.currentVersion || "latest"} is the newest
                version.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              OK
            </button>
          </div>
        )}

        {status === "available" && updateInfo && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="font-semibold text-foreground">
                    Version {updateInfo.version} Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current: {updateInfo.currentVersion}
                  </p>
                </div>
              </div>
            </div>

            {/* Release Notes */}
            {updateInfo.body && (
              <div className="max-h-40 overflow-y-auto p-3 rounded-xl bg-muted/20 border border-border/30">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  What's New
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {updateInfo.body}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                Later
              </button>
              <button
                onClick={download}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Download Update
              </button>
            </div>
          </div>
        )}

        {status === "downloading" && progress && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-foreground font-medium mb-1">
                Downloading Update...
              </p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(progress.downloaded)} /{" "}
                {formatBytes(progress.total)}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <p className="text-center text-2xl font-bold text-primary">
              {progress.percentage}%
            </p>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">📦</span>
              <div className="text-center">
                <p className="text-foreground font-medium">Ready to Install</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The update has been downloaded. Rainy Day will restart to
                  apply the update.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                Later
              </button>
              <button
                onClick={install}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                Restart & Install
              </button>
            </div>
          </div>
        )}

        {status === "installing" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            <p className="text-foreground font-medium">Installing update...</p>
            <p className="text-sm text-muted-foreground">
              Rainy Day will restart shortly.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">❌</span>
              <div className="text-center">
                <p className="text-destructive font-medium">Update Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  clearError();
                  check();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
