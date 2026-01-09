/**
 * Email Actions Service
 *
 * Handles email actions (archive, mark-as-read, convert-to-task) via the backend.
 * Matches the backend EmailActionResult interface from server/src/services/actions/emails.ts
 */

import { post } from "./api";
import type { ActionResult } from "./actions";

/**
 * Options for converting an email to a task
 */
export interface ConvertToTaskOptions {
  taskListId?: string;
  dueDate?: string;
  additionalNotes?: string;
}

/**
 * Data returned when converting an email to a task
 */
export interface EmailToTaskData {
  email_id: string;
  action_type: "to_task";
  task_id: string;
  task_title: string;
}

/**
 * Data returned for archive/mark-read actions
 */
export interface EmailActionData {
  email_id: string;
  action_type: "archive" | "mark_read";
}

/**
 * Archive an email (remove from inbox)
 */
export async function archiveEmail(
  emailId: string
): Promise<ActionResult<EmailActionData>> {
  const response = await post<ActionResult<EmailActionData>>(
    `/actions/emails/${emailId}/archive`
  );
  if (response.ok && response.data) {
    return response.data;
  }
  return {
    success: false,
    action_id: "",
    message: response.error || "Failed to archive email",
  };
}

/**
 * Mark an email as read
 */
export async function markEmailAsRead(
  emailId: string
): Promise<ActionResult<EmailActionData>> {
  const response = await post<ActionResult<EmailActionData>>(
    `/actions/emails/${emailId}/mark-read`
  );
  if (response.ok && response.data) {
    return response.data;
  }
  return {
    success: false,
    action_id: "",
    message: response.error || "Failed to mark email as read",
  };
}

/**
 * Convert an email to a task
 */
export async function convertEmailToTask(
  emailId: string,
  options?: ConvertToTaskOptions
): Promise<ActionResult<EmailToTaskData>> {
  const body = options
    ? {
        task_list_id: options.taskListId,
        due_date: options.dueDate,
        additional_notes: options.additionalNotes,
      }
    : {};

  const response = await post<ActionResult<EmailToTaskData>>(
    `/actions/emails/${emailId}/to-task`,
    body
  );
  if (response.ok && response.data) {
    return response.data;
  }
  return {
    success: false,
    action_id: "",
    message: response.error || "Failed to convert email to task",
  };
}
