/**
 * Native Notifications Service
 *
 * Uses Tauri's notification API for system notifications.
 * Falls back to web notifications when not running in Tauri.
 *
 * Requirements: 8.1
 */

// Check if we're running in Tauri
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
}

interface TauriNotificationModule {
  isPermissionGranted: () => Promise<boolean>;
  requestPermission: () => Promise<"granted" | "denied" | "default">;
  sendNotification: (options: { title: string; body?: string; icon?: string }) => void;
}

// Lazy load Tauri notification module
let tauriNotification: TauriNotificationModule | null = null;

async function getTauriNotification(): Promise<TauriNotificationModule | null> {
  if (!isTauri) return null;
  
  if (tauriNotification) return tauriNotification;
  
  try {
    const module = await import("@tauri-apps/plugin-notification");
    tauriNotification = module;
    return module;
  } catch (error) {
    console.warn("Failed to load Tauri notification plugin:", error);
    return null;
  }
}

/**
 * Check if notification permission is granted
 */
export async function isPermissionGranted(): Promise<boolean> {
  const tauri = await getTauriNotification();
  
  if (tauri) {
    try {
      return await tauri.isPermissionGranted();
    } catch (error) {
      console.warn("Failed to check Tauri notification permission:", error);
    }
  }
  
  // Fallback to web notifications
  if ("Notification" in window) {
    return Notification.permission === "granted";
  }
  
  return false;
}

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<"granted" | "denied" | "default"> {
  const tauri = await getTauriNotification();
  
  if (tauri) {
    try {
      return await tauri.requestPermission();
    } catch (error) {
      console.warn("Failed to request Tauri notification permission:", error);
    }
  }
  
  // Fallback to web notifications
  if ("Notification" in window) {
    return await Notification.requestPermission();
  }
  
  return "denied";
}

/**
 * Send a native notification
 */
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  const tauri = await getTauriNotification();
  
  if (tauri) {
    try {
      const hasPermission = await tauri.isPermissionGranted();
      if (!hasPermission) {
        const permission = await tauri.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission denied");
          return false;
        }
      }
      
      tauri.sendNotification({
        title: options.title,
        body: options.body,
        icon: options.icon,
      });
      return true;
    } catch (error) {
      console.warn("Failed to send Tauri notification:", error);
    }
  }
  
  // Fallback to web notifications
  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return false;
      }
    }
    
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
    });
    return true;
  }
  
  console.warn("Notifications not supported");
  return false;
}

/**
 * Initialize notifications - request permission on first use
 */
export async function initializeNotifications(): Promise<boolean> {
  const hasPermission = await isPermissionGranted();
  
  if (!hasPermission) {
    const permission = await requestPermission();
    return permission === "granted";
  }
  
  return true;
}

export default {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  initializeNotifications,
};
