//! Google Tasks API client
//!
//! Full CRUD operations for tasks:
//! - tasklists.list: List all task lists
//! - tasks.list: List tasks in a list
//! - tasks.insert: Create a new task
//! - tasks.patch: Update a task
//! - tasks.delete: Delete a task

use super::types::{NewTask, Task, TaskList, TaskListsResponse, TaskUpdate, TasksResponse};
use super::{GoogleClient, TASKS_API_BASE};
use crate::auth::TokenStore;
use tauri::State;

/// Get all task lists for the user
#[tauri::command]
pub async fn get_task_lists(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
) -> Result<Vec<TaskList>, String> {
    let token = token_store.get_access_token().await?;

    let url = format!("{}/users/@me/lists", TASKS_API_BASE);

    let response: TaskListsResponse = client.get(&url, &token).await?;

    Ok(response.items.unwrap_or_default())
}

/// Get all tasks from a specific list
#[tauri::command]
pub async fn get_tasks(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    show_completed: Option<bool>,
) -> Result<Vec<Task>, String> {
    let token = token_store.get_access_token().await?;

    let show = if show_completed.unwrap_or(false) {
        "true"
    } else {
        "false"
    };
    let url = format!(
        "{}/lists/{}/tasks?showCompleted={}&showHidden=false",
        TASKS_API_BASE, list_id, show
    );

    let response: TasksResponse = client.get(&url, &token).await?;

    Ok(response.items.unwrap_or_default())
}

/// Create a new task in a list
#[tauri::command]
pub async fn create_task(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    task: NewTask,
) -> Result<Task, String> {
    let token = token_store.get_access_token().await?;

    let url = format!("{}/lists/{}/tasks", TASKS_API_BASE, list_id);

    client.post(&url, &token, &task).await
}

/// Update an existing task
#[tauri::command]
pub async fn update_task(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    task_id: String,
    update: TaskUpdate,
) -> Result<Task, String> {
    let token = token_store.get_access_token().await?;

    let url = format!("{}/lists/{}/tasks/{}", TASKS_API_BASE, list_id, task_id);

    client.patch(&url, &token, &update).await
}

/// Complete a task
#[tauri::command]
pub async fn complete_task(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    task_id: String,
) -> Result<Task, String> {
    let update = TaskUpdate {
        title: None,
        notes: None,
        status: Some("completed".to_string()),
        due: None,
    };

    update_task(token_store, client, list_id, task_id, update).await
}

/// Reopen a completed task
#[tauri::command]
pub async fn reopen_task(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    task_id: String,
) -> Result<Task, String> {
    let update = TaskUpdate {
        title: None,
        notes: None,
        status: Some("needsAction".to_string()),
        due: None,
    };

    update_task(token_store, client, list_id, task_id, update).await
}

/// Delete a task
#[tauri::command]
pub async fn delete_task(
    token_store: State<'_, TokenStore>,
    client: State<'_, GoogleClient>,
    list_id: String,
    task_id: String,
) -> Result<(), String> {
    let token = token_store.get_access_token().await?;

    let url = format!("{}/lists/{}/tasks/{}", TASKS_API_BASE, list_id, task_id);

    client.delete(&url, &token).await
}
