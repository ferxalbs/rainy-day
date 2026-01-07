//! Theme management module
//!
//! Handles theme persistence and system theme detection

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const THEME_STORE_FILE: &str = "theme.json";
const THEME_KEY: &str = "mode";

/// Get the saved theme preference
#[tauri::command]
pub async fn get_theme(app: AppHandle) -> Result<String, String> {
    let store = app
        .store(THEME_STORE_FILE)
        .map_err(|e| format!("Failed to access theme store: {}", e))?;

    match store.get(THEME_KEY) {
        Some(value) => {
            if let Some(mode) = value.as_str() {
                Ok(mode.to_string())
            } else {
                Ok("automatic".to_string())
            }
        }
        None => Ok("automatic".to_string()),
    }
}

/// Save the theme preference
#[tauri::command]
pub async fn set_theme(app: AppHandle, mode: String) -> Result<(), String> {
    // Validate theme mode
    let valid_modes = ["day", "night", "automatic"];
    if !valid_modes.contains(&mode.as_str()) {
        return Err(format!(
            "Invalid theme mode: {}. Must be one of: day, night, automatic",
            mode
        ));
    }

    let store = app
        .store(THEME_STORE_FILE)
        .map_err(|e| format!("Failed to access theme store: {}", e))?;

    // set() and save() return () in tauri-plugin-store v2
    store.set(THEME_KEY, serde_json::json!(mode));
    store
        .save()
        .map_err(|e| format!("Failed to save theme: {}", e))?;

    Ok(())
}

/// Get the current system theme (for automatic mode)
/// Returns "day" or "night" based on system appearance
#[tauri::command]
pub fn get_system_theme() -> String {
    // On macOS, we can use dark-light crate, but for simplicity
    // we'll return "night" as default and let the frontend handle it
    // via CSS media query prefers-color-scheme

    // For now, return a default that the frontend can override
    // The frontend will use window.matchMedia('(prefers-color-scheme: dark)')
    "night".to_string()
}

/// Reset theme to default (automatic)
#[tauri::command]
pub async fn reset_theme(app: AppHandle) -> Result<(), String> {
    set_theme(app, "automatic".to_string()).await
}
