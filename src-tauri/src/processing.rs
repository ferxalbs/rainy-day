//! High-performance data processing utilities
//!
//! Provides fast client-side data processing for improved UI responsiveness.
//! These are performance optimizations - the cloud backend remains the source of truth.

use chrono::{DateTime, Local, TimeZone, Utc};
use serde::{Deserialize, Serialize};

// ============================================================================
// Date/Time Formatting
// ============================================================================

/// Format a Unix timestamp as a relative time string (e.g., "2 hours ago")
#[tauri::command]
pub fn format_relative_time(timestamp_ms: i64) -> String {
    let now = Utc::now().timestamp_millis();
    let diff_ms = now - timestamp_ms;
    let diff_secs = diff_ms / 1000;
    let diff_mins = diff_secs / 60;
    let diff_hours = diff_mins / 60;
    let diff_days = diff_hours / 24;

    if diff_secs < 60 {
        "Just now".to_string()
    } else if diff_mins < 60 {
        if diff_mins == 1 {
            "1 minute ago".to_string()
        } else {
            format!("{} minutes ago", diff_mins)
        }
    } else if diff_hours < 24 {
        if diff_hours == 1 {
            "1 hour ago".to_string()
        } else {
            format!("{} hours ago", diff_hours)
        }
    } else if diff_days < 7 {
        if diff_days == 1 {
            "Yesterday".to_string()
        } else {
            format!("{} days ago", diff_days)
        }
    } else if diff_days < 30 {
        let weeks = diff_days / 7;
        if weeks == 1 {
            "1 week ago".to_string()
        } else {
            format!("{} weeks ago", weeks)
        }
    } else {
        // Just return the date
        let dt = DateTime::from_timestamp_millis(timestamp_ms)
            .map(|d| d.format("%b %d, %Y").to_string())
            .unwrap_or_else(|| "Unknown date".to_string());
        dt
    }
}

/// Format a timestamp for display in the UI (local time)
#[tauri::command]
pub fn format_time(timestamp_ms: i64, format: Option<String>) -> String {
    let format_str = format.as_deref().unwrap_or("%I:%M %p");
    DateTime::from_timestamp_millis(timestamp_ms)
        .map(|d| d.with_timezone(&Local).format(format_str).to_string())
        .unwrap_or_else(|| "Unknown".to_string())
}

/// Format a date for display (local time)
#[tauri::command]
pub fn format_date(timestamp_ms: i64, format: Option<String>) -> String {
    let format_str = format.as_deref().unwrap_or("%B %d, %Y");
    DateTime::from_timestamp_millis(timestamp_ms)
        .map(|d| d.with_timezone(&Local).format(format_str).to_string())
        .unwrap_or_else(|| "Unknown".to_string())
}

/// Get a greeting based on current time of day
#[tauri::command]
pub fn get_time_greeting() -> String {
    let hour = Local::now().hour();
    match hour {
        5..=11 => "Good morning",
        12..=16 => "Good afternoon",
        17..=20 => "Good evening",
        _ => "Good night",
    }
    .to_string()
}

use chrono::Timelike;

/// Check if a date is today (in local timezone)
#[tauri::command]
pub fn is_today(timestamp_ms: i64) -> bool {
    DateTime::from_timestamp_millis(timestamp_ms)
        .map(|d| d.with_timezone(&Local).date_naive() == Local::now().date_naive())
        .unwrap_or(false)
}

/// Get today's date as YYYY-MM-DD string (local timezone)
#[tauri::command]
pub fn get_today_date_string() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

// ============================================================================
// Priority Scoring
// ============================================================================

/// Input for priority calculation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriorityInput {
    /// Whether the email is unread
    pub is_unread: bool,
    /// Age in hours
    pub age_hours: f64,
    /// Whether it's from a known contact
    pub from_known_contact: bool,
    /// Whether subject contains urgent keywords
    pub has_urgent_keywords: bool,
    /// Number of recipients
    pub recipient_count: usize,
    /// Whether user is in TO field (vs CC/BCC)
    pub is_direct: bool,
    /// Thread message count
    pub thread_size: usize,
}

/// Calculate priority score (0.0 - 1.0)
#[tauri::command]
pub fn calculate_priority_score(input: PriorityInput) -> f64 {
    let mut score: f64 = 0.5; // Base score

    // Unread is high priority
    if input.is_unread {
        score += 0.15;
    }

    // Recent emails are more important
    if input.age_hours < 1.0 {
        score += 0.15;
    } else if input.age_hours < 6.0 {
        score += 0.10;
    } else if input.age_hours < 24.0 {
        score += 0.05;
    } else if input.age_hours > 72.0 {
        score -= 0.10;
    }

    // Known contacts are important
    if input.from_known_contact {
        score += 0.10;
    }

    // Urgent keywords boost priority
    if input.has_urgent_keywords {
        score += 0.20;
    }

    // Direct emails (TO) vs CC/BCC
    if input.is_direct {
        score += 0.05;
    }

    // Small recipient list = more personal
    if input.recipient_count <= 3 {
        score += 0.05;
    }

    // Active threads may need attention
    if input.thread_size > 3 {
        score += 0.05;
    }

    // Clamp to 0.0 - 1.0
    score.clamp(0.0, 1.0)
}

