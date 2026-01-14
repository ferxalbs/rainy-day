//! High-performance search engine for local data
//!
//! Provides regex-based search for emails and tasks.
//! Uses Rust for speed and safety.

use crate::processing::{EmailInput, TaskInput};
use regex::RegexBuilder;
use serde::{Deserialize, Serialize};

/// Search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub matches: Vec<String>, // List of IDs
    pub total_found: usize,
}

/// Search for tasks using regex OR simple string matching
#[tauri::command]
pub fn search_tasks(query: &str, tasks: Vec<TaskInput>) -> SearchResult {
    let regex = RegexBuilder::new(query).case_insensitive(true).build();

    let matches: Vec<String> = match regex {
        Ok(re) => tasks
            .into_iter()
            .filter(|t| re.is_match(&t.title))
            .map(|t| t.id)
            .collect(),
        Err(_) => {
            // Fallback to simple contains if regex fails
            let lower_query = query.to_lowercase();
            tasks
                .into_iter()
                .filter(|t| t.title.to_lowercase().contains(&lower_query))
                .map(|t| t.id)
                .collect()
        }
    };

    SearchResult {
        total_found: matches.len(),
        matches,
    }
}

/// Search for emails using regex OR simple string matching
#[tauri::command]
pub fn search_emails(query: &str, emails: Vec<EmailInput>) -> SearchResult {
    let regex = RegexBuilder::new(query).case_insensitive(true).build();

    let matches: Vec<String> = match regex {
        Ok(re) => emails
            .into_iter()
            .filter(|e| {
                re.is_match(&e.subject) || re.is_match(&e.snippet) || re.is_match(&e.sender)
            })
            .map(|e| e.id)
            .collect(),
        Err(_) => {
            // Fallback to simple contains if regex fails
            let lower_query = query.to_lowercase();
            emails
                .into_iter()
                .filter(|e| {
                    e.subject.to_lowercase().contains(&lower_query)
                        || e.snippet.to_lowercase().contains(&lower_query)
                        || e.sender.to_lowercase().contains(&lower_query)
                })
                .map(|e| e.id)
                .collect()
        }
    };

    SearchResult {
        total_found: matches.len(),
        matches,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_search() {
        let tasks = vec![
            TaskInput {
                id: "1".to_string(),
                title: "Buy milk".to_string(),
                due_ms: None,
                completed: false,
            },
            TaskInput {
                id: "2".to_string(),
                title: "Call Mom".to_string(),
                due_ms: None,
                completed: false,
            },
        ];

        let result = search_tasks("milk", tasks.clone());
        assert_eq!(result.matches.len(), 1);
        assert_eq!(result.matches[0], "1");

        let result = search_tasks("^Buy.*", tasks);
        assert_eq!(result.matches.len(), 1);
    }
}
