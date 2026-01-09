# Implementation Plan: Email Actions

## Overview

This plan implements email action capabilities (archive, mark-as-read, convert-to-task) for the Rainy Day app. The implementation follows a backend-first approach, establishing the API layer before building the frontend components.

## Tasks

- [x] 1. Backend: Email Actions Service
  - [x] 1.1 Create email actions service file
    - Create `server/src/services/actions/emails.ts`
    - Define `EmailActionInput`, `EmailToTaskInput`, and `EmailActionResult` interfaces
    - Implement `logEmailAction` helper function following existing pattern from `tasks.ts`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.2 Implement archiveEmail function
    - Call Gmail API `users.messages.modify` to remove INBOX label
    - Handle success/error cases with proper logging
    - Return standardized `EmailActionResult`
    - _Requirements: 1.1_

  - [x] 1.3 Implement markEmailAsRead function
    - Call Gmail API `users.messages.modify` to remove UNREAD label
    - Handle success/error cases with proper logging
    - Return standardized `EmailActionResult`
    - _Requirements: 2.1_

  - [x] 1.4 Implement convertEmailToTask function
    - Fetch email details using Gmail API `users.messages.get`
    - Extract subject for task title
    - Generate Gmail link for task notes
    - Create task using existing `createTask` function from `tasks.ts`
    - Return result with task ID and title
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 1.5 Write property test for email-to-task transformation
    - **Property 5: Email-to-Task Data Transformation**
    - **Validates: Requirements 3.2, 3.3**

- [x] 2. Backend: Email Actions Routes
  - [x] 2.1 Create email actions router
    - Create `server/src/routes/emails.ts` (or extend `actions.ts`)
    - Add route `POST /actions/emails/:id/archive`
    - Add route `POST /actions/emails/:id/mark-read`
    - Add route `POST /actions/emails/:id/to-task`
    - Apply `authMiddleware` to all routes
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 2.2 Add request validation schemas
    - Define Zod schema for archive request (email_id param)
    - Define Zod schema for mark-read request (email_id param)
    - Define Zod schema for to-task request (email_id param, optional task_list_id, due_date)
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 2.3 Register routes in main app
    - Import email actions router in `server/src/index.ts`
    - Mount at appropriate path
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ]* 2.4 Write property test for action logging
    - **Property 6: Action Logging Completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 3. Checkpoint - Backend Complete
  - Ensure all backend tests pass
  - Test endpoints manually with curl/Postman
  - Ask the user if questions arise

- [x] 4. Frontend: Email Actions Service
  - [x] 4.1 Create frontend email service
    - Create `src/services/backend/emails.ts`
    - Implement `archiveEmail(emailId)` function
    - Implement `markEmailAsRead(emailId)` function
    - Implement `convertEmailToTask(emailId, options)` function
    - Use existing `post` helper from `api.ts`
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 4.2 Export from backend index
    - Add exports to `src/services/backend/index.ts`
    - Export types and functions
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 5. Frontend: useEmailActions Hook
  - [x] 5.1 Create useEmailActions hook
    - Create `src/hooks/useEmailActions.ts`
    - Implement loading state management per email ID
    - Implement `archiveEmail` with loading state
    - Implement `markAsRead` with loading state
    - Implement `convertToTask` with loading state
    - _Requirements: 1.4, 5.1_

  - [ ]* 5.2 Write property test for loading state management
    - **Property 3: Loading State During Actions**
    - **Validates: Requirements 1.4**

- [x] 6. Frontend: EmailActionBar Component
  - [x] 6.1 Create EmailActionBar component
    - Create `src/components/plan/EmailActionBar.tsx`
    - Implement Archive button with icon and tooltip
    - Implement Mark Read button (conditional visibility)
    - Implement Convert to Task button with icon and tooltip
    - Add loading spinners for each action
    - Style with Tailwind CSS matching existing design
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.2 Write property test for mark-read button visibility
    - **Property 4: Mark-as-Read Button Visibility**
    - **Validates: Requirements 2.4**

  - [x] 6.3 Add keyboard accessibility
    - Add proper `tabIndex` and focus states
    - Implement keyboard shortcuts (optional)
    - Add ARIA labels for screen readers
    - _Requirements: 5.5_

- [x] 7. Frontend: Integrate with SmartDailyPlan
  - [x] 7.1 Update SmartDailyPlan to use email actions
    - Import `useEmailActions` hook
    - Pass action handlers to email items
    - Handle action success/error with notifications
    - _Requirements: 1.1, 2.1, 3.1, 3.4_

  - [x] 7.2 Implement optimistic UI updates
    - Add optimistic state to email items
    - Implement archive with immediate visual removal
    - Implement mark-read with immediate style change
    - Add rollback on failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.3 Write property test for optimistic update rollback
    - **Property 7: Optimistic Update Rollback**
    - **Validates: Requirements 6.2, 6.4**

- [x] 8. Checkpoint - Core Features Complete
  - Ensure all tests pass
  - Test full flow in development environment
  - Ask the user if questions arise

- [x] 9. Error Handling and Polish
  - [x] 9.1 Implement comprehensive error handling
    - Add error boundaries for action failures
    - Implement retry logic for transient errors
    - Add user-friendly error messages
    - _Requirements: 1.3, 2.3, 3.5_

  - [ ]* 9.2 Write property test for error state management
    - **Property 2: Error State Management**
    - **Validates: Requirements 1.3, 2.3, 3.5**

  - [x] 9.3 Add success notifications
    - Show toast on successful archive
    - Show toast on successful task creation with task title
    - _Requirements: 3.4_

- [ ] 10. Final Checkpoint
  - Ensure all tests pass
  - Review code for consistency with existing patterns
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The batch actions feature (Requirement 7) is deferred to a future phase
