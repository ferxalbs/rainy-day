/**
 * Authentication service for Google OAuth2
 */
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthStatus } from '../types';

/**
 * Start the Google OAuth2 flow
 * Opens the user's browser to Google sign-in and waits for callback
 */
export async function startGoogleAuth(): Promise<AuthStatus> {
  try {
    // Get the OAuth URL (this also sets up the callback server info)
    const authUrl = await invoke<string>('start_google_auth');
    
    // Open the URL in the user's browser
    await openUrl(authUrl);
    
    // Wait for the OAuth callback (blocks until user completes auth)
    const status = await invoke<AuthStatus>('wait_for_oauth_callback');
    
    return status;
  } catch (error) {
    console.error('Failed to complete Google auth:', error);
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
