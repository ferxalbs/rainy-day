//! Data Pipeline Module - Parallel Data Transformation
//!
//! High-performance data transformation layer for Note AI and unified backend.
//! Uses Rayon for parallel processing of API responses.
//!
//! @since v0.5.20

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// ============================================================================
// Note Context Preparation
// ============================================================================

/// Email summary for Note AI context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailSummary {
    pub id: String,
    pub subject: String,
    pub from_name: String,
    pub from_email: String,
    pub snippet: String,
    pub timestamp_ms: i64,
    pub is_unread: bool,
    pub priority_score: Option<f64>,
}

/// Task summary for Note AI context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskSummary {
    pub id: String,
    pub title: String,
    pub due_ms: Option<i64>,
    pub completed: bool,
    pub list_name: Option<String>,
}

/// Event summary for Note AI context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventSummary {
    pub id: String,
    pub title: String,
    pub start_ms: i64,
    pub end_ms: i64,
    pub is_all_day: bool,
    pub has_meeting_link: bool,
    pub attendee_count: usize,
}

/// Processed context for Note AI generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteGenerationContext {
    /// High-priority emails requiring attention
    pub priority_emails: Vec<ProcessedEmailContext>,
    /// Total email count for the day
    pub total_emails: usize,
    /// Unread email count
    pub unread_count: usize,

    /// Outstanding tasks
    pub outstanding_tasks: Vec<ProcessedTaskContext>,
    /// Completed tasks count
    pub completed_tasks: usize,
    /// Total task count
    pub total_tasks: usize,
    /// Overdue task count
    pub overdue_count: usize,

    /// Today's events
    pub todays_events: Vec<ProcessedEventContext>,
    /// Meeting count
    pub meeting_count: usize,
    /// Total event hours
    pub total_event_hours: f64,

    /// Processing metadata
    pub processed_at_ms: i64,
    pub context_tokens_estimate: usize,
}

/// Processed email for AI context (minimal token footprint)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedEmailContext {
    pub subject: String,
    pub from: String,
    pub priority: String, // "high", "medium", "low"
    pub age: String,      // "1h", "3h", "1d"
    pub needs_reply: bool,
}

/// Processed task for AI context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedTaskContext {
    pub title: String,
    pub due: Option<String>, // "today", "tomorrow", "overdue", "Jan 15"
    pub priority: String,    // "high", "medium", "low"
    pub list: Option<String>,
}

/// Processed event for AI context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedEventContext {
    pub title: String,
    pub time: String, // "10:00 AM - 11:00 AM"
    pub is_meeting: bool,
    pub attendees: Option<usize>,
}

