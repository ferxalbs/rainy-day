//! Token storage using Tauri Stronghold plugin
//!
//! Tokens are encrypted and stored in the macOS Keychain via Stronghold.

use crate::auth::{AuthStatus, UserInfo};
use serde::{Deserialize, Serialize};
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

/// Token store backed by Stronghold
pub struct TokenStore {
    tokens: Arc<RwLock<Option<StoredTokens>>>,
}

impl TokenStore {
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(RwLock::new(None)),
        }
    }

    /// Store new tokens after successful OAuth exchange
    pub async fn store_tokens(&self, tokens: StoredTokens) -> Result<(), String> {
        let mut guard = self.tokens.write().await;
        *guard = Some(tokens);
        // TODO: Persist to Stronghold vault
        Ok(())
    }

    /// Get current authentication status
    pub async fn get_auth_status(&self) -> Result<AuthStatus, String> {
        let guard = self.tokens.read().await;

        match &*guard {
            Some(tokens) => {
                let now = chrono::Utc::now().timestamp();
                let is_valid = tokens.expires_at > now;

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
        let guard = self.tokens.read().await;

        match &*guard {
            Some(tokens) => {
                let now = chrono::Utc::now().timestamp();

                if tokens.expires_at > now {
                    Ok(tokens.access_token.clone())
                } else {
                    // TODO: Implement token refresh
                    Err("Token expired, refresh not implemented yet".into())
                }
            }
            None => Err("Not authenticated".into()),
        }
    }

    /// Clear all stored tokens (logout)
    pub async fn clear_tokens(&self) -> Result<(), String> {
        let mut guard = self.tokens.write().await;
        *guard = None;
        // TODO: Clear from Stronghold vault
        Ok(())
    }
}

impl Default for TokenStore {
    fn default() -> Self {
        Self::new()
    }
}
