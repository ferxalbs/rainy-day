//! Token storage with OS keychain for secrets and JSON for metadata
//!
//! Security model:
//! - refresh_token: Stored in OS Keychain (encrypted by OS)
//! - access_token: In-memory only (short-lived, not persisted)
//! - metadata: Stored in JSON (email, expires_at, scopes - not sensitive)

use crate::auth::{keychain, AuthStatus, UserInfo, GOOGLE_TOKEN_URL};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Session metadata (non-sensitive, stored in JSON)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetadata {
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
    pub expires_at: i64,
    pub scopes_granted: Vec<String>,
}

/// In-memory token data
#[derive(Debug, Clone)]
pub struct ActiveSession {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
    pub user_info: UserInfo,
}

/// Stored tokens format (for migration from old format)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: i64,
    pub user_info: UserInfo,
}

/// Token store with OS keychain for secrets
pub struct TokenStore {
    session: Arc<RwLock<Option<ActiveSession>>>,
    metadata_path: Arc<RwLock<Option<PathBuf>>>,
    client_id: Arc<RwLock<Option<String>>>,
    client_secret: Arc<RwLock<Option<String>>>,
}

const METADATA_FILENAME: &str = "session_metadata.json";
const OLD_SESSION_FILENAME: &str = "auth_session.json";

impl TokenStore {
    pub fn new() -> Self {
        Self {
            session: Arc::new(RwLock::new(None)),
            metadata_path: Arc::new(RwLock::new(None)),
            client_id: Arc::new(RwLock::new(None)),
            client_secret: Arc::new(RwLock::new(None)),
        }
    }

    /// Initialize the store and migrate from old format if needed
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

        // Ensure app data directory exists
        if !app_data_dir.exists() {
            std::fs::create_dir_all(&app_data_dir)
                .map_err(|e| format!("Failed to create app data dir: {}", e))?;
        }

        let metadata_path = app_data_dir.join(METADATA_FILENAME);
        let old_session_path = app_data_dir.join(OLD_SESSION_FILENAME);

        // Store metadata path
        {
            let mut path_guard = self.metadata_path.write().await;
            *path_guard = Some(metadata_path.clone());
        }

        // Migration: Check for old auth_session.json with refresh_token
        if old_session_path.exists() {
            self.migrate_from_old_format(&old_session_path, &metadata_path).await?;
        } else if metadata_path.exists() {
            // Load from new format
            self.load_from_metadata(&metadata_path).await?;
        }

