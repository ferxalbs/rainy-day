//! Authentication module for Google OAuth2 with PKCE
//!
//! This module handles:
//! - OAuth2 authorization URL generation
//! - Callback handling via deep-link
//! - Token exchange and storage in Stronghold
//! - Token refresh logic

mod token_store;

use oauth2::{
    basic::BasicClient, AuthUrl, ClientId, CsrfToken, PkceCodeChallenge, PkceCodeVerifier,
    RedirectUrl, Scope, TokenUrl,
};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

pub use token_store::TokenStore;

/// Google OAuth2 configuration
const GOOGLE_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const REDIRECT_URI: &str = "rainyday://callback";

/// OAuth scopes for Google APIs (minimal, read-only where possible)
pub const SCOPES: &[&str] = &[
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/tasks",
    "openid",
    "email",
    "profile",
];

/// Pending OAuth state during authorization flow
#[derive(Debug)]
pub struct PendingAuth {
    pub pkce_verifier: PkceCodeVerifier,
    pub csrf_token: CsrfToken,
}

/// Manages the OAuth2 authorization state
pub struct AuthState {
    pub pending: Mutex<Option<PendingAuth>>,
    pub client_id: String,
}

impl AuthState {
    pub fn new(client_id: String) -> Self {
        Self {
            pending: Mutex::new(None),
            client_id,
        }
    }
}

/// User info returned after successful authentication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,
}

/// Authentication status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthStatus {
    pub is_authenticated: bool,
    pub user: Option<UserInfo>,
    pub expires_at: Option<i64>,
}

/// Generates the OAuth2 authorization URL for Google sign-in
#[tauri::command]
pub fn start_google_auth(state: State<'_, AuthState>) -> Result<String, String> {
    let client = BasicClient::new(ClientId::new(state.client_id.clone()))
        .set_auth_uri(AuthUrl::new(GOOGLE_AUTH_URL.to_string()).map_err(|e| e.to_string())?)
        .set_token_uri(TokenUrl::new(GOOGLE_TOKEN_URL.to_string()).map_err(|e| e.to_string())?)
        .set_redirect_uri(RedirectUrl::new(REDIRECT_URI.to_string()).map_err(|e| e.to_string())?);

    // Generate PKCE challenge (required for public clients)
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

    // Build authorization URL
    let mut auth_request = client
        .authorize_url(CsrfToken::new_random)
        .set_pkce_challenge(pkce_challenge);

    // Add scopes
    for scope in SCOPES {
        auth_request = auth_request.add_scope(Scope::new(scope.to_string()));
    }

    let (auth_url, csrf_token) = auth_request.url();

    // Store pending auth state
    let mut pending = state.pending.lock().map_err(|e| e.to_string())?;
    *pending = Some(PendingAuth {
        pkce_verifier,
        csrf_token,
    });

    Ok(auth_url.to_string())
}

/// Check if user is currently authenticated
#[tauri::command]
pub async fn is_authenticated(token_store: State<'_, TokenStore>) -> Result<AuthStatus, String> {
    token_store.get_auth_status().await
}

/// Log out the current user
#[tauri::command]
pub async fn logout(token_store: State<'_, TokenStore>) -> Result<(), String> {
    token_store.clear_tokens().await
}
