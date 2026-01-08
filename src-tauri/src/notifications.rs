//! Native Notifications Module
//!
//! Provides Tauri commands for sending native OS notifications.
//! Uses tauri-plugin-notification for cross-platform support.

use tauri_plugin_notification::NotificationExt;

/// Check if notification permission is granted
#[tauri::command]
pub async fn check_notification_permission(app: tauri::AppHandle) -> Result<bool, String> {
    app.notification()
        .permission_state()
        .map(|state| state == tauri_plugin_notification::PermissionState::Granted)
        .map_err(|e| e.to_string())
}

/// Request notification permission from user
#[tauri::command]
pub async fn request_notification_permission(app: tauri::AppHandle) -> Result<String, String> {
    app.notification()
        .request_permission()
        .map(|state| match state {
            tauri_plugin_notification::PermissionState::Granted => "granted".to_string(),
            tauri_plugin_notification::PermissionState::Denied => "denied".to_string(),
            tauri_plugin_notification::PermissionState::Prompt => "prompt".to_string(),
            tauri_plugin_notification::PermissionState::PromptWithRationale => {
                "prompt_with_rationale".to_string()
            }
        })
        .map_err(|e| e.to_string())
}

/// Send a native notification
///
/// # Arguments
/// * `title` - Notification title
/// * `body` - Optional notification body text
/// * `sound` - Optional system sound name (e.g., "Ping", "Glass" on macOS)
#[tauri::command]
pub async fn send_native_notification(
    app: tauri::AppHandle,
    title: String,
    body: Option<String>,
    sound: Option<String>,
) -> Result<(), String> {
    let mut builder = app.notification().builder().title(&title);

    if let Some(body_text) = &body {
        builder = builder.body(body_text);
    }

    if let Some(sound_name) = &sound {
        builder = builder.sound(sound_name);
    }

    builder.show().map_err(|e| e.to_string())
}

/// Send a notification with specific type styling
///
/// Maps notification types to appropriate sounds on macOS
#[tauri::command]
pub async fn send_typed_notification(
    app: tauri::AppHandle,
    notification_type: String,
    title: String,
    body: Option<String>,
) -> Result<(), String> {
    // Map notification types to macOS system sounds
    let sound = match notification_type.as_str() {
        "task_due" => Some("Hero"),
        "plan_ready" => Some("Glass"),
        "reminder" => Some("Ping"),
        "email_summary" => Some("Blow"),
        "system" => Some("Sosumi"),
        _ => None,
    };

    let mut builder = app.notification().builder().title(&title);

    if let Some(body_text) = &body {
        builder = builder.body(body_text);
    }

    if let Some(sound_name) = sound {
        builder = builder.sound(sound_name);
    }

    builder.show().map_err(|e| e.to_string())
}
