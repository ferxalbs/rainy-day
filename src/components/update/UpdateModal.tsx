/**
 * UpdateModal Component
 *
 * Modal for displaying mandatory update availability, download progress, and install actions.
 * Shows release notes from RELEASE_NOTES.md for the specific version.
 * Uses glassmorphism design following the CodexBar update modal style.
 *
 * Updates are MANDATORY - users cannot skip or dismiss when an update is available.
 */

import { useEffect, useState } from "react";
import { useUpdate } from "../../hooks/useUpdate";

// =============================================================================
// Icons (Clean SVG)
// =============================================================================

function AppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* Rain cloud icon */}
      <rect
        x="8"
        y="12"
        width="32"
        height="24"
        rx="12"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M16 28v8M24 28v12M32 28v8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
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
  );
}

function CheckIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-green-500"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-destructive"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-primary"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

// =============================================================================
// Main Component
// =============================================================================

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

  const [releaseNotes, setReleaseNotes] = useState<string[]>([]);

  // Check for updates when modal opens
  useEffect(() => {
    if (isOpen && status === "idle") {
      check();
    }
  }, [isOpen, status, check]);

  // Fetch and parse release notes when update is available
  useEffect(() => {
    if (status === "available" && updateInfo?.version) {
      /**
       * Parse bullet points from markdown content
       * Handles formats: "- **text**", "- text", "* text"
       */
      const parseNotesFromMarkdown = (content: string): string[] => {
        const notes: string[] = [];
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          // Match lines starting with - or *
          if (/^[-*]\s+/.test(trimmed)) {
            // Clean markdown formatting: remove **, `, and leading bullet
            const clean = trimmed
              .replace(/^[-*]\s+/, "")
              .replace(/\*\*/g, "")
              .replace(/`/g, "")
              .trim();
            if (clean.length > 0) {
              notes.push(clean);
            }
          }
        }
        return notes;
      };

      /**
       * Fetch release notes for a specific version from GitHub
       */
      const fetchNotesFromGitHub = async (version: string): Promise<string[]> => {
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/ferxalbs/rainy-day/main/RELEASE_NOTES.md`
          );
          if (!response.ok) return [];
          const content = await response.text();

          // Find the section for this version
          // Escape ALL regex special characters to prevent injection
          const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escapedVersion = escapeRegex(version);
          // Match "## Rainy Day X.Y.Z" followed by anything (emoji, etc) until next section or end
          const versionPattern = new RegExp(
            `## Rainy Day ${escapedVersion}[^\\n]*[\\s\\S]*?(?=## Rainy Day|$)`,
            "i"
          );
          const match = content.match(versionPattern);
          if (match) {
            return parseNotesFromMarkdown(match[0]);
          }
          return [];
        } catch {
          return [];
        }
      };

      // Try to parse from body first
      if (updateInfo.body && updateInfo.body.trim().length > 0) {
        const notes = parseNotesFromMarkdown(updateInfo.body);
        if (notes.length > 0) {
          setReleaseNotes(notes);
          return;
        }
      }

      // Fallback: Try to fetch from GitHub RELEASE_NOTES.md
      fetchNotesFromGitHub(updateInfo.version).then((notes) => {
        if (notes.length > 0) {
          setReleaseNotes(notes);
        } else {
          // Final fallback
          setReleaseNotes(["Performance improvements and bug fixes."]);
        }
      });
    }
  }, [status, updateInfo]);

  // For mandatory updates, only allow close when up-to-date or error
  const canClose = status === "up-to-date" || status === "error";

  const handleClose = () => {
    if (canClose) {
      dismiss();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - only clickable when can close */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={canClose ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-card backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-border/30">
          <div className="text-primary">
            <AppIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              A new version of Rainy Day is available!
            </h2>
            {updateInfo && status === "available" && (
              <p className="text-sm text-muted-foreground">
                Rainy Day {updateInfo.version} is now available—you have{" "}
                {updateInfo.currentVersion}. Would you like to download it now?
              </p>
            )}
            {status === "checking" && (
              <p className="text-sm text-muted-foreground">
                Checking for updates...
              </p>
            )}
            {status === "up-to-date" && (
              <p className="text-sm text-muted-foreground">
                You're running the latest version.
              </p>
            )}
          </div>
          {canClose && (
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Checking */}
          {status === "checking" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">Checking for updates...</p>
            </div>
          )}

          {/* Up to date */}
          {status === "up-to-date" && (
            <div className="flex flex-col items-center py-6 gap-4">
              <CheckIcon />
              <div className="text-center">
                <p className="text-foreground font-medium">
                  You're up to date!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Rainy Day {updateInfo?.currentVersion || "latest"} is the
                  newest version.
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

          {/* Update Available - Show Release Notes */}
          {status === "available" && updateInfo && (
            <div className="space-y-4">
              {/* Version Title */}
              <h3 className="text-xl font-bold text-foreground">
                Rainy Day {updateInfo.version}
              </h3>

              {/* Release Notes */}
              <div className="max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {releaseNotes.map((note, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-muted-foreground mt-1.5">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View full changelog link */}
              <a
                href="https://github.com/ferxalbs/rainy-day/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View full changelog
              </a>

              {/* Mandatory notice */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 rounded accent-primary"
                />
                <span>This update is required to continue using Rainy Day</span>
              </div>
            </div>
          )}

          {/* Downloading */}
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

          {/* Ready to Install */}
          {status === "ready" && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3">
                <PackageIcon />
                <div className="text-center">
                  <p className="text-foreground font-medium">
                    Ready to Install
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The update has been downloaded. Rainy Day will restart to
                    apply the update.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Installing */}
          {status === "installing" && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              <p className="text-foreground font-medium">
                Installing update...
              </p>
              <p className="text-sm text-muted-foreground">
                Rainy Day will restart shortly.
              </p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3">
                <ErrorIcon />
                <div className="text-center">
                  <p className="text-destructive font-medium">Update Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(status === "available" ||
          status === "ready" ||
          status === "error") && (
            <div className="flex justify-end gap-3 p-5 border-t border-border/30 bg-muted/10">
              {status === "available" && (
                <button
                  onClick={download}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Install Update
                </button>
              )}

              {status === "ready" && (
                <button
                  onClick={install}
                  className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                >
                  Restart & Install
                </button>
              )}

              {status === "error" && (
                <>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-muted/50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      clearError();
                      check();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    Retry
                  </button>
                </>
              )}
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
