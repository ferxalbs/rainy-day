//! Rainy Day - Transform your inbox into an actionable daily plan
//!
//! A Tauri v2 application that integrates with Gmail, Calendar, and Google Tasks
//! to help you focus on what matters most.

mod auth;
mod google;

use auth::{AuthState, TokenStore};
use google::GoogleClient;
use tauri_plugin_deep_link::DeepLinkExt;

/// Environment variable for Google Client ID
const GOOGLE_CLIENT_ID_ENV: &str = "GOOGLE_CLIENT_ID";

/// Default client ID for development (replace with your own)
const DEFAULT_CLIENT_ID: &str = "YOUR_CLIENT_ID.apps.googleusercontent.com";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get Google Client ID from environment or use default
    let client_id =
        std::env::var(GOOGLE_CLIENT_ID_ENV).unwrap_or_else(|_| DEFAULT_CLIENT_ID.to_string());

    tauri::Builder::default()
        // Initialize plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        // Note: Stronghold requires a password callback, simplified for now
        // .plugin(tauri_plugin_stronghold::Builder::new(|_| "temp-password".into()).build())
        // Managed state
        .manage(AuthState::new(client_id))
        .manage(TokenStore::new())
        .manage(GoogleClient::new())
        // Setup deep link handler
        .setup(|app| {
            // Register the deep link scheme on desktop
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                app.deep_link().on_open_url(move |event| {
                    let urls = event.urls();
                    for url in urls {
                        if url.scheme() == "rainyday" {
                            // Handle OAuth callback
                            if let Some(code) = url
                                .query_pairs()
                                .find(|(k, _)| k == "code")
                                .map(|(_, v)| v.to_string())
                            {
                                println!("Received OAuth code: {}", &code[..8.min(code.len())]);
                                // TODO: Exchange code for tokens
                            }
                        }
                    }
                });

                // Register the scheme with the OS
                if let Err(e) = app.deep_link().register("rainyday") {
                    eprintln!("Failed to register deep link: {}", e);
                }
            }

            Ok(())
        })
        // Register commands
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            auth::start_google_auth,
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
