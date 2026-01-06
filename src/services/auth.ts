/**
 * Authentication service for Google OAuth2
 */
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthStatus } from '../types';

/**
 * Start the Google OAuth2 flow
 * Opens the user's browser to Google sign-in
 */
export async function startGoogleAuth(): Promise<void> {
  try {
    const authUrl = await invoke<string>('start_google_auth');
    await openUrl(authUrl);
  } catch (error) {
    console.error('Failed to start Google auth:', error);
    throw error;
  }
}

/**
 * Check if the user is currently authenticated
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
  try {
    return await invoke<AuthStatus>('is_authenticated');
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return {
      is_authenticated: false,
      user: null,
      expires_at: null,
    };
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    await invoke('logout');
  } catch (error) {
    console.error('Failed to logout:', error);
    throw error;
  }
}
