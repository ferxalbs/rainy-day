/**
 * OfflineIndicator Component
 *
 * Shows a banner when the app is offline.
 * Shows "cached" badge on stale data.
 *
 * Requirements: 8.4
 */

import { useState, useEffect } from "react";
import { isOffline } from "../../services/backend/cache";
import "./OfflineIndicator.css";

interface OfflineIndicatorProps {
  className?: string;
}

/**
 * Banner that shows when the app is offline
 */
export function OfflineBanner({ className = "" }: OfflineIndicatorProps) {
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={`offline-banner ${className}`}>
      <OfflineIcon />
      <span>You're offline. Showing cached data.</span>
    </div>
  );
}

/**
 * Small badge to show on stale/cached data
 */
interface CachedBadgeProps {
  isStale?: boolean;
  cachedAt?: number;
  className?: string;
}

export function CachedBadge({ isStale, cachedAt, className = "" }: CachedBadgeProps) {
  if (!isStale) return null;

  const formatCachedTime = (timestamp?: number) => {
    if (!timestamp) return "cached";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just cached";
    if (diffMins < 60) return `cached ${diffMins}m ago`;
    if (diffHours < 24) return `cached ${diffHours}h ago`;
    return `cached ${date.toLocaleDateString()}`;
  };

  return (
    <span className={`cached-badge ${className}`} title={formatCachedTime(cachedAt)}>
      <CachedIcon />
      <span>Cached</span>
    </span>
  );
}

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(!isOffline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

function OfflineIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="offline-icon"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function CachedIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cached-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default OfflineBanner;
