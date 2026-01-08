/**
 * Hook for managing sync status
 *
 * This hook provides state management for data synchronization,
 * including tracking sync status and triggering manual syncs.
 *
 * Requirements: 4.2, 4.4, 4.5
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  triggerSync as triggerSyncService,
  getSyncStatus,
} from "../services/backend/data";

/** Sync status values */
export type SyncStatusValue = "idle" | "syncing" | "synced" | "error";

/** Source types for sync */
export type SyncSource = "gmail" | "calendar" | "tasks" | "all";

/** Detailed sync status for each source */
export interface SourceSyncStatus {
  count: number;
  lastSynced: number | null;
}

/** Overall sync status */
export interface SyncStatus {
  status: SyncStatusValue;
  lastSyncAt: number | null;
  error?: string;
  sources: {
    gmail: SourceSyncStatus;
    calendar: SourceSyncStatus;
    tasks: SourceSyncStatus;
  };
}

export interface UseSyncStatusReturn {
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Trigger a manual sync */
  triggerSync: (source?: SyncSource) => Promise<void>;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Refresh the sync status from the server */
  refresh: () => Promise<void>;
}

export interface UseSyncStatusOptions {
  /** Whether to fetch status on mount (default: true) */
  fetchOnMount?: boolean;
  /** Polling interval in milliseconds (default: 0 = no polling) */
  pollingInterval?: number;
}

const DEFAULT_SYNC_STATUS: SyncStatus = {
  status: "idle",
  lastSyncAt: null,
  sources: {
    gmail: { count: 0, lastSynced: null },
    calendar: { count: 0, lastSynced: null },
    tasks: { count: 0, lastSynced: null },
  },
};

/**
 * Hook for managing sync status
 *
 * Tracks the synchronization status of data sources and provides
 * a function to trigger manual syncs.
 *
 * Requirements: 4.2, 4.4, 4.5
 */
export function useSyncStatus(
  options: UseSyncStatusOptions = {}
): UseSyncStatusReturn {
  const { fetchOnMount = true, pollingInterval = 0 } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(DEFAULT_SYNC_STATUS);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Fetch the current sync status from the backend
   * Requirements: 4.4
   */
  const fetchSyncStatus = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const status = await getSyncStatus();

      if (status && isMountedRef.current) {
        // Find the most recent sync timestamp across all sources
        const lastSyncTimes = [
          status.gmail.last_synced,
          status.calendar.last_synced,
          status.tasks.last_synced,
        ].filter((t): t is number => t !== null);

        const lastSyncAt =
          lastSyncTimes.length > 0 ? Math.max(...lastSyncTimes) : null;

        setSyncStatus({
          status: lastSyncAt ? "synced" : "idle",
          lastSyncAt,
          sources: {
            gmail: {
              count: status.gmail.count,
              lastSynced: status.gmail.last_synced,
            },
            calendar: {
              count: status.calendar.count,
              lastSynced: status.calendar.last_synced,
            },
            tasks: {
              count: status.tasks.count,
              lastSynced: status.tasks.last_synced,
            },
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
      if (isMountedRef.current) {
        setSyncStatus((prev) => ({
          ...prev,
          status: "error",
          error: "Failed to fetch sync status",
        }));
      }
    }
  }, []);

  /**
   * Trigger a manual sync
   * Requirements: 4.2
   */
  const triggerSync = useCallback(
    async (source: SyncSource = "all") => {
      if (isSyncing) return;

      setIsSyncing(true);
      setSyncStatus((prev) => ({
        ...prev,
        status: "syncing",
        error: undefined,
      }));

      try {
        const success = await triggerSyncService(source);

        if (isMountedRef.current) {
          if (success) {
            // Wait a moment for the sync to complete, then fetch status
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await fetchSyncStatus();
          } else {
            setSyncStatus((prev) => ({
              ...prev,
              status: "error",
              error: "Sync failed. Please try again.",
            }));
          }
        }
      } catch (err) {
        console.error("Failed to trigger sync:", err);
        if (isMountedRef.current) {
          setSyncStatus((prev) => ({
            ...prev,
            status: "error",
            error: "Failed to trigger sync. Please try again.",
          }));
        }
      } finally {
        if (isMountedRef.current) {
          setIsSyncing(false);
        }
      }
    },
    [isSyncing, fetchSyncStatus]
  );

  // Initial fetch on mount
  useEffect(() => {
    isMountedRef.current = true;

    if (fetchOnMount) {
      fetchSyncStatus();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOnMount, fetchSyncStatus]);

  // Polling interval
  useEffect(() => {
    if (pollingInterval <= 0) return;

    const intervalId = setInterval(() => {
      if (!isSyncing) {
        fetchSyncStatus();
      }
    }, pollingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [pollingInterval, isSyncing, fetchSyncStatus]);

  return {
    syncStatus,
    triggerSync,
    isSyncing,
    refresh: fetchSyncStatus,
  };
}
