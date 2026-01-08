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
  generatePlan,
  regeneratePlan,
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


// Notifications services
export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "./notifications";
