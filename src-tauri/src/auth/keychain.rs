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
    let entry = Entry::new(SERVICE_NAME, &key)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    
    entry.set_password(token)
        .map_err(|e| format!("Failed to store refresh token in keychain: {}", e))?;
    
    println!("Refresh token stored securely in OS keychain for: {}", email);
    Ok(())
}

/// Retrieve refresh token from the OS keychain
pub fn get_refresh_token(email: &str) -> Result<Option<String>, String> {
    let key = format!("{}:{}", email, REFRESH_TOKEN_KEY);
    let entry = Entry::new(SERVICE_NAME, &key)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    
    match entry.get_password() {
        Ok(token) => {
            println!("Refresh token retrieved from OS keychain for: {}", email);
            Ok(Some(token))
        }
        Err(keyring::Error::NoEntry) => {
            // No token stored for this account
            Ok(None)
        }
        Err(e) => {
            Err(format!("Failed to retrieve refresh token from keychain: {}", e))
        }
    }
}

/// Delete refresh token from the OS keychain
pub fn delete_refresh_token(email: &str) -> Result<(), String> {
    let key = format!("{}:{}", email, REFRESH_TOKEN_KEY);
    let entry = Entry::new(SERVICE_NAME, &key)
        .map_err(|e| format!("Keychain entry error: {}", e))?;
    
    match entry.delete_credential() {
        Ok(()) => {
            println!("Refresh token deleted from OS keychain for: {}", email);
            Ok(())
        }
        Err(keyring::Error::NoEntry) => {
            // Already deleted or never existed
            Ok(())
        }
        Err(e) => {
            Err(format!("Failed to delete refresh token from keychain: {}", e))
        }
    }
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