/// Prepare context for Note AI generation (parallelized)
#[tauri::command]
pub fn prepare_note_context(
    emails: Vec<EmailSummary>,
    tasks: Vec<TaskSummary>,
    events: Vec<EventSummary>,
) -> NoteGenerationContext {
    let now = chrono::Utc::now().timestamp_millis();
    let today_start = chrono::Local::now()
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .and_then(|d| chrono::Local.from_local_datetime(&d).single())
        .map(|d| d.timestamp_millis())
        .unwrap_or(0);
    let today_end = today_start + 86_400_000;

    // Process emails in parallel
    let unread_count = emails.iter().filter(|e| e.is_unread).count();
    let priority_emails: Vec<ProcessedEmailContext> = emails
        .par_iter()
        .filter(|e| e.priority_score.unwrap_or(0.5) > 0.6 || e.is_unread)
        .take_any(10) // Top 10 priority emails
        .map(|e| {
            let age = format_age(now - e.timestamp_ms);
            let priority = match e.priority_score.unwrap_or(0.5) {
                s if s > 0.8 => "high",
                s if s > 0.6 => "medium",
                _ => "low",
            };
            ProcessedEmailContext {
                subject: truncate_string(&e.subject, 80),
                from: e.from_name.clone(),
                priority: priority.to_string(),
                age,
                needs_reply: e.is_unread && e.priority_score.unwrap_or(0.0) > 0.7,
            }
        })
        .collect();

    // Process tasks in parallel
    let completed_tasks = tasks.iter().filter(|t| t.completed).count();
    let overdue_count = tasks
        .iter()
        .filter(|t| !t.completed && t.due_ms.map(|d| d < now).unwrap_or(false))
        .count();

    let outstanding_tasks: Vec<ProcessedTaskContext> = tasks
        .par_iter()
        .filter(|t| !t.completed)
        .map(|t| {
            let (due, priority) = if let Some(due_ms) = t.due_ms {
                let due_str = if due_ms < now {
                    "overdue".to_string()
                } else if due_ms < today_end {
                    "today".to_string()
                } else if due_ms < today_end + 86_400_000 {
                    "tomorrow".to_string()
                } else {
                    format_date_short(due_ms)
                };
                let priority = if due_ms < now {
                    "high"
                } else if due_ms < today_end {
                    "high"
                } else if due_ms < today_end + 86_400_000 * 3 {
                    "medium"
                } else {
                    "low"
                };
                (Some(due_str), priority.to_string())
            } else {
                (None, "medium".to_string())
            };

            ProcessedTaskContext {
                title: truncate_string(&t.title, 100),
                due,
                priority,
                list: t.list_name.clone(),
            }
        })
        .collect();

    // Process events in parallel
    let meeting_count = events
        .iter()
        .filter(|e| e.has_meeting_link || e.attendee_count > 1)
        .count();
    let total_event_hours: f64 = events
        .iter()
        .filter(|e| !e.is_all_day)
        .map(|e| (e.end_ms - e.start_ms) as f64 / 3_600_000.0)
        .sum();

    let todays_events: Vec<ProcessedEventContext> = events
        .par_iter()
        .filter(|e| e.start_ms >= today_start && e.start_ms < today_end)
        .map(|e| ProcessedEventContext {
            title: truncate_string(&e.title, 60),
            time: if e.is_all_day {
                "All day".to_string()
            } else {
                format_time_range(e.start_ms, e.end_ms)
            },
            is_meeting: e.has_meeting_link || e.attendee_count > 1,
            attendees: if e.attendee_count > 1 {
                Some(e.attendee_count)
            } else {
                None
            },
        })
        .collect();

    // Estimate tokens (rough approximation)
    let context_tokens_estimate =
        priority_emails.len() * 30 + outstanding_tasks.len() * 20 + todays_events.len() * 15 + 50; // Base overhead

    NoteGenerationContext {
        priority_emails,
        total_emails: emails.len(),
        unread_count,
        outstanding_tasks,
        completed_tasks,
        total_tasks: tasks.len(),
        overdue_count,
        todays_events,
        meeting_count,
        total_event_hours,
        processed_at_ms: now,
        context_tokens_estimate,
    }
}

// ============================================================================
// Schema Validation
// ============================================================================

/// Validated note structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatedNote {
    pub id: String,
    pub date: String,
    pub sections: Vec<ValidatedSection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatedSection {
    pub id: String,
    pub section_type: String,
    pub title: String,
    pub content: String,
}

/// Validate note schema
#[tauri::command]
pub fn validate_note_schema(note: Value) -> Result<ValidatedNote, String> {
    // Check required fields
    let id = note
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or("Missing 'id' field")?;

    let date = note
        .get("date")
        .and_then(|v| v.as_str())
        .ok_or("Missing 'date' field")?;

    // Validate date format (YYYY-MM-DD)
    if !is_valid_date_format(date) {
        return Err("Invalid date format, expected YYYY-MM-DD".to_string());
    }

    let sections_raw = note
        .get("sections")
        .and_then(|v| v.as_array())
        .ok_or("Missing 'sections' array")?;

    let mut sections = Vec::new();
    for (i, section) in sections_raw.iter().enumerate() {
        let section_id = section
            .get("id")
            .and_then(|v| v.as_str())
            .ok_or(format!("Section {} missing 'id'", i))?;

        let section_type = section
            .get("type")
            .and_then(|v| v.as_str())
            .ok_or(format!("Section {} missing 'type'", i))?;

        // Validate section type
        let valid_types = ["email_summary", "task_recap", "meeting_notes", "custom"];
        if !valid_types.contains(&section_type) {
            return Err(format!("Section {} has invalid type: {}", i, section_type));
        }

        let title = section
            .get("title")
            .and_then(|v| v.as_str())
            .ok_or(format!("Section {} missing 'title'", i))?;

        let content = section
            .get("content")
            .and_then(|v| v.as_str())
            .ok_or(format!("Section {} missing 'content'", i))?;

        sections.push(ValidatedSection {
            id: section_id.to_string(),
            section_type: section_type.to_string(),
            title: title.to_string(),
            content: content.to_string(),
        });
    }

    Ok(ValidatedNote {
        id: id.to_string(),
        date: date.to_string(),
        sections,
    })
}

// ============================================================================
// Response Normalization
// ============================================================================

/// Normalized API response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedResponse<T> {
    pub data: T,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMetadata {
    pub processed_at_ms: i64,
    pub item_count: usize,
    pub source: String,
}

/// Normalize an API response with metadata
#[tauri::command]
pub fn normalize_response(data: Value, source: String) -> NormalizedResponse<Value> {
    let item_count = if let Some(arr) = data.as_array() {
        arr.len()
    } else if data.is_object() {
        1
    } else {
        0
    };

    NormalizedResponse {
        data,
        metadata: ResponseMetadata {
            processed_at_ms: chrono::Utc::now().timestamp_millis(),
            item_count,
            source,
        },
    }
}

