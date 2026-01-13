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

// Data services
export {
  getEmails,
  getEvents,
  getTodayEvents,
  getTasks,
  getTaskLists,
  triggerSync,
  getSyncStatus,
  type Email,
  type CalendarEvent,
  type Task,
  type TaskList,
} from "./data";

// Plan services
export {
  getTodayPlan,
  getTodayPlanWithCache,
  getCachedPlan,
  generatePlan,
  regeneratePlan,
  invalidatePlanCache,
  submitPlanFeedback,
  submitItemFeedback,
  getPlanHistory,
  type DailyPlan,
  type PlanTask,
  type PlanHistoryItem,
  type ItemFeedbackType,
} from "./plan";

// Action services
export {
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getActionHistory,
  type CreateTaskInput,
  type UpdateTaskInput,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type ActionResult,
} from "./actions";

// Email action services
export {
  archiveEmail,
  markEmailAsRead,
  convertEmailToTask,
  type ConvertToTaskOptions,
  type EmailToTaskData,
  type EmailActionData,
} from "./emails";


// Notifications services
export {
  getNotifications,
  getNotificationsWithCache,
  getCachedNotifications,
  getUnreadCount,
  getUnreadCountWithCache,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "./notifications";

// Cache services
export {
  cacheSet,
  cacheGet,
  cacheGetFresh,
  cacheGetStale,
  cacheRemove,
  cacheClearAll,
  isOffline,
  isNetworkError,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  type CachedData,
  type CacheResult,
} from "./cache";
