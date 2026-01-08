/**
 * Backend Services
 *
 * Re-exports all backend-related services for easy importing.
 */

// API client
export {
  backendFetch,
  get,
  post,
  patch,
  del,
  storeTokens,
  clearTokens,
  checkBackendHealth,
  getBackendInfo,
} from "./api";

// Auth services
export {
  initBackendAuth,
  pollBackendAuth,
  exchangeBackendCode,
  connectToBackend,
  disconnectFromBackend,
  getBackendUser,
  isBackendConnected,
  type BackendUser,
} from "./auth";

// Plan services
export {
  getTodayPlan,
  generatePlan,
  submitPlanFeedback,
  getPlanHistory,
  triggerSync,
  type DailyPlan,
  type PlanSuggestion,
  type PlanHistoryItem,
} from "./plan";