// ============================================================================
// Batch API Preparation
// ============================================================================

/// Batch API request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchRequest {
    pub requests: Vec<SingleRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingleRequest {
    pub id: String,
    pub endpoint: String,
    pub method: String,
    pub body: Option<Value>,
}

/// Prepare batch API requests
#[tauri::command]
pub fn prepare_batch_requests(requests: Vec<SingleRequest>) -> BatchRequest {
    BatchRequest { requests }
}

// ============================================================================
// Helper Functions
// ============================================================================

use chrono::{Local, TimeZone};

fn format_age(diff_ms: i64) -> String {
    let hours = diff_ms / 3_600_000;
    let days = hours / 24;

    if hours < 1 {
        "now".to_string()
    } else if hours < 24 {
        format!("{}h", hours)
    } else if days < 7 {
        format!("{}d", days)
    } else {
        format!("{}w", days / 7)
    }
}

fn format_date_short(timestamp_ms: i64) -> String {
    chrono::DateTime::from_timestamp_millis(timestamp_ms)
        .map(|d| d.with_timezone(&Local).format("%b %d").to_string())
        .unwrap_or_else(|| "Unknown".to_string())
}

fn format_time_range(start_ms: i64, end_ms: i64) -> String {
    let start = chrono::DateTime::from_timestamp_millis(start_ms)
        .map(|d| d.with_timezone(&Local).format("%I:%M %p").to_string())
        .unwrap_or_else(|| "?".to_string());
    let end = chrono::DateTime::from_timestamp_millis(end_ms)
        .map(|d| d.with_timezone(&Local).format("%I:%M %p").to_string())
        .unwrap_or_else(|| "?".to_string());
    format!("{} - {}", start, end)
}

fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }
}

fn is_valid_date_format(date: &str) -> bool {
    // YYYY-MM-DD format
    if date.len() != 10 {
        return false;
    }
    let parts: Vec<&str> = date.split('-').collect();
    if parts.len() != 3 {
        return false;
    }
    parts[0].len() == 4
        && parts[1].len() == 2
        && parts[2].len() == 2
        && parts.iter().all(|p| p.chars().all(|c| c.is_ascii_digit()))
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_age() {
        assert_eq!(format_age(30_000), "now");
        assert_eq!(format_age(3_600_000), "1h");
        assert_eq!(format_age(86_400_000), "1d");
        assert_eq!(format_age(604_800_000), "1w");
    }

    #[test]
    fn test_truncate_string() {
        assert_eq!(truncate_string("Hello", 10), "Hello");
        assert_eq!(truncate_string("Hello World Test", 10), "Hello W...");
    }

    #[test]
    fn test_is_valid_date_format() {
        assert!(is_valid_date_format("2026-01-15"));
        assert!(!is_valid_date_format("2026-1-15"));
        assert!(!is_valid_date_format("01-15-2026"));
        assert!(!is_valid_date_format("invalid"));
    }

    #[test]
    fn test_validate_note_schema() {
        let valid_note = serde_json::json!({
            "id": "note-123",
            "date": "2026-01-15",
            "sections": [{
                "id": "section-1",
                "type": "email_summary",
                "title": "Email Summary",
                "content": "You have 5 emails"
            }]
        });

        let result = validate_note_schema(valid_note);
        assert!(result.is_ok());
        let validated = result.unwrap();
        assert_eq!(validated.id, "note-123");
        assert_eq!(validated.sections.len(), 1);
    }

    #[test]
    fn test_prepare_note_context() {
        let emails = vec![EmailSummary {
            id: "e1".to_string(),
            subject: "Urgent: Review needed".to_string(),
            from_name: "John".to_string(),
            from_email: "john@example.com".to_string(),
            snippet: "Please review this".to_string(),
            timestamp_ms: chrono::Utc::now().timestamp_millis() - 3600000,
            is_unread: true,
            priority_score: Some(0.9),
        }];

        let tasks = vec![TaskSummary {
            id: "t1".to_string(),
            title: "Complete report".to_string(),
            due_ms: Some(chrono::Utc::now().timestamp_millis() + 86400000),
            completed: false,
            list_name: Some("Work".to_string()),
        }];

        let events = vec![];

        let context = prepare_note_context(emails, tasks, events);
        assert_eq!(context.total_emails, 1);
        assert_eq!(context.unread_count, 1);
        assert_eq!(context.total_tasks, 1);
        assert_eq!(context.completed_tasks, 0);
    }
}
