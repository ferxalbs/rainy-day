/**
 * Service exports
 * 
 * This file re-exports all services from the backend module.
 * The old Tauri-based services (auth.ts, gmail.ts, calendar.ts, tasks.ts)
 * are deprecated and should not be used directly.
 */

// Export all backend services
export * from './backend';

// Legacy exports for backward compatibility
// These will be removed in a future version
export { getTheme, setTheme, getSystemTheme, resetTheme } from './theme';
