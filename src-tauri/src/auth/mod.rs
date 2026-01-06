//! Authentication module for Google OAuth2 with PKCE
//!
//! For desktop apps, Google requires using a loopback redirect (http://127.0.0.1:port)
//! instead of custom URI schemes. This module:
//! - Starts a local HTTP server to receive the OAuth callback
//! - Generates the authorization URL with PKCE
//! - Exchanges the code for tokens
//! - Stores tokens securely

mod token_store;

use oauth2::{
    basic::BasicClient, AuthUrl, ClientId, CsrfToken, PkceCodeChallenge, RedirectUrl, Scope,
    TokenUrl,
};
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

pub use token_store::TokenStore;

/// Google OAuth2 configuration
const GOOGLE_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
pub const GOOGLE_TOKEN_URL: &str = "https://oauth2.googleapis.com/token";

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
    pub pkce_verifier: String,
    pub csrf_token: String,
    pub redirect_port: u16,
}

/// Manages the OAuth2 authorization state
pub struct AuthState {
    pub pending: Arc<Mutex<Option<PendingAuth>>>,
    pub client_id: String,
    pub client_secret: String,
}

impl AuthState {
    pub fn new(client_id: String, client_secret: String) -> Self {
        Self {
            pending: Arc::new(Mutex::new(None)),
            client_id,
            client_secret,
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

/// Find an available port for the OAuth callback server
fn find_available_port() -> Result<u16, String> {
    // Try ports in the range 8400-8500
    for port in 8400..8500 {
        if TcpListener::bind(format!("127.0.0.1:{}", port)).is_ok() {
            return Ok(port);
        }
    }
    Err("No available port found for OAuth callback".into())
}

/// Generates the OAuth2 authorization URL for Google sign-in
/// Returns the URL to open in the browser
#[tauri::command]
pub async fn start_google_auth(state: State<'_, AuthState>) -> Result<String, String> {
    // Find an available port for the callback server
    let port = find_available_port()?;
    let redirect_uri = format!("http://127.0.0.1:{}", port);

    let client = BasicClient::new(ClientId::new(state.client_id.clone()))
        .set_auth_uri(AuthUrl::new(GOOGLE_AUTH_URL.to_string()).map_err(|e| e.to_string())?)
        .set_token_uri(TokenUrl::new(GOOGLE_TOKEN_URL.to_string()).map_err(|e| e.to_string())?)
        .set_redirect_uri(RedirectUrl::new(redirect_uri).map_err(|e| e.to_string())?);

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

    // Store pending auth state (store secrets as strings for simplicity)
    let mut pending = state.pending.lock().await;
    *pending = Some(PendingAuth {
        pkce_verifier: pkce_verifier.secret().to_string(),
        csrf_token: csrf_token.secret().to_string(),
        redirect_port: port,
    });

    println!("Generated auth URL for port {}", port);
    Ok(auth_url.to_string())
}

/// Token response from Google
#[derive(Debug, Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: Option<u64>,
    #[allow(dead_code)]
    token_type: String,
}

/// Wait for OAuth callback and exchange code for tokens
#[tauri::command]
pub async fn wait_for_oauth_callback(
    state: State<'_, AuthState>,
    token_store: State<'_, TokenStore>,
) -> Result<AuthStatus, String> {
    // Get the pending auth state
    let pending_guard = state.pending.lock().await;
    let pending = pending_guard
        .as_ref()
        .ok_or("No pending OAuth flow. Call start_google_auth first.")?;

    let port = pending.redirect_port;
    let expected_state = pending.csrf_token.clone();
    let pkce_verifier = pending.pkce_verifier.clone();
    let client_id = state.client_id.clone();
    let client_secret = state.client_secret.clone();
    drop(pending_guard);

    println!("Starting OAuth callback server on port {}...", port);

    // Run the blocking TCP server in a separate thread
    let callback_result = tokio::task::spawn_blocking(move || {
        wait_for_callback_sync(port)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
    .map_err(|e| format!("Callback error: {}", e))?;

    let (code, received_state) = callback_result;
    
    println!("Received OAuth callback with code");

    // Verify CSRF token
    if expected_state != received_state {
        return Err("CSRF token mismatch - possible attack".into());
    }

    // Clear pending state
    let mut pending_guard = state.pending.lock().await;
    *pending_guard = None;
    drop(pending_guard);

    // Exchange code for tokens using reqwest with timeout
    let redirect_uri = format!("http://127.0.0.1:{}", port);
    
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    println!("Exchanging code for tokens at {}...", GOOGLE_TOKEN_URL);
    println!("  redirect_uri: {}", redirect_uri);
    println!("  client_id: {}...", &client_id[..20.min(client_id.len())]);

    let form_data = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", &code),
        ("code_verifier", &pkce_verifier),
        ("grant_type", "authorization_code"),
        ("redirect_uri", &redirect_uri),
    ];

    let token_response = http_client
        .post(GOOGLE_TOKEN_URL)
        .form(&form_data)
        .send()
        .await
        .map_err(|e| {
            eprintln!("Token exchange request failed: {:?}", e);
            format!("Failed to exchange code: {}", e)
        })?;

    println!("Token response status: {}", token_response.status());

    if !token_response.status().is_success() {
        let error_text = token_response.text().await.unwrap_or_default();
        eprintln!("Token exchange error: {}", error_text);
        return Err(format!("Token exchange failed: {}", error_text));
    }

    let response_text = token_response.text().await
        .map_err(|e| format!("Failed to read token response: {}", e))?;
    
    println!("Token response received, length: {} bytes", response_text.len());

    let tokens: GoogleTokenResponse = serde_json::from_str(&response_text)
        .map_err(|e| {
            eprintln!("Failed to parse: {}", &response_text[..200.min(response_text.len())]);
            format!("Failed to parse token response: {}", e)
        })?;

    println!("Token exchange successful, fetching user info...");

    // Get user info from Google
    let user_info = fetch_user_info(&tokens.access_token).await?;

    // Calculate expiration
    let expires_at = tokens
        .expires_in
        .map(|d| chrono::Utc::now().timestamp() + d as i64);

    // Store tokens
    let stored = token_store::StoredTokens {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expires_at.unwrap_or(0),
        user_info: user_info.clone(),
    };
    token_store.store_tokens(stored).await?;

    println!("Authentication complete for: {}", user_info.email);

    Ok(AuthStatus {
        is_authenticated: true,
        user: Some(user_info),
        expires_at,
    })
}

/// Synchronous function to wait for OAuth callback (runs in spawn_blocking)
fn wait_for_callback_sync(port: u16) -> Result<(String, String), String> {
    // Start a simple HTTP server to receive the callback
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Failed to start callback server on port {}: {}", port, e))?;

    println!("Listening on 127.0.0.1:{}...", port);

    // Accept one connection (blocking)
    let (mut stream, addr) = listener
        .accept()
        .map_err(|e| format!("Failed to accept connection: {}", e))?;

    println!("Received connection from {}", addr);

    // Read the request
    let mut buffer = [0; 4096];
    let n = stream
        .read(&mut buffer)
        .map_err(|e| format!("Failed to read request: {}", e))?;

    let request = String::from_utf8_lossy(&buffer[..n]);

    // Parse the authorization code from the request
    let code = extract_param(&request, "code").ok_or("No authorization code in callback")?;
    let received_state =
        extract_param(&request, "state").ok_or("No state parameter in callback")?;

    // Send success response to browser
    let response = r#"HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Connection: close

<!DOCTYPE html>
<html>
<head>
    <title>Rainy Day - Autenticación Exitosa</title>
    <style>
        body { font-family: -apple-system, system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #020617; color: #f8fafc; }
        .container { text-align: center; padding: 2rem; }
        h1 { color: #3b82f6; margin-bottom: 1rem; }
        p { color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Autenticación Exitosa</h1>
        <p>Puedes cerrar esta ventana y volver a Rainy Day.</p>
    </div>
</body>
</html>"#;

    stream.write_all(response.as_bytes()).ok();
    stream.flush().ok();

    Ok((code, received_state))
}

/// Fetch user info from Google
pub async fn fetch_user_info(access_token: &str) -> Result<UserInfo, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch user info: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Failed to fetch user info: {}", response.status()));
    }

    #[derive(Deserialize)]
    struct GoogleUserInfo {
        email: String,
        name: Option<String>,
        picture: Option<String>,
    }

    let info: GoogleUserInfo = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse user info: {}", e))?;

    Ok(UserInfo {
        email: info.email,
        name: info.name,
        picture: info.picture,
    })
}

/// Extract a query parameter from an HTTP request
fn extract_param(request: &str, param: &str) -> Option<String> {
    let query_start = request.find('?')?;
    let query_end = request.find(" HTTP").unwrap_or(request.len());
    let query = &request[query_start + 1..query_end];

    for pair in query.split('&') {
        let mut parts = pair.split('=');
        if let (Some(key), Some(value)) = (parts.next(), parts.next()) {
            if key == param {
                return Some(urlencoding::decode(value).ok()?.into_owned());
            }
        }
    }
    None
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
