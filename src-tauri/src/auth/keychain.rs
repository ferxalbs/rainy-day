//! Native OS Keychain access for secure token storage
//!
//! Uses the system keychain:
//! - macOS: Keychain (AES-256-GCM encrypted)
//! - Windows: Credential Manager
//! - Linux: Secret Service (GNOME Keyring, KWallet)

use keyring::Entry;

/// Service name for keychain entries
const SERVICE_NAME: &str = "com.enosislabs.rainyday";

/// Key suffix for refresh tokens
const REFRESH_TOKEN_KEY: &str = "refresh_token";

/// Store refresh token in the OS keychain
pub fn store_refresh_token(email: &str, token: &str) -> Result<(), String> {
    let key = format!("{}:{}", email, REFRESH_TOKEN_KEY);
    let entry =
        Entry::new(SERVICE_NAME, &key).map_err(|e| format!("Keychain entry error: {}", e))?;

    entry
        .set_password(token)
        .map_err(|e| format!("Failed to store refresh token in keychain: {}", e))?;

    println!(
        "Refresh token stored securely in OS keychain for: {}",
        email
    );
    Ok(())
}

/// Retrieve refresh token from the OS keychain
pub fn get_refresh_token(email: &str) -> Result<Option<String>, String> {
    let key = format!("{}:{}", email, REFRESH_TOKEN_KEY);
    let entry =
        Entry::new(SERVICE_NAME, &key).map_err(|e| format!("Keychain entry error: {}", e))?;

    match entry.get_password() {
        Ok(token) => {
            println!("Refresh token retrieved from OS keychain for: {}", email);
            Ok(Some(token))
        }
        Err(keyring::Error::NoEntry) => {
            // No token stored for this account
            Ok(None)
        }
        Err(e) => Err(format!(
            "Failed to retrieve refresh token from keychain: {}",
            e
        )),
    }
}

/// Delete refresh token from the OS keychain
pub fn delete_refresh_token(email: &str) -> Result<(), String> {
    let key = format!("{}:{}", email, REFRESH_TOKEN_KEY);
    let entry =
        Entry::new(SERVICE_NAME, &key).map_err(|e| format!("Keychain entry error: {}", e))?;

    match entry.delete_credential() {
        Ok(()) => {
            println!("Refresh token deleted from OS keychain for: {}", email);
            Ok(())
        }
        Err(keyring::Error::NoEntry) => {
            // Already deleted or never existed
            Ok(())
        }
        Err(e) => Err(format!(
            "Failed to delete refresh token from keychain: {}",
            e
        )),
    }
}

// ============================================================================
// Backend JWT Token Storage
// ============================================================================

/// Key for backend access token
const BACKEND_ACCESS_KEY: &str = "backend_access_token";
/// Key for backend refresh token
const BACKEND_REFRESH_KEY: &str = "backend_refresh_token";

/// Store backend tokens in the OS keychain
pub fn store_backend_tokens(access_token: &str, refresh_token: &str) -> Result<(), String> {
    // Store access token
    let access_entry = Entry::new(SERVICE_NAME, BACKEND_ACCESS_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    access_entry
        .set_password(access_token)
        .map_err(|e| format!("Failed to store backend access token: {}", e))?;

    // Store refresh token
    let refresh_entry = Entry::new(SERVICE_NAME, BACKEND_REFRESH_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    refresh_entry
        .set_password(refresh_token)
        .map_err(|e| format!("Failed to store backend refresh token: {}", e))?;

    println!("Backend tokens stored securely in OS keychain");
    Ok(())
}

/// Retrieve backend access token from the OS keychain
pub fn get_backend_access_token() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, BACKEND_ACCESS_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;

    match entry.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve backend access token: {}", e)),
    }
}

/// Retrieve backend refresh token from the OS keychain
pub fn get_backend_refresh_token() -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, BACKEND_REFRESH_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;

    match entry.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve backend refresh token: {}", e)),
    }
}

/// Delete backend tokens from the OS keychain
pub fn clear_backend_tokens() -> Result<(), String> {
    // Delete access token
    let access_entry = Entry::new(SERVICE_NAME, BACKEND_ACCESS_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    let _ = access_entry.delete_credential(); // Ignore if not exists

    // Delete refresh token
    let refresh_entry = Entry::new(SERVICE_NAME, BACKEND_REFRESH_KEY)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    let _ = refresh_entry.delete_credential(); // Ignore if not exists

    println!("Backend tokens cleared from OS keychain");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These tests interact with the real OS keychain
    // Run with caution in CI environments

    #[test]
    #[ignore] // Run manually: cargo test -- --ignored
    fn test_keychain_operations() {
        let test_email = "test@example.com";
        let test_token = "test_refresh_token_12345";

        // Store
        store_refresh_token(test_email, test_token).expect("Failed to store");

        // Retrieve
        let retrieved = get_refresh_token(test_email).expect("Failed to get");
        assert_eq!(retrieved, Some(test_token.to_string()));

        // Delete
        delete_refresh_token(test_email).expect("Failed to delete");

        // Verify deleted
        let after_delete = get_refresh_token(test_email).expect("Failed to get after delete");
        assert_eq!(after_delete, None);
    }
}
