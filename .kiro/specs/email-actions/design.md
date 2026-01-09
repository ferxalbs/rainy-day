# Design Document: Email Actions

## Overview

This design extends the Rainy Day app with email action capabilities, enabling users to archive emails, mark them as read, and convert them to tasks directly from the Daily Plan interface. The implementation follows the existing action service pattern established for task actions, adding new Gmail API integrations while maintaining consistency with the current architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  SmartDailyPlan                                                  │
│  └── EmailItem (new)                                             │
│      └── EmailActionBar (new)                                    │
│          ├── ArchiveButton                                       │
│          ├── MarkReadButton                                      │
│          └── ConvertToTaskButton                                 │
├─────────────────────────────────────────────────────────────────┤
│  Hooks                                                           │
│  └── useEmailActions (new)                                       │
├─────────────────────────────────────────────────────────────────┤
│  Services                                                        │
│  └── backend/emails.ts (new)                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Hono)                            │
├─────────────────────────────────────────────────────────────────┤
│  Routes                                                          │
│  └── /actions/emails (new)                                       │
│      ├── POST /:id/archive                                       │
│      ├── POST /:id/mark-read                                     │
│      └── POST /:id/to-task                                       │
├─────────────────────────────────────────────────────────────────┤
│  Services                                                        │
│  └── actions/emails.ts (new)                                     │
│      ├── archiveEmail()                                          │
│      ├── markEmailAsRead()                                       │
│      └── convertEmailToTask()                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External APIs                               │
├─────────────────────────────────────────────────────────────────┤
│  Gmail API                                                       │
│  ├── users.messages.modify (archive, mark read)                  │
│  └── users.messages.get (fetch email details)                    │
│                                                                  │
│  Google Tasks API                                                │
│  └── tasks.insert (create task from email)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Interfaces

```typescript
// server/src/services/actions/emails.ts

/**
 * Input for email actions
 */
interface EmailActionInput {
  email_id: string;
  thread_id?: string;
}

/**
 * Input for converting email to task
 */
interface EmailToTaskInput extends EmailActionInput {
  task_list_id?: string;
  due_date?: string;
  additional_notes?: string;
}

/**
 * Result of an email action
 */
interface EmailActionResult {
  success: boolean;
  action_id: string;
  message: string;
  data?: {
    email_id: string;
    action_type: 'archive' | 'mark_read' | 'to_task';
    task_id?: string;  // Only for to_task action
  };
}
```

### Frontend Interfaces

```typescript
// src/services/backend/emails.ts

/**
 * Archive an email (remove INBOX label)
 */
export async function archiveEmail(emailId: string): Promise<ActionResult>;

/**
 * Mark an email as read
 */
export async function markEmailAsRead(emailId: string): Promise<ActionResult>;

/**
 * Convert an email to a task
 */
export async function convertEmailToTask(
  emailId: string,
  options?: {
    taskListId?: string;
    dueDate?: string;
    additionalNotes?: string;
  }
): Promise<ActionResult<{ taskId: string; taskTitle: string }>>;
```

### React Hook Interface

```typescript
// src/hooks/useEmailActions.ts

interface UseEmailActionsReturn {
  /** Archive an email */
  archiveEmail: (emailId: string) => Promise<ActionResult>;
  /** Mark an email as read */
  markAsRead: (emailId: string) => Promise<ActionResult>;
  /** Convert email to task */
  convertToTask: (emailId: string, options?: ConvertToTaskOptions) => Promise<ActionResult>;
  /** Loading states by email ID */
  loadingStates: Record<string, EmailActionLoadingState>;
  /** Clear loading state for an email */
  clearLoadingState: (emailId: string) => void;
}

interface EmailActionLoadingState {
  archive: boolean;
  markRead: boolean;
  toTask: boolean;
}
```

### UI Component Props

```typescript
// src/components/plan/EmailActionBar.tsx

interface EmailActionBarProps {
  email: {
    id: string;
    subject: string;
    isUnread: boolean;
  };
  onArchive?: () => void;
  onMarkRead?: () => void;
  onConvertToTask?: () => void;
  loadingState?: EmailActionLoadingState;
  compact?: boolean;
}
```

## Data Models

### Action Log Entry (Database)

