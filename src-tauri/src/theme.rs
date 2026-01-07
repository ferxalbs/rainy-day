//! Theme management module
//!
//! Handles theme persistence and system theme detection

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const THEME_STORE_FILE: &str = "theme.json";
const THEME_MODE_KEY: &str = "mode";
const THEME_NAME_KEY: &str = "name";

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ThemePreference {
    pub mode: String,
    pub name: String,
}

/// Get the saved theme preference
#[tauri::command]
pub async fn get_theme(app: AppHandle) -> Result<ThemePreference, String> {
    let store = app
        .store(THEME_STORE_FILE)
        .map_err(|e| format!("Failed to access theme store: {}", e))?;

    let mode = match store.get(THEME_MODE_KEY) {
        Some(value) => value.as_str().unwrap_or("automatic").to_string(),
        None => "automatic".to_string(),
    };

    let name = match store.get(THEME_NAME_KEY) {
        Some(value) => value.as_str().unwrap_or("default").to_string(),
        None => "default".to_string(),
    };

    Ok(ThemePreference { mode, name })
}

/// Save the theme preference
#[tauri::command]
pub async fn set_theme(app: AppHandle, mode: String, name: String) -> Result<(), String> {
    // Validate theme mode
    let valid_modes = ["day", "night", "automatic"];
    if !valid_modes.contains(&mode.as_str()) {
        return Err(format!(
            "Invalid theme mode: {}. Must be one of: day, night, automatic",
            mode
        ));
    }

    // Validate theme name
    let valid_names = ["default", "sky-blue", "cosmic-gold", "starry-christmas"];
    if !valid_names.contains(&name.as_str()) {
        return Err(format!(
            "Invalid theme name: {}. Must be one of: default, sky-blue, cosmic-gold, starry-christmas",
            name
        ));
    }

    let store = app
        .store(THEME_STORE_FILE)
        .map_err(|e| format!("Failed to access theme store: {}", e))?;

    store.set(THEME_MODE_KEY, serde_json::json!(mode));
    store.set(THEME_NAME_KEY, serde_json::json!(name));

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
    set_theme(app, "automatic".to_string(), "default".to_string()).await
}
