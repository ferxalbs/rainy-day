/**
 * Update Service
 * 
 * Handles checking for updates, downloading, and installing using Tauri's updater plugin.
 * Works with GitHub Releases to distribute updates.
 */

import { check, type Update, type DownloadEvent } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/**
 * Update status types
 */
export type UpdateStatus = 
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'installing'
  | 'error'
  | 'up-to-date';

/**
 * Download progress information
 */
export interface DownloadProgress {
  /** Total bytes to download */
  total: number;
  /** Bytes downloaded so far */
  downloaded: number;
  /** Download percentage (0-100) */
  percentage: number;
}

/**
 * Update information
 */
export interface UpdateInfo {
  /** New version string */
  version: string;
  /** Current version string */
  currentVersion: string;
  /** Release date */
  date?: string;
  /** Release notes / changelog */
  body?: string;
}

/**
 * Check for available updates
 * @returns Update info if available, null if up-to-date
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const update = await check();
    
    if (!update) {
      console.log('[Update] No updates available');
      return null;
    }

    console.log(`[Update] Update available: ${update.version}`);
    
    // Store the update object for later use
    _currentUpdate = update;
    
    return {
      version: update.version,
      currentVersion: update.currentVersion,
      date: update.date ?? undefined,
      body: update.body ?? undefined,
    };
  } catch (error) {
    console.error('[Update] Check failed:', error);
    throw error;
  }
}

// Store the current update object for download/install
let _currentUpdate: Update | null = null;

/**
 * Download the update with progress tracking
 * @param onProgress Callback for download progress
 */
export async function downloadUpdate(
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  if (!_currentUpdate) {
    throw new Error('No update available. Call checkForUpdate first.');
  }

  let totalBytes = 0;
  let downloadedBytes = 0;

  try {
    await _currentUpdate.download((event: DownloadEvent) => {
      if (event.event === 'Started') {
        totalBytes = event.data.contentLength ?? 0;
        console.log(`[Update] Download started, size: ${totalBytes} bytes`);
      } else if (event.event === 'Progress') {
        downloadedBytes += event.data.chunkLength;
        const percentage = totalBytes > 0 
          ? Math.round((downloadedBytes / totalBytes) * 100) 
          : 0;
        
        onProgress?.({
          total: totalBytes,
          downloaded: downloadedBytes,
          percentage,
        });
      } else if (event.event === 'Finished') {
        console.log('[Update] Download complete');
        onProgress?.({
          total: totalBytes,
          downloaded: totalBytes,
          percentage: 100,
        });
      }
    });
  } catch (error) {
    console.error('[Update] Download failed:', error);
    throw error;
  }
}

/**
 * Install the downloaded update
 * This will quit the app and restart with the new version
 */
export async function installUpdate(): Promise<void> {
  if (!_currentUpdate) {
    throw new Error('No update available. Download an update first.');
  }

  try {
    console.log('[Update] Installing update...');
    await _currentUpdate.install();
    console.log('[Update] Update installed, restarting...');
    await relaunch();
  } catch (error) {
    console.error('[Update] Install failed:', error);
    throw error;
  }
}

/**
 * Download and install update in one step
 * @param onProgress Callback for download progress
 */
export async function downloadAndInstall(
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  await downloadUpdate(onProgress);
  await installUpdate();
}

/**
 * Close the update connection and cleanup
 */
export async function closeUpdate(): Promise<void> {
  if (_currentUpdate) {
    await _currentUpdate.close();
    _currentUpdate = null;
  }
}

/**
 * Get current app version from package.json
 */
export function getCurrentVersion(): string {
  // This is set at build time by Vite
  return import.meta.env.PACKAGE_VERSION || '0.0.0';
}
