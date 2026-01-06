//! Token storage with disk persistence using Tauri Store
//!
//! Tokens are stored in a JSON file in the app data directory and kept
//! in memory for fast access. Changes are persisted automatically.

use crate::auth::{AuthStatus, UserInfo, GOOGLE_TOKEN_URL};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Stored token data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: i64,
    pub user_info: UserInfo,
}

/// Token store with disk persistence
pub struct TokenStore {
    tokens: Arc<RwLock<Option<StoredTokens>>>,
    store_path: Arc<RwLock<Option<PathBuf>>>,
    client_id: Arc<RwLock<Option<String>>>,
    client_secret: Arc<RwLock<Option<String>>>,
}

const STORE_FILENAME: &str = "auth_session.json";

impl TokenStore {
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(RwLock::new(None)),
            store_path: Arc::new(RwLock::new(None)),
            client_id: Arc::new(RwLock::new(None)),
            client_secret: Arc::new(RwLock::new(None)),
        }
    }

    /// Initialize the store with the app data directory and credentials
    pub async fn initialize(
        &self,
        app_data_dir: PathBuf,
        client_id: String,
        client_secret: String,
    ) -> Result<(), String> {
        // Store credentials for token refresh
        {
            let mut id_guard = self.client_id.write().await;
            *id_guard = Some(client_id);
        }
        {
            let mut secret_guard = self.client_secret.write().await;
            *secret_guard = Some(client_secret);
        }

        // Create the app data directory if it doesn't exist
        if !app_data_dir.exists() {
            std::fs::create_dir_all(&app_data_dir)
                .map_err(|e| format!("Failed to create app data dir: {}", e))?;
        }

        let store_path = app_data_dir.join(STORE_FILENAME);

        // Store the path
        {
            let mut path_guard = self.store_path.write().await;
            *path_guard = Some(store_path.clone());
        }

        // Load existing tokens if the file exists
        if store_path.exists() {
            match std::fs::read_to_string(&store_path) {
                Ok(content) => {
                    match serde_json::from_str::<StoredTokens>(&content) {
                        Ok(tokens) => {
                            let now = chrono::Utc::now().timestamp();
                            
                            // Check if we need to refresh
                            if tokens.expires_at <= now {
                                // Token expired, try to refresh
                                if let Some(ref refresh_token) = tokens.refresh_token {
                                    println!("Session loaded but expired, attempting refresh...");
                                    match self.refresh_token_internal(refresh_token).await {
                                        Ok(new_tokens) => {
                                            let mut guard = self.tokens.write().await;
                                            *guard = Some(new_tokens);
                                            println!("Session refreshed successfully for: {}", tokens.user_info.email);
                                        }
                                        Err(e) => {
                                            eprintln!("Failed to refresh token: {}", e);
                                            // Clear the stored session
                                            let _ = std::fs::remove_file(&store_path);
                                        }
                                    }
                                } else {
                                    println!("Session expired and no refresh token available");
                                    let _ = std::fs::remove_file(&store_path);
                                }
                            } else {
                                // Token still valid
                                let mut guard = self.tokens.write().await;
                                *guard = Some(tokens.clone());
                                println!("Session restored for: {}", tokens.user_info.email);
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to parse stored tokens: {}", e);
                            // Remove corrupted file
                            let _ = std::fs::remove_file(&store_path);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to read token store: {}", e);
                }
            }
        }

        Ok(())
    }

    /// Internal token refresh (uses stored credentials)
    async fn refresh_token_internal(&self, refresh_token: &str) -> Result<StoredTokens, String> {
        let client_id = {
            let guard = self.client_id.read().await;
            guard.clone().ok_or("Client ID not initialized")?
        };
        let client_secret = {
            let guard = self.client_secret.read().await;
            guard.clone().ok_or("Client secret not initialized")?
        };

        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        let form_data = [
            ("client_id", client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("refresh_token", refresh_token),
            ("grant_type", "refresh_token"),
        ];

        let response = http_client
            .post(GOOGLE_TOKEN_URL)
            .form(&form_data)
            .send()
            .await
            .map_err(|e| format!("Refresh request failed: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Token refresh failed: {}", error_text));
        }

        #[derive(Deserialize)]
        struct RefreshResponse {
            access_token: String,
            expires_in: Option<u64>,
        }

        let refresh_resp: RefreshResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse refresh response: {}", e))?;

        let expires_at = refresh_resp
            .expires_in
            .map(|d| chrono::Utc::now().timestamp() + d as i64)
            .unwrap_or(chrono::Utc::now().timestamp() + 3600);

        // Get current user info from old tokens
        let current_tokens = {
            let guard = self.tokens.read().await;
            guard.clone()
        };

        let user_info = match current_tokens {
            Some(t) => t.user_info,
            None => {
                // Fetch user info with new token
                crate::auth::fetch_user_info(&refresh_resp.access_token).await?
            }
        };

        let new_tokens = StoredTokens {
            access_token: refresh_resp.access_token,
            refresh_token: Some(refresh_token.to_string()),
            expires_at,
            user_info,
        };

        // Persist the new tokens
        self.persist_tokens(&new_tokens).await?;

        Ok(new_tokens)
    }

    /// Persist tokens to disk
    async fn persist_tokens(&self, tokens: &StoredTokens) -> Result<(), String> {
        let store_path = {
            let guard = self.store_path.read().await;
            guard.clone().ok_or("Store path not initialized")?
        };

        let json = serde_json::to_string_pretty(tokens)
            .map_err(|e| format!("Failed to serialize tokens: {}", e))?;

        std::fs::write(&store_path, json)
            .map_err(|e| format!("Failed to write token store: {}", e))?;

        Ok(())
    }

    /// Store new tokens after successful OAuth exchange
    pub async fn store_tokens(&self, tokens: StoredTokens) -> Result<(), String> {
        // Persist to disk first
        self.persist_tokens(&tokens).await?;

        // Then update memory
        let mut guard = self.tokens.write().await;
        *guard = Some(tokens);

        Ok(())
    }

    /// Get current authentication status
    pub async fn get_auth_status(&self) -> Result<AuthStatus, String> {
        let guard = self.tokens.read().await;

        match &*guard {
            Some(tokens) => {
                let now = chrono::Utc::now().timestamp();
                
                // Consider valid if not expired (with 5 min buffer)
                let is_valid = tokens.expires_at > (now + 300);

                Ok(AuthStatus {
                    is_authenticated: is_valid,
                    user: Some(tokens.user_info.clone()),
                    expires_at: Some(tokens.expires_at),
                })
            }
            None => Ok(AuthStatus {
                is_authenticated: false,
                user: None,
                expires_at: None,
            }),
        }
    }

    /// Get current access token (refreshing if needed)
    pub async fn get_access_token(&self) -> Result<String, String> {
        let tokens = {
            let guard = self.tokens.read().await;
            guard.clone()
        };

        match tokens {
            Some(t) => {
                let now = chrono::Utc::now().timestamp();

                // Check if token is expired or about to expire (5 min buffer)
                if t.expires_at <= (now + 300) {
                    // Try to refresh
                    if let Some(ref refresh_token) = t.refresh_token {
                        println!("Access token expired, refreshing...");
                        let new_tokens = self.refresh_token_internal(refresh_token).await?;
                        
                        // Update in-memory store
                        let mut guard = self.tokens.write().await;
                        let access_token = new_tokens.access_token.clone();
                        *guard = Some(new_tokens);
                        
                        return Ok(access_token);
                    } else {
                        return Err("Token expired and no refresh token available".into());
                    }
                }

                Ok(t.access_token.clone())
            }
            None => Err("Not authenticated".into()),
        }
    }

    /// Clear all stored tokens (logout)
    pub async fn clear_tokens(&self) -> Result<(), String> {
        // Clear from memory
        {
            let mut guard = self.tokens.write().await;
            *guard = None;
        }

        // Delete from disk
        let store_path = {
            let guard = self.store_path.read().await;
            guard.clone()
        };

        if let Some(path) = store_path {
            if path.exists() {
                std::fs::remove_file(&path)
                    .map_err(|e| format!("Failed to delete token store: {}", e))?;
            }
        }

        println!("Session cleared");
        Ok(())
    }
}

impl Default for TokenStore {
    fn default() -> Self {
        Self::new()
    }
}