// ============================================================================
// Text Processing
// ============================================================================

/// Extract a clean snippet from HTML or plain text
#[tauri::command]
pub fn clean_snippet(text: String, max_length: Option<usize>) -> String {
    let max = max_length.unwrap_or(150);

    // Remove HTML tags (basic)
    let cleaned: String = text
        .replace("<br>", " ")
        .replace("<br/>", " ")
        .replace("</p>", " ")
        .replace("</div>", " ")
        .chars()
        .filter(|c| !['<', '>'].contains(c) || !text.contains('<'))
        .collect();

    // Remove HTML entities
    let cleaned = cleaned
        .replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"");

    // Collapse whitespace
    let cleaned: String = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");

    // Truncate if needed
    if cleaned.len() > max {
        format!("{}...", &cleaned[..max])
    } else {
        cleaned
    }
}

/// Check if text contains urgent keywords
#[tauri::command]
pub fn has_urgent_keywords(text: String) -> bool {
    let lowercase = text.to_lowercase();
    let urgent_keywords = [
        "urgent",
        "asap",
        "immediately",
        "critical",
        "emergency",
        "deadline",
        "time sensitive",
        "respond by",
        "action required",
        "due today",
        "eod",
        "end of day",
        "priority",
        "important",
    ];

    urgent_keywords
        .iter()
        .any(|keyword| lowercase.contains(keyword))
}

// ============================================================================
// Batch Processing
// ============================================================================

/// Input for batch task processing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskInput {
    pub id: String,
    pub title: String,
    pub due_ms: Option<i64>,
    pub completed: bool,
}

/// Processed task output
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedTask {
    pub id: String,
    pub title: String,
    pub due_ms: Option<i64>,
    pub completed: bool,
    pub is_overdue: bool,
    pub is_due_today: bool,
    pub is_due_soon: bool, // Within 24 hours
    pub relative_due: Option<String>,
}

/// Batch process tasks for display
#[tauri::command]
pub fn batch_process_tasks(tasks: Vec<TaskInput>) -> Vec<ProcessedTask> {
    let now = Utc::now().timestamp_millis();
    let today_start = Local::now()
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .and_then(|d| Local.from_local_datetime(&d).single())
        .map(|d| d.timestamp_millis())
        .unwrap_or(0);
    let today_end = today_start + 86_400_000; // +24 hours
    let soon_threshold = now + 86_400_000; // +24 hours from now

    tasks
        .into_iter()
        .map(|task| {
            let (is_overdue, is_due_today, is_due_soon, relative_due) =
                if let Some(due) = task.due_ms {
                    let is_overdue = !task.completed && due < now;
                    let is_due_today = due >= today_start && due < today_end;
                    let is_due_soon = due < soon_threshold && due > now;
                    let relative = if is_overdue {
                        Some("Overdue".to_string())
                    } else if is_due_today {
                        Some("Due today".to_string())
                    } else if is_due_soon {
                        Some("Due soon".to_string())
                    } else {
                        Some(format_relative_time(due))
                    };
                    (is_overdue, is_due_today, is_due_soon, relative)
                } else {
                    (false, false, false, None)
                };

            ProcessedTask {
                id: task.id,
                title: task.title,
                due_ms: task.due_ms,
                completed: task.completed,
                is_overdue,
                is_due_today,
                is_due_soon,
                relative_due,
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_relative_time() {
        let now = Utc::now().timestamp_millis();
        assert_eq!(format_relative_time(now), "Just now");
        assert_eq!(format_relative_time(now - 60_000), "1 minute ago");
        assert_eq!(format_relative_time(now - 3_600_000), "1 hour ago");
        assert_eq!(format_relative_time(now - 86_400_000), "Yesterday");
    }

    #[test]
    fn test_priority_scoring() {
        let urgent = PriorityInput {
            is_unread: true,
            age_hours: 0.5,
            from_known_contact: true,
            has_urgent_keywords: true,
            recipient_count: 1,
            is_direct: true,
            thread_size: 1,
        };
        let score = calculate_priority_score(urgent);
        assert!(score > 0.8);
    }

    #[test]
    fn test_has_urgent_keywords() {
        assert!(has_urgent_keywords("This is URGENT!".to_string()));
        assert!(has_urgent_keywords("Action Required: Review".to_string()));
        assert!(!has_urgent_keywords("Hello, how are you?".to_string()));
    }
}
