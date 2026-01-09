/**
 * useUpdate Hook
 * 
 * React hook for managing update state, checking for updates,
 * and handling the download/install process.
 */

import { useState, useCallback } from 'react';
import {
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  closeUpdate,
  type UpdateStatus,
  type UpdateInfo,
  type DownloadProgress,
} from '../services/update/updateService';

interface UseUpdateState {
  /** Current update status */
  status: UpdateStatus;
  /** Update info if available */
  updateInfo: UpdateInfo | null;
  /** Download progress */
  progress: DownloadProgress | null;
  /** Error message if any */
  error: string | null;
}

interface UseUpdateActions {
  /** Check for available updates */
  check: () => Promise<void>;
  /** Download the available update */
  download: () => Promise<void>;
  /** Install the downloaded update (will restart app) */
  install: () => Promise<void>;
  /** Download and install in one step */
  downloadAndInstall: () => Promise<void>;
  /** Dismiss update notification */
  dismiss: () => void;
  /** Reset error state */
  clearError: () => void;
}

export function useUpdate(): UseUpdateState & UseUpdateActions {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setStatus('checking');
    setError(null);
    
    try {
      const info = await checkForUpdate();
      
      if (info) {
        setUpdateInfo(info);
        setStatus('available');
      } else {
        setStatus('up-to-date');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
      setStatus('error');
    }
  }, []);

  const download = useCallback(async () => {
    if (!updateInfo) {
      setError('No update available');
      return;
    }

    setStatus('downloading');
    setProgress({ total: 0, downloaded: 0, percentage: 0 });
    
    try {
      await downloadUpdate((prog) => {
        setProgress(prog);
      });
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setStatus('error');
    }
  }, [updateInfo]);

  const install = useCallback(async () => {
    setStatus('installing');
    
    try {
      await installUpdate();
      // App will restart, so this won't be reached
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
      setStatus('error');
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    await download();
    // Only proceed if download succeeded
    if (status === 'ready' || !error) {
      await install();
    }
  }, [download, install, status, error]);

  const dismiss = useCallback(async () => {
    await closeUpdate();
    setStatus('idle');
    setUpdateInfo(null);
    setProgress(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus(updateInfo ? 'available' : 'idle');
    }
  }, [status, updateInfo]);

  return {
    status,
    updateInfo,
    progress,
    error,
    check,
    download,
    install,
    downloadAndInstall,
    dismiss,
    clearError,
  };
}
