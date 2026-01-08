# Implementation Plan: AI-Powered Daily Experience

## Overview

Este plan implementa la integración completa entre el backend AI (Gemini, Inngest, Memory) y el frontend Tauri/React. El enfoque es incremental: primero servicios, luego hooks, luego componentes UI, con tests en cada paso.

## Tasks

- [x] 1. Implement Backend Service Layer
  - [x] 1.1 Create plan service with AI plan fetching
    - Implement `getTodayPlan()` to fetch AI-generated plan from `/plan/today`
    - Implement `regeneratePlan()` to force regeneration via `/plan/generate`
    - Implement `submitPlanFeedback()` for plan feedback
    - Add proper TypeScript types matching backend DailyPlan interface
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Write property test for plan structure completeness
    - **Property 1: Plan Structure Completeness**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 1.3 Create actions service for task operations
    - Implement `createTask()` to create tasks via `/actions/tasks`
    - Implement `completeTask()` to mark complete via `/actions/tasks/:id/complete`
    - Implement `deleteTask()` to delete via `/actions/tasks/:id`
    - Implement `updateTask()` to update via `/actions/tasks/:id`
    - _Requirements: 2.1, 2.2_

  - [x] 1.4 Write property test for action execution
    - **Property 3: Action Execution Returns Result**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 1.5 Create notifications service
    - Implement `getNotifications()` to fetch from `/notifications`
    - Implement `getUnreadCount()` to get count from `/notifications/count`
    - Implement `markAsRead()` and `markAllAsRead()`
    - _Requirements: 3.4, 3.6_

  - [x] 1.6 Write property test for notification count consistency
    - **Property 7: Notification Count Consistency**
    - **Validates: Requirements 3.4, 3.6**

- [x] 2. Checkpoint - Verify services work
  - Ensure all service tests pass, ask the user if questions arise.

- [x] 3. Implement React Hooks Layer
  - [x] 3.1 Create useDailyPlan hook
    - Manage plan state (plan, isLoading, isGenerating, error)
    - Implement regenerate function with loading state
    - Implement submitFeedback function
    - Auto-fetch plan on mount
    - _Requirements: 1.1, 1.2, 1.8_

  - [x] 3.2 Write property test for plan regeneration timestamp
    - **Property 2: Plan Regeneration Updates Timestamp**
    - **Validates: Requirements 1.8**

  - [x] 3.3 Create useTaskActions hook
    - Manage action state (isLoading, lastAction)
    - Implement createTask, completeTask, deleteTask functions
    - Handle optimistic updates and rollback on error
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 Write property test for UI state consistency
    - **Property 5: UI State Consistency After Actions**
    - **Validates: Requirements 2.3, 2.4**

  - [x] 3.5 Create useNotifications hook
    - Manage notifications state and unread count
    - Implement markAsRead and markAllAsRead
    - Auto-refresh on interval (30 seconds)
    - _Requirements: 3.4, 3.6_

  - [x] 3.6 Create useSyncStatus hook
    - Track sync status (idle, syncing, synced, error)
    - Implement triggerSync function
    - Store lastSyncAt timestamp
    - _Requirements: 4.2, 4.4, 4.5_

- [x] 4. Checkpoint - Verify hooks work
  - Ensure all hook tests pass, ask the user if questions arise.

- [x] 5. Implement UI Components
  - [x] 5.1 Create SmartDailyPlan component
    - Replace current DailyPlan with AI-powered version
    - Display focus_blocks, quick_wins, meetings sections
    - Show suggested_time for each task
    - Add regenerate button in header
    - Show energy_tip and summary
    - _Requirements: 1.6, 1.7, 6.4_

  - [x] 5.2 Create TaskActionButton component
    - Implement complete and delete action buttons
    - Show loading state during action
    - Handle success/error callbacks
    - _Requirements: 2.1, 2.6_

  - [x] 5.3 Create QuickTaskInput component
    - Inline input for creating tasks
    - Submit on Enter key
    - Clear input on success
    - _Requirements: 2.2_

  - [x] 5.4 Create NotificationBell component
    - Display badge with unread count
    - Dropdown with notification list
    - Mark as read on click
    - Mark all as read button
    - _Requirements: 3.4, 3.6_

  - [x] 5.5 Create SyncIndicator component
    - Show sync status icon (spinning, check, error)
    - Click to trigger manual sync
    - Show last sync time on hover
    - _Requirements: 4.5, 4.6_

  - [x] 5.6 Create MeetingJoinButton component
    - Show "Join" button for events with meeting_link
    - Open link in browser on click
    - Highlight events starting within 15 minutes
    - _Requirements: 6.1, 6.2, 6.5_

- [ ] 6. Checkpoint - Verify UI components render correctly
  - Ensure all component tests pass, ask the user if questions arise.

- [x] 7. Implement Feedback and Memory Integration
  - [x] 7.1 Add plan feedback UI
    - Add thumbs up/down buttons to plan items
    - Submit feedback via plan service
    - Store feedback as memory
    - _Requirements: 5.1, 5.5_

  - [x] 7.2 Write property test for memory storage on feedback
    - **Property 9: Memory Storage on Feedback**
    - **Validates: Requirements 5.1**

- [x] 8. Implement Offline Support
  - [x] 8.1 Add caching layer to services
    - Cache successful API responses in localStorage
    - Return cached data on network errors
    - Add cache expiration (1 hour for plan, 5 min for notifications)
    - _Requirements: 8.4_

  - [x] 8.2 Write property test for offline fallback
    - **Property 13: Offline Fallback to Cache**
    - **Validates: Requirements 8.4**

  - [x] 8.3 Add offline indicator to UI
    - Show banner when offline
    - Show "cached" badge on stale data
    - _Requirements: 8.4_

- [ ] 9. Checkpoint - Verify offline mode works
  - Ensure offline tests pass, ask the user if questions arise.

- [x] 10. Wire Everything Together
  - [x] 10.1 Update App.tsx to use new components
    - Replace DailyPlan with SmartDailyPlan
    - Add NotificationBell to header
    - Add SyncIndicator to header
    - _Requirements: 1.6, 3.4, 4.5_

  - [x] 10.2 Add keyboard shortcuts
    - Cmd+R to refresh/regenerate plan
    - Cmd+N to focus quick task input
    - Cmd+S to trigger sync
    - _Requirements: 8.5_

  - [x] 10.3 Connect Tauri native notifications
    - Use Tauri notification API for system notifications
    - Request notification permission on first use
    - _Requirements: 8.1_

- [ ] 11. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All property-based tests are required for comprehensive validation
- Each task references specific requirements for traceability
- The implementation follows the existing code patterns in the codebase
- Backend endpoints already exist - this is frontend integration only
- Use fast-check for property-based testing in TypeScript
