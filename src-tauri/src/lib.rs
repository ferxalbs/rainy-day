//! Rainy Day - Transform your inbox into an actionable daily plan
//!
//! A Tauri v2 application that integrates with Gmail, Calendar, and Google Tasks
//! to help you focus on what matters most.

mod auth;
mod cache;
mod data_pipeline;
mod google;
mod notifications;
mod processing;
mod search;
mod theme;

use auth::{AuthState, TokenStore};
use cache::CacheState;
use google::GoogleClient;
use tauri::Manager;

/// Environment variable for Google Client ID
const GOOGLE_CLIENT_ID_ENV: &str = "GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET_ENV: &str = "GOOGLE_CLIENT_SECRET";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env file from the project root (parent of src-tauri)
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
        let _ = dotenvy::dotenv();
    }

    // Get Google OAuth credentials from environment
    let client_id = std::env::var(GOOGLE_CLIENT_ID_ENV).unwrap_or_else(|_| {
        eprintln!("ERROR: {} not set!", GOOGLE_CLIENT_ID_ENV);
        String::new()
    });

    let client_secret = std::env::var(GOOGLE_CLIENT_SECRET_ENV).unwrap_or_else(|_| {
        eprintln!("ERROR: {} not set!", GOOGLE_CLIENT_SECRET_ENV);
        String::new()
    });

    if client_id.is_empty() || client_secret.is_empty() {
        eprintln!("ERROR: Missing Google OAuth credentials in .env file.");
        eprintln!(
            "Required: {} and {}",
            GOOGLE_CLIENT_ID_ENV, GOOGLE_CLIENT_SECRET_ENV
        );
    } else {
        println!(
            "Starting Rainy Day with client ID: {}...",
            &client_id[..20.min(client_id.len())]
        );
    }

    // Clone credentials for setup hook
    let client_id_for_setup = client_id.clone();
    let client_secret_for_setup = client_secret.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(AuthState::new(client_id, client_secret))
        .manage(TokenStore::new())
        .manage(GoogleClient::new())
        .manage(CacheState::default())
        .setup(move |app| {
            // Initialize TokenStore with app data directory
            let token_store = app.state::<TokenStore>();
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Use tokio runtime to run async initialization
            let client_id = client_id_for_setup.clone();
            let client_secret = client_secret_for_setup.clone();

            tauri::async_runtime::block_on(async {
                if let Err(e) = token_store
                    .initialize(app_data_dir, client_id, client_secret)
                    .await
                {
                    eprintln!("Failed to initialize token store: {}", e);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::start_google_auth,
            auth::wait_for_oauth_callback,
            auth::is_authenticated,
            auth::logout,
            // Backend token commands
            auth::store_backend_tokens,
            auth::get_backend_access_token,
            auth::get_backend_refresh_token,
            auth::clear_backend_tokens,
            // Google API commands
            google::gmail::get_inbox_summary,
            google::gmail::get_thread_detail,
            google::gmail::open_thread_in_gmail,
            google::calendar::get_today_events,
            google::calendar::get_events_range,
            google::tasks::get_task_lists,
            google::tasks::get_tasks,
            google::tasks::create_task,
            google::tasks::update_task,
            google::tasks::complete_task,
            google::tasks::reopen_task,
            google::tasks::delete_task,
            // Theme commands
            theme::get_theme,
            theme::set_theme,
            theme::get_system_theme,
            theme::reset_theme,
            // Notification commands
            notifications::check_notification_permission,
            notifications::request_notification_permission,
            notifications::send_native_notification,
            notifications::send_typed_notification,
            // Cache commands (v0.6.0 performance layer)
            cache::cache_get,
            cache::cache_set,
            cache::cache_remove,
            cache::cache_invalidate,
            cache::cache_clear,
            cache::cache_stats,
            cache::cache_cleanup,
            // Processing commands (v0.6.0 performance layer)
            processing::format_relative_time,
            processing::format_time,
            processing::format_date,
            processing::get_time_greeting,
            processing::is_today,
            processing::get_today_date_string,
            processing::calculate_priority_score,
            processing::clean_snippet,
            processing::has_urgent_keywords,
            processing::batch_process_tasks,
            processing::batch_process_emails,
            // Search commands (v0.5.13 performance layer)
            search::search_tasks,
            search::search_emails,
            // Data Pipeline commands (v0.5.20 - Note AI)
            data_pipeline::prepare_note_context,
            data_pipeline::validate_note_schema,
            data_pipeline::normalize_response,
            data_pipeline::prepare_batch_requests,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
