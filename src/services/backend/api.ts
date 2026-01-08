/**
 * Backend API Client
 *
 * Handles all communication with the Rainy Day backend server.
 * Uses JWT tokens stored in the Tauri keychain for authentication.
 */

import { invoke } from "@tauri-apps/api/core";

// API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get the backend access token from Tauri keychain
 */
async function getAccessToken(): Promise<string | null> {
  try {
    return await invoke<string | null>("get_backend_access_token");
  } catch {
    return null;
  }
}

/**
 * Get the backend refresh token from Tauri keychain
 */
async function getRefreshToken(): Promise<string | null> {
  try {
    return await invoke<string | null>("get_backend_refresh_token");
  } catch {
    return null;
  }
}

/**
 * Store backend tokens in Tauri keychain
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await invoke("store_backend_tokens", {
    accessToken,
    refreshToken,
  });
}

/**
 * Clear backend tokens from Tauri keychain
 */
export async function clearTokens(): Promise<void> {
  await invoke("clear_backend_tokens");
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/session/refresh`, {
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
