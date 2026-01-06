//! Rainy Day - Transform your inbox into an actionable daily plan
//!
//! A Tauri v2 application that integrates with Gmail, Calendar, and Google Tasks
//! to help you focus on what matters most.

mod auth;
mod google;

use auth::{AuthState, TokenStore};
use google::GoogleClient;

/// Environment variable for Google Client ID
const GOOGLE_CLIENT_ID_ENV: &str = "GOOGLE_CLIENT_ID";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env file from the project root (parent of src-tauri)
    // This is important because Tauri runs from src-tauri directory
    let env_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or(std::path::Path::new("."))
        .join(".env");
    
    if env_path.exists() {
        if let Err(e) = dotenvy::from_path(&env_path) {
            eprintln!("Warning: Failed to load .env file: {}", e);
        } else {
            println!("Loaded .env from: {:?}", env_path);
        }
    } else {
        // Try current directory as fallback
        let _ = dotenvy::dotenv();
    }

    // Get Google Client ID from environment
    let client_id = std::env::var(GOOGLE_CLIENT_ID_ENV).unwrap_or_else(|_| {
        eprintln!("ERROR: {} not set! Please create a .env file with your Google Client ID.", GOOGLE_CLIENT_ID_ENV);
        eprintln!("Example: {}=your-client-id.apps.googleusercontent.com", GOOGLE_CLIENT_ID_ENV);
        String::new()
    });

    if client_id.is_empty() || client_id.contains("YOUR_CLIENT_ID") {
        eprintln!("ERROR: Invalid Google Client ID. Please set a valid {} in your .env file.", GOOGLE_CLIENT_ID_ENV);
    } else {
        println!(
            "Starting Rainy Day with client ID: {}...",
            &client_id[..20.min(client_id.len())]
        );
    }

    tauri::Builder::default()
        // Initialize plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        // Managed state
        .manage(AuthState::new(client_id))
        .manage(TokenStore::new())
        .manage(GoogleClient::new())
        // Register commands
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            auth::start_google_auth,
            auth::wait_for_oauth_callback,
            auth::is_authenticated,
            auth::logout,
            // Gmail commands
            google::gmail::get_inbox_summary,
            google::gmail::get_thread_detail,
            google::gmail::open_thread_in_gmail,
            // Calendar commands
            google::calendar::get_today_events,
            google::calendar::get_events_range,
            // Tasks commands
            google::tasks::get_task_lists,
            google::tasks::get_tasks,
            google::tasks::create_task,
            google::tasks::update_task,
            google::tasks::complete_task,
            google::tasks::reopen_task,
            google::tasks::delete_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
