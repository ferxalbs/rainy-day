/**
 * @deprecated This file is deprecated. Use services from './backend/auth' instead.
 * 
 * This file contained Tauri-based authentication commands that have been
 * replaced by HTTP-based authentication through the backend server.
 * 
 * Migration guide:
 * - startGoogleAuth() -> connectToBackend() from './backend/auth'
 * - checkAuthStatus() -> isBackendConnected() from './backend/auth'
 * - logout() -> disconnectFromBackend() from './backend/auth'
 */

// Re-export from backend for backward compatibility
export {
  connectToBackend as startGoogleAuth,
  isBackendConnected as checkAuthStatus,
  disconnectFromBackend as logout,
  getBackendUser,
} from './backend/auth';
