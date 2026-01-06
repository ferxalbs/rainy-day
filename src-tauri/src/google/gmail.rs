//! Gmail API client
//!
//! Endpoints:
//! - threads.list: List email threads
//! - threads.get: Get thread detail with messages

use super::types::{GmailThreadDetail, GmailThreadsResponse, ThreadSummary};
use super::{GoogleClient, GMAIL_API_BASE};
use crate::auth::TokenStore;
use tauri::State;

/// List email threads from inbox
///
/// Uses Gmail query syntax for filtering (same as Gmail search)
#[tauri::command]
pub async fn get_inbox_summary(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    max_items: Option<u32>,
    query: Option<String>,
) -> Result<Vec<ThreadSummary>, String> {
    let token = token_store.get_access_token().await?;

    let max = max_items.unwrap_or(20).min(50);
    let q = query.unwrap_or_else(|| "in:inbox is:unread".to_string());

    let url = format!(
        "{}/users/me/threads?maxResults={}&q={}",
        GMAIL_API_BASE,
        max,
        urlencoding::encode(&q)
    );

    let response: GmailThreadsResponse = client.get(&url, &token).await?;

    // For now, return basic thread info. Full processing requires threads.get for each
    let threads = response.threads.unwrap_or_default();

    let summaries: Vec<ThreadSummary> = threads
        .into_iter()
        .map(|t| ThreadSummary {
            id: t.id,
            subject: String::new(), // Would need threads.get for this
            snippet: t.snippet,
            from_name: String::new(),
            from_email: String::new(),
            date: String::new(),
            is_unread: true,
            message_count: 1,
            priority_score: 0.5,
        })
        .collect();

    Ok(summaries)
}

/// Get detailed thread information including all messages
#[tauri::command]
pub async fn get_thread_detail(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    thread_id: String,
) -> Result<GmailThreadDetail, String> {
    let token = token_store.get_access_token().await?;

    let url = format!(
        "{}/users/me/threads/{}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date",
        GMAIL_API_BASE,
        thread_id
    );

    client.get(&url, &token).await
}

/// Open a thread in Gmail web
#[tauri::command]
pub fn open_thread_in_gmail(thread_id: String) -> String {
    format!("https://mail.google.com/mail/u/0/#inbox/{}", thread_id)
}