```sql
-- Extends existing action_logs table
-- action_type values: 'archive_email', 'mark_email_read', 'email_to_task'
-- target_type: 'email'
-- target_id: Gmail message ID
-- action_data: JSON with email details and action-specific data
```

### Email with Actions (Frontend State)

```typescript
interface EmailWithActions {
  id: string;
  thread_id: string;
  subject: string;
  snippet: string;
  from_name: string;
  from_email: string;
  date: number;
  is_unread: boolean;
  is_important: boolean;
  // Action states
  isArchiving?: boolean;
  isMarkingRead?: boolean;
  isConvertingToTask?: boolean;
  // Optimistic update tracking
  optimisticState?: 'archived' | 'read' | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Archive Action Calls Gmail API Correctly

*For any* valid email ID, when the archive action is executed, the Gmail API should be called with the correct parameters to remove the INBOX label from that email.

**Validates: Requirements 1.1**

### Property 2: Error State Management

*For any* email action (archive, mark-read, or convert-to-task) that fails, the system should set an error state with a descriptive message and the action button should remain in its original enabled state.

**Validates: Requirements 1.3, 2.3, 3.5**

### Property 3: Loading State During Actions

*For any* email action in progress, the corresponding loading state should be true, and the action button should be disabled until the action completes.

**Validates: Requirements 1.4**

### Property 4: Mark-as-Read Button Visibility

*For any* email item, the mark-as-read button should be visible if and only if the email's `is_unread` property is true.

**Validates: Requirements 2.4**

### Property 5: Email-to-Task Data Transformation

*For any* email converted to a task, the resulting task should have: (a) a title matching the email subject, and (b) notes containing a link to the original email in the format `https://mail.google.com/mail/u/0/#inbox/{emailId}`.

**Validates: Requirements 3.2, 3.3**

### Property 6: Action Logging Completeness

*For any* email action executed (success or failure), the action log entry should contain: email_id, action_type, success status, timestamp, and error_message (if failed).

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 7: Optimistic Update Rollback

*For any* optimistic UI update that fails (archive or mark-read), the email item should revert to its original state (visible for archive, unread styling for mark-read) and display an error message.

**Validates: Requirements 6.2, 6.4**

### Property 8: Batch Archive Completeness

*For any* set of selected emails in batch mode, executing batch archive should attempt to archive all selected emails and return results for each.

**Validates: Requirements 7.3**

## Error Handling

### Gmail API Errors

| Error Code | Handling Strategy |
|------------|-------------------|
| 401 Unauthorized | Trigger re-authentication flow |
| 403 Forbidden | Display "Permission denied" message |
| 404 Not Found | Remove email from UI, log warning |
| 429 Rate Limited | Implement exponential backoff, queue action |
| 500+ Server Error | Retry with backoff, show "Try again" message |

### Network Errors

- Detect offline state using `navigator.onLine`
- Queue actions for retry when connection restored
- Show offline indicator in UI
- Use cached email data for display

### Optimistic Update Failures

```typescript
// Rollback strategy
async function executeWithOptimisticUpdate<T>(
  optimisticUpdate: () => void,
  action: () => Promise<T>,
  rollback: () => void
): Promise<T> {
  optimisticUpdate();
  try {
    return await action();
  } catch (error) {
    rollback();
    throw error;
  }
}
```

## Testing Strategy

### Unit Tests

- Test Gmail API request formatting for each action type
- Test error handling for various API response codes
- Test action logging with correct fields
- Test email-to-task data transformation

### Property-Based Tests

Using `fast-check` for TypeScript property-based testing:

- **Property 1**: Generate random valid email IDs, verify API call parameters
- **Property 4**: Generate emails with random `is_unread` values, verify button visibility
- **Property 5**: Generate emails with various subjects, verify task title and notes format
- **Property 6**: Generate action results (success/failure), verify log entry completeness
- **Property 7**: Simulate failures after optimistic updates, verify state rollback

### Integration Tests

- Test full flow: UI click → API call → state update
- Test error scenarios with mocked API failures
- Test offline behavior and action queuing

### E2E Tests

- Archive email from Daily Plan
- Mark email as read and verify visual change
- Convert email to task and verify task appears in task list
