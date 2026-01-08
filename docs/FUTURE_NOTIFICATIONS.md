# Future Notification Enhancements

> **Status**: Pending Implementation  
> **Last Updated**: 2026-01-08

This document outlines planned notification system enhancements for future development cycles.

---

## 🕐 Scheduled Notifications

**Priority**: High  
**Dependencies**: Rust notification commands (implemented)

### Description

Leverage Tauri plugin's scheduling features for time-based notifications.

### Use Cases

- Daily plan reminders at user-specified times
- Task due alerts (30 min, 1 hour before)
- Focus session start/end notifications

### Implementation

```typescript
import { Schedule, sendNotification } from "@tauri-apps/plugin-notification";

// Schedule daily notification at 9 AM
sendNotification({
  title: "Daily Plan Ready",
  body: "Your optimized day is waiting",
  schedule: Schedule.at(new Date().setHours(9, 0, 0, 0), true), // repeats daily
});

// Task due reminder - 30 min before
sendNotification({
  title: "Task Due Soon",
  body: taskTitle,
  schedule: Schedule.at(new Date(dueDate - 30 * 60 * 1000)),
});
```

### Required Permissions

```json
{
  "permissions": ["notification:allow-schedule"]
}
```

---

## 🔘 Interactive Notification Actions

**Priority**: Medium  
**Dependencies**: Rust notification commands

### Description

Add actionable buttons to notifications for quick interactions without opening the app.

### Use Cases

- "Mark Done" button on task reminders
- "Snooze 15 min" for alerts
- "Open Email" for email summaries
- "Start Focus" for plan notifications

### Implementation

```typescript
import {
  sendNotification,
  registerActionTypes,
} from "@tauri-apps/plugin-notification";

// Register action types (do once at app start)
await registerActionTypes([
  {
    id: "task-actions",
    actions: [
      { id: "complete", title: "Mark Done" },
      { id: "snooze", title: "Snooze 15m" },
    ],
  },
]);

// Send notification with actions
sendNotification({
  title: "Task Due",
  body: "Review PR #123",
  actionTypeId: "task-actions",
});

// Handle action responses
import { onAction } from "@tauri-apps/plugin-notification";
onAction((action) => {
  if (action.actionId === "complete") {
    completeTask(action.notification.extra.taskId);
  }
});
```

### Required Permissions

```json
{
  "permissions": ["notification:allow-register-action-types"]
}
```

---

## 🔊 Custom Notification Sounds

**Priority**: Low  
**Dependencies**: None

### Description

Platform-specific sounds for different notification types to help users distinguish alerts.

### Sound Mapping

| Notification Type | macOS Sound | Description          |
| ----------------- | ----------- | -------------------- |
| `task_due`        | `Hero`      | Urgent/important     |
| `plan_ready`      | `Glass`     | Positive/celebratory |
| `reminder`        | `Ping`      | Gentle reminder      |
| `email_summary`   | `Blow`      | Informational        |
| `system`          | `Sosumi`    | System alert         |

### Implementation

```typescript
import { sendNotification } from "@tauri-apps/plugin-notification";

const NOTIFICATION_SOUNDS: Record<NotificationType, string> = {
  task_due: "Hero",
  plan_ready: "Glass",
  reminder: "Ping",
  email_summary: "Blow",
  system: "Sosumi",
};

function sendTypedNotification(
  type: NotificationType,
  title: string,
  body?: string
) {
  sendNotification({
    title,
    body,
    sound: NOTIFICATION_SOUNDS[type],
  });
}
```

---

## 📊 Notification Analytics

**Priority**: Low  
**Dependencies**: Backend tracking

### Description

Track notification effectiveness for product insights.

### Metrics to Track

- Delivery rate per platform
- Click-through rate per notification type
- Dismissal vs action rate
- Time to action

### Implementation

Extend `notifications` table with:

```sql
ALTER TABLE notifications ADD COLUMN clicked_at INTEGER;
ALTER TABLE notifications ADD COLUMN action_taken TEXT;
```

---

## 📱 Badge Count (macOS Dock)

**Priority**: Medium  
**Dependencies**: None

### Description

Show unread notification count as badge on app dock icon.

### Implementation

```rust
// In src-tauri/src/notifications.rs
use tauri::AppHandle;

#[tauri::command]
pub fn set_badge_count(app: AppHandle, count: u32) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        app.set_badge_label(if count > 0 {
            Some(count.to_string())
        } else {
            None
        });
    }
    Ok(())
}
```

---

## Checklist for Future Implementation

- [ ] Scheduled Notifications

  - [ ] Add schedule permissions to capabilities
  - [ ] Create scheduling service
  - [ ] Integrate with task due dates
  - [ ] Add user preferences for reminder timing

- [ ] Interactive Actions

  - [ ] Register action types on app start
  - [ ] Implement action handlers
  - [ ] Add deep linking support

- [ ] Custom Sounds

  - [ ] Map notification types to sounds
  - [ ] Add user preference for sound selection
  - [ ] Test on all platforms

- [ ] Badge Count
  - [ ] Implement Rust command
  - [ ] Sync with unread count hook
