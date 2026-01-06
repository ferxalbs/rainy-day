//! Calendar API client
//!
//! Endpoints:
//! - events.list: List calendar events for a time range

use super::types::{CalendarEvent, CalendarEventsResponse, ProcessedEvent};
use super::{GoogleClient, CALENDAR_API_BASE};
use crate::auth::TokenStore;
use chrono::{Local, TimeZone};
use tauri::State;

/// Get today's calendar events
#[tauri::command]
pub async fn get_today_events(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
) -> Result<Vec<ProcessedEvent>, String> {
    let token = token_store.get_access_token().await?;

    // Get start and end of today in RFC3339 format
    let now = Local::now();
    let today_start = now
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .ok_or("Failed to create date")?;
    let today_end = now
        .date_naive()
        .and_hms_opt(23, 59, 59)
        .ok_or("Failed to create date")?;

    let time_min = now
        .timezone()
        .from_local_datetime(&today_start)
        .single()
        .ok_or("Failed to create timezone-aware date")?
        .to_rfc3339();
    let time_max = now
        .timezone()
        .from_local_datetime(&today_end)
        .single()
        .ok_or("Failed to create timezone-aware date")?
        .to_rfc3339();

    let url = format!(
        "{}/calendars/primary/events?timeMin={}&timeMax={}&singleEvents=true&orderBy=startTime",
        CALENDAR_API_BASE,
        urlencoding::encode(&time_min),
        urlencoding::encode(&time_max)
    );

    let response: CalendarEventsResponse = client.get(&url, &token).await?;

    let events = response.items.unwrap_or_default();

    let processed: Vec<ProcessedEvent> = events
        .into_iter()
        .filter(|e| e.status.as_deref() != Some("cancelled"))
        .map(|e| {
            let start_time = e
                .start
                .as_ref()
                .and_then(|s| s.date_time.clone().or(s.date.clone()))
                .unwrap_or_default();
            let end_time = e
                .end
                .as_ref()
                .and_then(|s| s.date_time.clone().or(s.date.clone()))
                .unwrap_or_default();

            ProcessedEvent {
                id: e.id,
                title: e.summary.unwrap_or_else(|| "(No title)".to_string()),
                start_time,
                end_time,
                location: e.location,
                meeting_link: e.hangout_link,
                attendees_count: e.attendees.map(|a| a.len() as u32).unwrap_or(0),
            }
        })
        .collect();

    Ok(processed)
}

/// Get events for a specific date range
#[tauri::command]
pub async fn get_events_range(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    time_min: String,
    time_max: String,
) -> Result<Vec<CalendarEvent>, String> {
    let token = token_store.get_access_token().await?;

    let url = format!(
        "{}/calendars/primary/events?timeMin={}&timeMax={}&singleEvents=true&orderBy=startTime",
        CALENDAR_API_BASE,
        urlencoding::encode(&time_min),
        urlencoding::encode(&time_max)
    );

    let response: CalendarEventsResponse = client.get(&url, &token).await?;

    Ok(response.items.unwrap_or_default())
}
