# Requirements Document

## Introduction

Este documento define los requisitos para integrar completamente las capacidades de AI, jobs en background, y acciones del backend con el frontend de la aplicación Rainy Day. Actualmente el sistema tiene un backend robusto con Gemini AI, Inngest jobs, sistema de memoria, y notificaciones, pero el frontend solo muestra datos estáticos sin aprovechar estas capacidades.

El objetivo es crear una experiencia de productividad inteligente donde la AI genere planes diarios personalizados, el usuario pueda ejecutar acciones reales (crear/completar tareas, etc.), y reciba notificaciones proactivas.

## Glossary

- **Daily_Plan_Generator**: Servicio de AI que analiza emails, calendario y tareas para generar un plan diario personalizado
- **Action_Executor**: Sistema que ejecuta acciones reales sobre Google Tasks, Calendar y Gmail
- **Notification_System**: Sistema de notificaciones push para alertas y recordatorios
- **Memory_Service**: Sistema de memoria con embeddings para personalización basada en historial
- **Inngest_Orchestrator**: Sistema de jobs en background para sincronización y generación automática
- **Frontend_App**: Aplicación Tauri con React que consume el backend
- **Backend_API**: Servidor Hono en Cloud Run con todas las capacidades

## Requirements

### Requirement 1: AI-Powered Daily Plan Generation

**User Story:** As a user, I want to receive an AI-generated daily plan based on my emails, calendar, and tasks, so that I can start my day with clear priorities and actionable items.

#### Acceptance Criteria

1. WHEN the user opens the app in the morning, THE Daily_Plan_Generator SHALL check if a plan exists for today
2. IF no plan exists for today, THEN THE Frontend_App SHALL offer to generate a new AI plan
3. WHEN the user requests plan generation, THE Daily_Plan_Generator SHALL analyze emails, calendar events, and pending tasks
4. WHEN the plan is generated, THE Daily_Plan_Generator SHALL return focus blocks, quick wins, meetings, and defer suggestions
5. THE Daily_Plan_Generator SHALL include an energy tip and motivational summary
6. WHEN displaying the plan, THE Frontend_App SHALL show tasks grouped by type (focus, quick_win, meeting)
7. THE Frontend_App SHALL display suggested times for each task item
8. WHEN the user refreshes, THE Frontend_App SHALL regenerate the plan with updated context

### Requirement 2: Real-Time Task Actions

**User Story:** As a user, I want to create, complete, and manage tasks directly from the daily plan, so that I can act on my priorities without switching apps.

#### Acceptance Criteria

1. WHEN the user marks a task as complete in the UI, THE Action_Executor SHALL update the task status in Google Tasks
2. WHEN the user creates a new task from the plan, THE Action_Executor SHALL create it in Google Tasks
3. WHEN an action succeeds, THE Frontend_App SHALL update the UI optimistically and confirm with backend
4. IF an action fails, THEN THE Frontend_App SHALL show an error message and revert the UI state
5. THE Action_Executor SHALL log all actions for audit and undo capabilities
6. WHEN the user clicks a quick action button, THE Frontend_App SHALL execute the action without additional confirmation

### Requirement 3: Smart Notifications

**User Story:** As a user, I want to receive proactive notifications about upcoming tasks and important emails, so that I never miss deadlines or urgent items.

#### Acceptance Criteria

1. WHEN a task is due within 2 hours, THE Notification_System SHALL create a reminder notification
2. WHEN the daily plan is ready, THE Notification_System SHALL notify the user
3. WHEN important emails arrive, THE Notification_System SHALL create an email summary notification
4. THE Frontend_App SHALL display a notification badge with unread count
5. WHEN the user clicks a notification, THE Frontend_App SHALL navigate to the relevant item
6. THE Frontend_App SHALL allow marking notifications as read individually or all at once

### Requirement 4: Background Sync and Jobs

**User Story:** As a user, I want my data to stay synchronized automatically, so that I always see the latest information without manual refresh.

#### Acceptance Criteria

1. THE Inngest_Orchestrator SHALL sync user data every 5 minutes automatically
2. WHEN the user triggers manual sync, THE Inngest_Orchestrator SHALL prioritize that user's sync
3. THE Inngest_Orchestrator SHALL generate daily plans at 6 AM for active users
4. WHEN sync completes, THE Backend_API SHALL update the last_sync timestamp
5. THE Frontend_App SHALL show sync status indicator (syncing, synced, error)
6. IF sync fails, THEN THE Frontend_App SHALL allow manual retry

### Requirement 5: Memory and Personalization

**User Story:** As a user, I want the AI to learn my preferences over time, so that plans become more personalized and relevant.

#### Acceptance Criteria

1. WHEN the user provides feedback on a plan, THE Memory_Service SHALL store it as episodic memory
2. THE Daily_Plan_Generator SHALL use stored memories to personalize future plans
3. WHEN generating plans, THE Daily_Plan_Generator SHALL consider user's historical patterns
4. THE Memory_Service SHALL automatically expire old episodic memories after 30 days
5. THE Frontend_App SHALL allow users to provide quick feedback (thumbs up/down) on plan items

### Requirement 6: Integrated Calendar View

**User Story:** As a user, I want to see my calendar events integrated with AI suggestions, so that I can plan around my existing commitments.

#### Acceptance Criteria

1. THE Frontend_App SHALL display today's calendar events with meeting links
2. WHEN an event has a Google Meet link, THE Frontend_App SHALL show a "Join" button
3. THE Daily_Plan_Generator SHALL schedule focus blocks around existing meetings
4. WHEN displaying events, THE Frontend_App SHALL show time, title, and location
5. THE Frontend_App SHALL highlight events starting within 15 minutes

### Requirement 7: Email Triage from Plan

**User Story:** As a user, I want to see and act on important emails from my daily plan, so that I can handle urgent communications efficiently.

#### Acceptance Criteria

1. THE Daily_Plan_Generator SHALL identify emails requiring action and include them in the plan
2. WHEN displaying email items, THE Frontend_App SHALL show sender, subject, and snippet
3. THE Frontend_App SHALL allow opening emails in Gmail with one click
4. THE Daily_Plan_Generator SHALL prioritize emails marked as important by Gmail
5. WHEN an email is addressed, THE Frontend_App SHALL allow marking it as handled in the plan

### Requirement 8: Rust/Tauri Native Integration

**User Story:** As a desktop user, I want native OS integration for notifications and quick actions, so that I can interact with the app efficiently.

#### Acceptance Criteria

1. THE Frontend_App SHALL use Tauri's native notification API for system notifications
2. THE Frontend_App SHALL store authentication tokens securely in the OS keychain
3. WHEN the app starts, THE Frontend_App SHALL check backend connectivity and auth status
4. THE Frontend_App SHALL handle offline mode gracefully with cached data
5. THE Frontend_App SHALL support keyboard shortcuts for common actions
