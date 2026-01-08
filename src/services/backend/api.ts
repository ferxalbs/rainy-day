/**
 * Backend API Client
 *
 * Handles all communication with the Rainy Day backend server.
 * Uses JWT tokens stored in the Tauri keychain with localStorage fallback.
 */

import { invoke } from "@tauri-apps/api/core";

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Storage keys for localStorage fallback
const STORAGE_ACCESS_KEY = "rainy_day_backend_access_token";
const STORAGE_REFRESH_KEY = "rainy_day_backend_refresh_token";

/**
 * Get the backend access token - tries keychain first, then localStorage fallback
 */
async function getAccessToken(): Promise<string | null> {
  // Try keychain first
  try {
    const token = await invoke<string | null>("get_backend_access_token");
    if (token) return token;
  } catch (e) {
    console.warn("Keychain access failed, using fallback:", e);
  }

  // Fallback to localStorage
  return localStorage.getItem(STORAGE_ACCESS_KEY);
}

/**
 * Get the backend refresh token - tries keychain first, then localStorage fallback
 */
async function getRefreshToken(): Promise<string | null> {
  // Try keychain first
  try {
    const token = await invoke<string | null>("get_backend_refresh_token");
    if (token) return token;
  } catch (e) {
    console.warn("Keychain access failed, using fallback:", e);
  }

  // Fallback to localStorage
  return localStorage.getItem(STORAGE_REFRESH_KEY);
}

/**
 * Store backend tokens - stores in both keychain and localStorage fallback
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  // Always store in localStorage as fallback
  localStorage.setItem(STORAGE_ACCESS_KEY, accessToken);
  localStorage.setItem(STORAGE_REFRESH_KEY, refreshToken);

  // Try to store in keychain (may fail on unsigned apps)
  try {
    await invoke("store_backend_tokens", {
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.warn("Keychain store failed, tokens saved to localStorage:", e);
  }
}

/**
 * Clear backend tokens from both keychain and localStorage
 */
export async function clearTokens(): Promise<void> {
  // Clear localStorage
  localStorage.removeItem(STORAGE_ACCESS_KEY);
  localStorage.removeItem(STORAGE_REFRESH_KEY);

  // Try to clear keychain
  try {
    await invoke("clear_backend_tokens");
  } catch (e) {
    console.warn("Keychain clear failed:", e);
  }
}

/**
 * Check if tokens exist (either in keychain or localStorage)
 */
export async function hasTokens(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Refresh failed, clear tokens
      await clearTokens();
      return null;
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };

    // Store new tokens
    await storeTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * API Response type
 */
export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/**
 * Fetch wrapper with automatic token handling
 */
export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let accessToken = await getAccessToken();

  // If no token, return unauthorized
  if (!accessToken) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  const makeRequest = async (token: string): Promise<Response> => {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  let response = await makeRequest(accessToken);

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      return { ok: false, status: 401, error: "Token refresh failed" };
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      ok: false,
      status: response.status,
      error: (errorData as { error?: string }).error || response.statusText,
    };
  }

  const data = (await response.json()) as T;
  return { ok: true, status: response.status, data };
}

/**
 * GET request helper
 */
export async function get<T>(path: string): Promise<ApiResponse<T>> {
  return backendFetch<T>(path, { method: "GET" });
}

/**
 * POST request helper
 */
export async function post<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return backendFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function patch<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return backendFetch<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function del<T>(path: string): Promise<ApiResponse<T>> {
  return backendFetch<T>(path, { method: "DELETE" });
}

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get backend API info
 */
export async function getBackendInfo(): Promise<{
  name: string;
  version: string;
} | null> {
  try {
    const response = await fetch(`${API_URL}/`);
    if (!response.ok) return null;
    return (await response.json()) as { name: string; version: string };
  } catch {
    return null;
  }
}