        Ok(())
    }

    /// Migrate from old auth_session.json to keychain
    async fn migrate_from_old_format(
        &self,
        old_path: &PathBuf,
        metadata_path: &PathBuf,
    ) -> Result<(), String> {
        println!("Migrating session from old format to secure keychain...");

        let content = std::fs::read_to_string(old_path)
            .map_err(|e| format!("Failed to read old session: {}", e))?;

        let old_tokens: StoredTokens = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse old session: {}", e))?;

        let email = &old_tokens.user_info.email;

        // Store refresh_token in keychain (if present)
        if let Some(ref refresh_token) = old_tokens.refresh_token {
            keychain::store_refresh_token(email, refresh_token)?;
            println!("Migrated refresh_token to OS keychain for: {}", email);
        }

        // Create new metadata file (without secrets)
        let metadata = SessionMetadata {
            email: email.clone(),
            name: old_tokens.user_info.name.clone(),
            picture: old_tokens.user_info.picture.clone(),
            expires_at: old_tokens.expires_at,
            scopes_granted: vec![], // We don't have this info from old format
        };

        let metadata_json = serde_json::to_string_pretty(&metadata)
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

        std::fs::write(metadata_path, metadata_json)
            .map_err(|e| format!("Failed to write metadata: {}", e))?;

        // Delete old session file (contains secrets)
        std::fs::remove_file(old_path)
            .map_err(|e| format!("Failed to delete old session file: {}", e))?;

        println!("Migration complete. Old session file deleted.");

        // Now load the session
        self.load_from_metadata(metadata_path).await
    }

    /// Load session from metadata + keychain
    async fn load_from_metadata(&self, metadata_path: &PathBuf) -> Result<(), String> {
        let content = std::fs::read_to_string(metadata_path)
            .map_err(|e| format!("Failed to read metadata: {}", e))?;

        let metadata: SessionMetadata = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse metadata: {}", e))?;

        let now = chrono::Utc::now().timestamp();

        // Get refresh_token from keychain
        let refresh_token = match keychain::get_refresh_token(&metadata.email)? {
            Some(token) => token,
            None => {
                println!("No refresh token in keychain for: {}", metadata.email);
                // Clean up orphaned metadata
                let _ = std::fs::remove_file(metadata_path);
                return Ok(());
            }
        };

        // Check if we need to refresh
        if metadata.expires_at <= now {
            println!("Session expired, attempting refresh for: {}", metadata.email);
            match self.refresh_token_internal(&refresh_token, &metadata).await {
                Ok(session) => {
                    let mut guard = self.session.write().await;
                    *guard = Some(session);
                    println!("Session refreshed successfully");
                }
                Err(e) => {
                    eprintln!("Failed to refresh session: {}", e);
                    // Clear stale data
                    let _ = keychain::delete_refresh_token(&metadata.email);
                    let _ = std::fs::remove_file(metadata_path);
                }
            }
        } else {
            // Session still valid - we don't have access_token, need to refresh
            // In practice, access_token is short-lived so we always refresh on startup
            println!("Loading session, refreshing access token for: {}", metadata.email);
            match self.refresh_token_internal(&refresh_token, &metadata).await {
                Ok(session) => {
                    let mut guard = self.session.write().await;
                    *guard = Some(session);
                }
                Err(e) => {
                    eprintln!("Failed to refresh on load: {}", e);
                }
            }
        }

        Ok(())
    }

    /// Refresh token using the refresh_token
    async fn refresh_token_internal(
        &self,
        refresh_token: &str,
        metadata: &SessionMetadata,
    ) -> Result<ActiveSession, String> {
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

        // Update metadata with new expiry
        self.save_metadata(&SessionMetadata {
            expires_at,
            ..metadata.clone()
        }).await?;

        Ok(ActiveSession {
            access_token: refresh_resp.access_token,
            refresh_token: refresh_token.to_string(),
            expires_at,
            user_info: UserInfo {
                email: metadata.email.clone(),
                name: metadata.name.clone(),
                picture: metadata.picture.clone(),
            },
        })
    }

    /// Save metadata to JSON file
    async fn save_metadata(&self, metadata: &SessionMetadata) -> Result<(), String> {
        let path = {
            let guard = self.metadata_path.read().await;
            guard.clone().ok_or("Metadata path not initialized")?
        };

        let json = serde_json::to_string_pretty(metadata)
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

        std::fs::write(&path, json)
            .map_err(|e| format!("Failed to write metadata: {}", e))?;

        Ok(())
    }

    /// Store new tokens after successful OAuth exchange
    pub async fn store_tokens(&self, tokens: StoredTokens) -> Result<(), String> {
        let email = &tokens.user_info.email;

        // Store refresh_token in keychain (if present)
        if let Some(ref refresh_token) = tokens.refresh_token {
            keychain::store_refresh_token(email, refresh_token)?;
        }

        // Save metadata (no secrets)
        let metadata = SessionMetadata {
            email: email.clone(),
            name: tokens.user_info.name.clone(),
            picture: tokens.user_info.picture.clone(),
            expires_at: tokens.expires_at,
            scopes_granted: vec![], // TODO: Store granted scopes
        };
        self.save_metadata(&metadata).await?;

        // Update in-memory session
        let session = ActiveSession {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token.unwrap_or_default(),
            expires_at: tokens.expires_at,
            user_info: tokens.user_info,
        };

        let mut guard = self.session.write().await;
        *guard = Some(session);

        Ok(())
    }

    /// Get current authentication status
    pub async fn get_auth_status(&self) -> Result<AuthStatus, String> {
        let guard = self.session.read().await;

        match &*guard {
            Some(session) => {
                let now = chrono::Utc::now().timestamp();
                // Consider valid if not expired (with 5 min buffer)
                let is_valid = session.expires_at > (now + 300);

                Ok(AuthStatus {
                    is_authenticated: is_valid,
                    user: Some(session.user_info.clone()),
                    expires_at: Some(session.expires_at),
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
        let session = {
            let guard = self.session.read().await;
            guard.clone()
        };

        match session {
            Some(s) => {
                let now = chrono::Utc::now().timestamp();

                // Check if token is expired or about to expire (5 min buffer)
                if s.expires_at <= (now + 300) {
                    println!("Access token expired, refreshing...");
                    
                    let metadata = SessionMetadata {
                        email: s.user_info.email.clone(),
                        name: s.user_info.name.clone(),
                        picture: s.user_info.picture.clone(),
                        expires_at: s.expires_at,
                        scopes_granted: vec![],
                    };

                    let new_session = self.refresh_token_internal(&s.refresh_token, &metadata).await?;
                    let access_token = new_session.access_token.clone();

                    let mut guard = self.session.write().await;
                    *guard = Some(new_session);

                    return Ok(access_token);
                }

                Ok(s.access_token.clone())
            }
            None => Err("Not authenticated".into()),
        }
    }

    /// Clear all stored tokens (logout)
    pub async fn clear_tokens(&self) -> Result<(), String> {
        // Get email before clearing
        let email = {
            let guard = self.session.read().await;
            guard.as_ref().map(|s| s.user_info.email.clone())
        };

        // Clear from keychain
        if let Some(email) = email {
            keychain::delete_refresh_token(&email)?;
        }

        // Clear metadata file
        let metadata_path = {
            let guard = self.metadata_path.read().await;
            guard.clone()
        };
        if let Some(path) = metadata_path {
            if path.exists() {
                let _ = std::fs::remove_file(&path);
            }
        }

        // Clear from memory
        {
            let mut guard = self.session.write().await;
            *guard = None;
        }

        println!("Session cleared (keychain + metadata)");
        Ok(())
    }
}

impl Default for TokenStore {
    fn default() -> Self {
        Self::new()
    }
}
