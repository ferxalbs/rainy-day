/**
 * Backend Authentication Service
 *
 * Handles the polling-based OAuth flow with the backend:
 * 1. init - Get poll_token and auth_url
 * 2. poll - Check if user completed auth
 * 3. exchange - Get JWT tokens
 */

import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { storeTokens, clearTokens, hasTokens, get } from "./api";

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Storage key for localStorage fallback
const STORAGE_REFRESH_KEY = "rainy_day_backend_refresh_token";

// Types
export interface BackendUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthInitResponse {
  auth_url: string;
  poll_token: string;
  state: string;
  expires_in: number;
}

export interface PollResponse {
  status: "pending" | "approved" | "expired";
  one_time_code?: string;
}

export interface ExchangeResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Get device info for auth
 */
async function getDeviceInfo(): Promise<{
  deviceId: string;
  deviceName: string;
  platform: string;
}> {
  try {
    // Try to get from Tauri
    const deviceId = await invoke<string>("get_device_id");
    const deviceName = await invoke<string>("get_device_name");
    const platform = "macos"; // TODO: detect platform

    return { deviceId, deviceName, platform };
  } catch {
    // Fallback
    return {
      deviceId: `device_${Date.now()}`,
      deviceName: "Rainy Day Desktop",
      platform: "macos",
    };
  }
}

/**
 * Initialize backend auth - returns poll_token and opens auth URL
 */
export async function initBackendAuth(): Promise<{
  pollToken: string;
  state: string;
}> {
  const { deviceId, deviceName, platform } = await getDeviceInfo();

  const response = await fetch(`${API_URL}/auth/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_install_id: deviceId,
      device_name: deviceName,
      platform,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Auth init failed: ${error}`);
  }

  const data = (await response.json()) as AuthInitResponse;

  // Open auth URL in browser
  await openUrl(data.auth_url);

  return {
    pollToken: data.poll_token,
    state: data.state,
  };
}

/**
 * Poll for auth completion
 */
export async function pollBackendAuth(
  pollToken: string
): Promise<PollResponse> {
  const response = await fetch(
    `${API_URL}/auth/poll?poll_token=${encodeURIComponent(pollToken)}`
  );

  if (!response.ok) {
    throw new Error("Poll failed");
  }

  return (await response.json()) as PollResponse;
}

/**
 * Exchange one-time code for tokens
 */
export async function exchangeBackendCode(
  oneTimeCode: string
): Promise<ExchangeResponse> {
  const response = await fetch(`${API_URL}/auth/session/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ one_time_code: oneTimeCode }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Exchange failed: ${error}`);
  }

  return (await response.json()) as ExchangeResponse;
}

/**
 * Complete backend auth flow
 * 1. Init auth (opens browser)
 * 2. Poll until approved
 * 3. Exchange code for tokens
 * 4. Store tokens
 */
export async function connectToBackend(): Promise<BackendUser> {
  // Step 1: Init
  const { pollToken } = await initBackendAuth();

  // Step 2: Poll until approved (max 10 minutes)
  const maxAttempts = 120; // 10 minutes at 5 second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const pollResult = await pollBackendAuth(pollToken);

    if (pollResult.status === "approved" && pollResult.one_time_code) {
      // Step 3: Exchange code for tokens
      const tokens = await exchangeBackendCode(pollResult.one_time_code);

      // Step 4: Store tokens
      await storeTokens(tokens.access_token, tokens.refresh_token);

      // Get user info
      const user = await getBackendUser();
      if (!user) {
        throw new Error("Failed to get user info after auth");
      }

      return user;
    }

    if (pollResult.status === "expired") {
      throw new Error("Auth session expired");
    }

    attempts++;
  }

  throw new Error("Auth timeout");
}

/**
 * Try to refresh tokens using the stored refresh token
 * This is called when the access token is expired but we have a valid refresh token
 * @returns true if refresh succeeded, false if failed (user must re-login)
 */
async function tryRefreshTokens(): Promise<boolean> {
  try {
    // Get refresh token from keychain first, then localStorage fallback
    let refreshToken: string | null = null;
    let tokenSource = 'none';

    try {
      refreshToken = await invoke<string | null>("get_backend_refresh_token");
      if (refreshToken) tokenSource = 'keychain';
    } catch {
      console.warn("[Auth] Keychain access failed, trying localStorage fallback");
    }

    // Fallback to localStorage
    if (!refreshToken) {
      refreshToken = localStorage.getItem(STORAGE_REFRESH_KEY);
      if (refreshToken) tokenSource = 'localStorage';
    }

    if (!refreshToken) {
      console.log("[Auth] No refresh token available");
      return false;
    }

    console.log(`[Auth] Attempting token refresh (source: ${tokenSource})...`);

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      console.warn("[Auth] Refresh token rejected, clearing tokens");
      await clearTokens();
      return false;
    }

    const data = (await response.json()) as { access_token: string; refresh_token: string };
    await storeTokens(data.access_token, data.refresh_token);
    console.log("[Auth] Tokens refreshed successfully");
    return true;
  } catch (error) {
    console.error("[Auth] Token refresh failed:", error);
    return false;
  }
}

/**
 * Get current user from backend
 * Uses backendFetch which has automatic token refresh on 401
 */
export async function getBackendUser(): Promise<BackendUser | null> {
  try {
    // Use the get() function from api.ts which has automatic token refresh
    const response = await get<BackendUser>("/auth/me");
    return response.ok ? response.data ?? null : null;
  } catch {
    return null;
  }
}

/**
 * Check if connected to backend
 * Attempts to validate existing tokens and refresh if needed
 */
export async function isBackendConnected(): Promise<boolean> {
  const hasStoredTokens = await hasTokens();
  if (!hasStoredTokens) {
    return false;
  }

  // Try to get user info (this will auto-refresh if token expired)
  const user = await getBackendUser();
  if (user) {
    return true;
  }

  // getBackendUser already tried refresh via backendFetch,
  // but let's try one more explicit refresh in case it was a different error
  console.log("[Auth] User fetch failed, attempting explicit token refresh...");
  const refreshed = await tryRefreshTokens();
  if (refreshed) {
    // Try again after refresh
    const userAfterRefresh = await getBackendUser();
    return userAfterRefresh !== null;
  }

  return false;
}

/**
 * Disconnect from backend (logout)
 */
export async function disconnectFromBackend(): Promise<void> {
  await clearTokens();
}
