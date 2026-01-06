//! Shared types for Google API responses

use serde::{Deserialize, Serialize};

// ================================
// Gmail Types
// ================================

/// Gmail thread summary (from threads.list)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GmailThread {
    pub id: String,
    pub snippet: String,
    pub history_id: Option<String>,
}

/// Gmail threads list response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GmailThreadsResponse {
    pub threads: Option<Vec<GmailThread>>,
    pub next_page_token: Option<String>,
    pub result_size_estimate: Option<u32>,
}

/// Gmail message header
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GmailHeader {
    pub name: String,
    pub value: String,
}

/// Gmail message payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GmailPayload {
    pub headers: Option<Vec<GmailHeader>>,
    #[serde(rename = "mimeType")]
    pub mime_type: Option<String>,
}

/// Gmail message (from threads.get)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GmailMessage {
    pub id: String,
    pub thread_id: String,
    pub label_ids: Option<Vec<String>>,
    pub snippet: String,
    pub payload: Option<GmailPayload>,
    pub internal_date: Option<String>,
}

/// Gmail thread detail (from threads.get)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GmailThreadDetail {
    pub id: String,
    pub messages: Option<Vec<GmailMessage>>,
}

// ================================
// Calendar Types
// ================================

/// Calendar event time (can be date or dateTime)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventDateTime {
    pub date: Option<String>,
    pub date_time: Option<String>,
    pub time_zone: Option<String>,
}

/// Calendar event attendee
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventAttendee {
    pub email: String,
    pub display_name: Option<String>,
    pub response_status: Option<String>,
    #[serde(rename = "self")]
    pub is_self: Option<bool>,
}

/// Calendar event
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEvent {
    pub id: String,
    pub summary: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub start: Option<EventDateTime>,
    pub end: Option<EventDateTime>,
    pub attendees: Option<Vec<EventAttendee>>,
    pub hangout_link: Option<String>,
    pub html_link: Option<String>,
    pub status: Option<String>,
}

/// Calendar events list response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEventsResponse {
    pub items: Option<Vec<CalendarEvent>>,
    pub next_page_token: Option<String>,
    pub time_zone: Option<String>,
}

// ================================
// Tasks Types
// ================================

/// Google Tasks list
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskList {
    pub id: String,
    pub title: String,
    pub updated: Option<String>,
}

/// Tasks lists response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskListsResponse {
    pub items: Option<Vec<TaskList>>,
}

/// Google Task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: Option<String>,
    pub title: String,
    pub notes: Option<String>,
    pub status: Option<String>, // "needsAction" or "completed"
    pub due: Option<String>,
    pub completed: Option<String>,
    pub updated: Option<String>,
    pub parent: Option<String>,
    pub position: Option<String>,
}

/// Tasks list response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TasksResponse {
    pub items: Option<Vec<Task>>,
    #[serde(rename = "nextPageToken")]
    pub next_page_token: Option<String>,
}

/// New task creation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewTask {
    pub title: String,
    pub notes: Option<String>,
    pub due: Option<String>,
}

/// Task update request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskUpdate {
    pub title: Option<String>,
    pub notes: Option<String>,
    pub status: Option<String>,
    pub due: Option<String>,
}

// ================================
// App-specific types
// ================================

/// Processed thread summary for UI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadSummary {
    pub id: String,
    pub subject: String,
    pub snippet: String,
    pub from_name: String,
    pub from_email: String,
    pub date: String,
    pub is_unread: bool,
    pub message_count: u32,
    pub priority_score: f32,
}

/// Processed calendar event for UI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedEvent {
    pub id: String,
    pub title: String,
    pub start_time: String,
    pub end_time: String,
    pub location: Option<String>,
    pub meeting_link: Option<String>,
    pub attendees_count: u32,
}

/// Task reference for tracking external tasks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRef {
    pub provider: String,
    pub external_id: String,
    pub source_thread_id: Option<String>,
    pub last_sync_at: i64,
    pub title: String,
    pub status: String,
    pub due: Option<String>,
}
