//! Google API client modules
//!
//! Provides typed clients for:
//! - Gmail API (threads, messages)
//! - Calendar API (events)
//! - Tasks API (task lists, tasks)

pub mod calendar;
pub mod gmail;
pub mod tasks;
pub mod types;

use reqwest::Client;

/// Base URL for Google APIs
pub const GMAIL_API_BASE: &str = "https://gmail.googleapis.com/gmail/v1";
pub const CALENDAR_API_BASE: &str = "https://www.googleapis.com/calendar/v3";
pub const TASKS_API_BASE: &str = "https://tasks.googleapis.com/tasks/v1";

/// Shared HTTP client for all Google API requests
pub struct GoogleClient {
    http: Client,
}

impl GoogleClient {
    pub fn new() -> Self {
        Self {
            http: Client::new(),
        }
    }

    /// Make an authenticated GET request
    pub async fn get<T: serde::de::DeserializeOwned>(
        &self,
        url: &str,
        token: &str,
    ) -> Result<T, String> {
        let response = self
            .http
            .get(url)
            .bearer_auth(token)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("API error {}: {}", status, body));
        }

        response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    }

    /// Make an authenticated POST request with JSON body
    pub async fn post<T: serde::de::DeserializeOwned, B: serde::Serialize>(
        &self,
        url: &str,
        token: &str,
        body: &B,
    ) -> Result<T, String> {
        let response = self
            .http
            .post(url)
            .bearer_auth(token)
            .json(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("API error {}: {}", status, body));
        }

        response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    }

    /// Make an authenticated PATCH request with JSON body
    pub async fn patch<T: serde::de::DeserializeOwned, B: serde::Serialize>(
        &self,
        url: &str,
        token: &str,
        body: &B,
    ) -> Result<T, String> {
        let response = self
            .http
            .patch(url)
            .bearer_auth(token)
            .json(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("API error {}: {}", status, body));
        }

        response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    }

    /// Make an authenticated DELETE request
    pub async fn delete(&self, url: &str, token: &str) -> Result<(), String> {
        let response = self
            .http
            .delete(url)
            .bearer_auth(token)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("API error {}: {}", status, body));
        }

        Ok(())
    }
}

impl Default for GoogleClient {
    fn default() -> Self {
        Self::new()
    }
}
