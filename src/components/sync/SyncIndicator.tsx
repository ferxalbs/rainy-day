/**
 * SyncIndicator Component
 *
 * Shows sync status icon (spinning, check, error).
 * Click to trigger manual sync. Shows last sync time on hover.
 *
 * Requirements: 4.5, 4.6
 */

import { useSyncStatus } from "../../hooks/useSyncStatus";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import "./SyncIndicator.css";

interface SyncIndicatorProps {
  className?: string;
}

export function SyncIndicator({ className = "" }: SyncIndicatorProps) {
  const { syncStatus, triggerSync, isSyncing } = useSyncStatus({
    pollingInterval: 60000, // Poll every minute
  });

  const handleClick = () => {
    if (!isSyncing) {
      triggerSync("all");
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return "Never synced";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleString();
  };

  const getStatusIcon = () => {
    if (isSyncing || syncStatus.status === "syncing") {
      return <SyncingIcon />;
    }
    if (syncStatus.status === "error") {
      return <ErrorIcon />;
    }
    if (syncStatus.status === "synced") {
      return <SyncedIcon />;
    }
    return <IdleIcon />;
  };

  const getStatusText = () => {
    if (isSyncing || syncStatus.status === "syncing") {
      return "Syncing...";
    }
    if (syncStatus.status === "error") {
      return syncStatus.error || "Sync failed";
    }
    if (syncStatus.status === "synced") {
      return "Synced";
    }
    return "Not synced";
  };

  const tooltipContent = (
    <div className="sync-tooltip-content">
      <div className="sync-status-text">{getStatusText()}</div>
      <div className="sync-last-time">
        Last sync: {formatLastSync(syncStatus.lastSyncAt)}
      </div>
      {syncStatus.status !== "syncing" && !isSyncing && (
        <div className="sync-hint">Click to sync now</div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={isSyncing}
          className={`sync-indicator-btn ${syncStatus.status} ${className}`}
          title="Sync status"
        >
          {getStatusIcon()}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}

function SyncingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sync-icon spinning"
    >
      <path d="M21 12a9 9 0 11-2.2-5.9M21 4v4h-4" />
    </svg>
  );
}

function SyncedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sync-icon synced"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sync-icon error"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IdleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sync-icon idle"
    >
      <path d="M21 12a9 9 0 11-2.2-5.9M21 4v4h-4" />
    </svg>
  );
}

export default SyncIndicator;
