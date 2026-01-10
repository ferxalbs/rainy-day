# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [v0.5.0] - 2026-01-10

#### Added

- **Unified Model Router Architecture**: New `models.ts` as central registry for all AI providers

  - Provider support: Gemini, Groq (extensible to OpenRouter, OpenAI, Cerebras, xAI)
  - Model definitions with tier-based access control
  - Thinking configuration support (levels for Gemini 3, budgets for Gemini 2.5)
  - Helper functions: `getModel()`, `getModelsForTier()`, `buildThinkingConfig()`

- **Gemini 3 Thinking Levels**: Full support for Gemini 3 Flash and Pro thinking modes

  - MINIMAL - Fastest, minimal reasoning (Gemini 3 Flash only)
  - LOW - Simple tasks, reduced latency
  - MEDIUM - Balanced approach (Gemini 3 Flash only)
  - HIGH - Maximum reasoning depth (default)

- **New Models Available**:
  - Gemini 2.5 Flash (Plus tier) - Dynamic thinking budget
  - Gemini 2.5 Pro (Pro tier) - Most capable 2.5 series
  - Gemini 3 Flash Minimal (Plus tier) - Fastest Gemini 3
  - Gemini 3 Pro (Pro tier) - Maximum intelligence
  - Llama 3.3 70B via Groq (Pro tier) - Ultra-fast inference
  - Llama 3.1 8B via Groq (Plus tier) - Lightning-fast small model

#### Improvements

- **SDK Upgrade**: Migrated from `@google/generative-ai` to `@google/genai` for new API capabilities
- **ModelSelector UI**: Redesigned with organized sections (Gemini 3, Gemini 2.5, Groq) and NEW badges
- **Billing Plans**: Now import models from central registry instead of hardcoded arrays

---

### [v0.4.9] - 2026-01-10

#### Improvements

- **Settings Page Reorganization**: Consolidated duplicate AI model selectors and simplified the settings UI.
  - New "AI Configuration" card with model selector and usage limits in one place.
  - Created `UsageLimitsDisplay` component with progress bar and upgrade prompts.
  - Removed inline model selector from `PlanSettings.tsx`.
  - Removed redundant Plan Comparison table.
  - Simplified Actions section (removed duplicate ModelSelector).

---

### [v0.4.8] - 2026-01-10

#### Refactor

- **Upgrade Plan Modal**: Completely rebuilt the upgrade modal using native Shadcn UI components.
  - Replaced custom CSS cards with standard `Card` components for better stability.
  - Fixed `DialogContent` width constraints to prevent content squashing.
  - Implemented a clean, robust 3-column grid layout.

---

### [v0.4.7] - 2026-01-10

#### Fixes

- **Upgrade Modal**: Fixed "compressed" layout and improved responsiveness.
  - Implemented an adaptive grid (1 to 3 columns) for better layout on all screen sizes.
  - Resolved content squashing and text overlapping in pricing cards.
  - Added internal scrolling for smaller viewports.

---

### [v0.4.6] - 2026-01-10

#### Improvements

- **Upgrade Plan Modal**: Completely redesigned the pricing modal with a premium, glassy aesthetic.
  - Implemented sophisticated `PlanCard` components with glassmorphism and theme-aware highlights.
  - Refined price display and feature lists for better readability.
  - Added subtle animations and improved responsive layouts.

---

### [v0.4.5] - 2026-01-10

#### Improvements

- **Actions UI**: Redesigned the "Actions" section in Config Page for a more premium experience.
  - New theme-aware Action Cards for "Upgrade Plan" and "Check for Updates".
  - Refined `ModelSelector` trigger with consistent styling and improved layouts.
  - Enhanced "Sign Out" button with native macOS aesthetics.

---

### [v0.4.4] - 2026-01-10

#### Fixes

- **Theming**: Replaced hardcoded blue colors with dynamic `primary` theme variable in AI Model selection.
- **UI**: Fixed typo in hover border styles in `PlanSettings.tsx`.

---

### [v0.4.3] - 2026-01-10

#### Improvements

- **AI Model Selection UI**: Redesigned model selection in Plan Settings
  - Replaced native radio buttons with a premium `RadioGroup` component
  - Added glassmorphism effects and "perfect blue borders" (`border-blue-500/50`)
  - Improved layout with responsive card-like items for each model
  - Native macOS feel with refined typography and spacing

---

### [v0.4.2] - 2026-01-10

#### Fixes

- **Deep Link Plugin**: Added missing `tauri_plugin_deep_link::init()` to Tauri builder
  - Fixes Stripe checkout success redirect not being captured by the app
  - The `rainyday://billing/success` URL now properly triggers the `UpgradeSuccessModal`
  - Users will now see a confirmation modal after successful subscription payment

---

### [v0.4.1] - 2026-01-10

#### Fixes

- **Stripe Payment Flow**: Complete fix for subscription upgrade process
  - Fixed URL scheme mismatch (`rainy-day://` → `rainyday://`) to match Tauri config
  - Replaced `window.open` with Tauri's `openUrl` from `@tauri-apps/plugin-opener`
  - Added deep link handling for `rainyday://billing/success` and `rainyday://billing/cancel`
  - New `useDeepLinks` hook to capture billing callbacks
  - Plan polling after Stripe checkout to detect webhook updates
  - New `UpgradeSuccessModal` with confetti animation and plan benefits display
  - Shows renewal date and plan features after successful upgrade

---

### [v0.4.0] - 2026-01-09

#### Added

- **SaaS Subscription System**: Complete billing and subscription management
  - 3 pricing tiers: Free ($0), Plus ($4/mo), Pro ($8/mo)
  - Stripe integration with checkout sessions and customer portal
  - Webhook handlers for subscription lifecycle events
  - `user_plans` and `usage_logs` database tables
  - `UpgradePlanModal` with pricing cards and upgrade flow
  - `ModelSelector` dropdown for AI model selection
  - Model access control based on subscription tier
  - Usage limits for free tier (5 plan generations/day)
  - Billing routes: checkout, portal, cancel, reactivate, webhook

#### Improvements

- **AI Models**: Support for 5 AI models based on tier
  - Free: Gemini 2.5 Flash Lite
  - Plus: + Gemini 3 Flash
  - Pro: + Gemini 3 Flash (Dynamic Thinking), Groq GPT OSS 20B/120B

### [v0.3.4] - 2026-01-09

#### Improvements

- **AI Daily Plan Redesign**: Complete redesign of the Daily Plan component for a cleaner, more functional interface
  - New `DailyBriefing.tsx` component replacing `SmartDailyPlan.tsx`
  - Clean SVG icons instead of emojis for a professional look
  - Unified action items list (Focus Blocks, Quick Wins, Meetings combined)
  - Interactive checkboxes for task completion
  - Dynamic action buttons on hover (Archive, Mark Read, Convert to Task, Join Meeting)
  - Preserved all existing functionalities (email actions, feedback, optimistic updates)
  - Removed duplicate date header and refresh button (Topbar handles these)

### [v0.3.3] - 2026-01-09

#### Added

- **Native Agenda System**: Full in-app event management without external Google Calendar redirects
  - `EventFormModal` component with glassmorphism design and date/time pickers
  - Server endpoints `POST/PATCH/DELETE /data/events` for event CRUD operations
  - Calendar service (`events.ts`) integrating Google Calendar API with local DB storage
  - Frontend data service functions (`createEvent`, `updateEvent`, `deleteEvent`)

#### Improvements

- **shadcn Components**: Added calendar, popover, label, textarea, switch components
- **AgendaPage**: Native event creation/deletion with in-app modals and loading states

#### Fixes

- **Auto-Update System**: Added `includeUpdaterJson: true` to GitHub Actions workflow for proper `latest.json` generation

### [v0.3.2] - 2026-01-09

#### Added

- **Agenda**: Add refresh, notifications, and calendar integration to the Agenda page.

### [v0.3.1] - 2026-01-09

#### Added

- **Update System**: Update checking functionality with auto-check and manual triggers.
- **CI/CD**: Enable Tauri updater signing and configure public key.
- **Task Management**: Add task management with create, complete, and delete actions in `TaskPage`.

#### Improvements

- **TaskPage**: Enforce `google_task_id` usage for Google Tasks API interactions.

#### Patches

- **Dependencies**: Update Rust dependencies and server submodule.

### [v0.3.0] - 2026-01-09

#### Added

- **Production Distribution Pipeline**: GitHub Actions workflow for multi-platform releases

  - macOS builds for Apple Silicon (aarch64) and Intel (x86_64)
  - Windows builds with .msi and .exe installers
  - Linux builds with .deb, .rpm, and .AppImage
  - Draft release creation with automatic publishing

- **macOS Bundle Configuration**: Production-ready bundle settings

  - App category: Productivity
  - Copyright and description metadata
  - Minimum system version: macOS 11.0 (Big Sur)
  - `Entitlements.plist` for network, keychain, and notification permissions

- **Production Documentation**

  - `docs/PRODUCTION_SETUP.md` - Complete guide for releases
  - Environment variables and GitHub Secrets documentation
  - Future Apple code signing instructions

- **Auto-Update System**: Native auto-update using Tauri updater plugin
  - `tauri-plugin-updater` and `tauri-plugin-process` integration
  - `UpdateModal` component with download progress and install button
  - `useUpdate` hook for React state management
  - GitHub Releases integration for distributing updates
  - Automatic `latest.json` generation for update checking

#### Improvements

- Updated `.env.example` with production backend URL comments
- Bundle configuration in `tauri.conf.json` now includes Windows settings
- Added updater and process plugin permissions to capabilities

---

### [v0.2.1] - 2026-01-08

#### Added

- **Rust Notification Commands**: Native notification system with Tauri commands

  - `check_notification_permission` - Check if OS notification permission is granted
  - `request_notification_permission` - Request permission from user
  - `send_native_notification` - Send notification with optional sound
  - `send_typed_notification` - Send notification with automatic sound mapping per type
  - New `src-tauri/src/notifications.rs` module

- **Sound Mapping**: Automatic macOS system sounds per notification type

  - `task_due` → Hero sound (urgent)
  - `plan_ready` → Glass sound (positive)
  - `reminder` → Ping sound (gentle)
  - `email_summary` → Blow sound (informational)
  - `system` → Sosumi sound (alert)

- **Documentation**: Future enhancement roadmap

  - `docs/FUTURE_NOTIFICATIONS.md` with scheduled notifications, action buttons, custom sounds, and badge count plans

- **Notification Settings UI**: New settings section in ConfigPage
  - Enable/disable notifications toggle
  - Auto-request permission on app start option
  - Test notification button with status indicator
  - New `useNotificationSettings` hook with localStorage persistence

#### Improvements

- **nativeNotifications Service**: Updated to use Rust commands with fallback chain (Rust → JS plugin → Web)
- **useNativeNotifications Hook**: Now uses `sendTypedNotification` for automatic sound per notification type

### [v0.2.0] - 2026-01-08

#### Added

- **AI-Powered Daily Plan**: Complete integration with Gemini AI for intelligent daily planning

  - `SmartDailyPlan` component replaces static view with AI-generated plans
  - Focus blocks, quick wins, and meeting sections with suggested times
  - Energy tips and motivational summaries from AI
  - Plan regeneration on demand with loading states

- **Real-Time Task Actions**: Full CRUD operations on Google Tasks from the UI

  - `TaskActionButton` component for complete/delete actions
  - `QuickTaskInput` for inline task creation
  - Optimistic UI updates with rollback on error
  - Action logging for audit trail

- **Smart Notifications System**: Proactive notification system

  - `NotificationBell` component with unread badge
  - Notification dropdown with mark as read functionality
  - Task due reminders (2 hours before)
  - Plan ready notifications

- **Background Sync Integration**: Inngest job system fully connected

  - `SyncIndicator` component showing sync status
  - Manual sync trigger from UI
  - Automatic 5-minute sync for active users
  - Last sync timestamp display

- **Memory & Personalization**: AI learning from user feedback

  - Thumbs up/down feedback on plan items
  - Feedback stored as episodic memory for future personalization
  - 30-day memory expiration for relevance

- **Offline Support**: Graceful offline handling

  - LocalStorage caching for plan, tasks, notifications
  - Offline indicator banner
  - "Cached" badge on stale data
  - Automatic retry on reconnection

- **Keyboard Shortcuts**: Power user features

  - `Cmd+R` to refresh/regenerate plan
  - `Cmd+N` to focus quick task input
  - `Cmd+S` to trigger sync

- **Native Tauri Integration**: OS-level features
  - System notifications via Tauri notification API
  - Secure token storage in OS keychain
  - Meeting join buttons with external link handling

#### New Services

- `src/services/backend/plan.ts` - AI plan fetching and feedback
- `src/services/backend/actions.ts` - Task CRUD operations
- `src/services/backend/notifications.ts` - Notification management
- `src/services/backend/cache.ts` - Offline caching layer

#### New Hooks

- `useDailyPlan` - AI plan state management
- `useTaskActions` - Task operations with optimistic updates
- `useNotifications` - Notification state and actions
- `useSyncStatus` - Sync status tracking
- `useKeyboardShortcuts` - Global keyboard shortcuts

#### New Components

- `SmartDailyPlan` - AI-powered daily plan view
- `TaskActionButton` - Task action buttons
- `QuickTaskInput` - Inline task creation
- `NotificationBell` - Notification badge and dropdown
- `SyncIndicator` - Sync status indicator
- `MeetingJoinButton` - Calendar meeting join button
- `OfflineIndicator` - Offline mode banner

#### Property-Based Tests

- Plan structure completeness validation
- Plan regeneration timestamp ordering
- Action execution result consistency
- UI state consistency after actions
- Notification count invariant
- Memory storage on feedback
- Offline fallback behavior

### [v0.1.17] - 2026-01-08

#### Fixed

- **Database Schema Alignment**: Fixed SQL queries in `/data/*` routes to match actual database schema
  - `emails`: Changed `sender`, `received_at`, `is_read` to `from_email`, `from_name`, `date`, `is_unread`
  - `calendar_events`: Removed non-existent `meeting_link` column, now extracted from `description`
  - `task_lists`: Route now derives task lists from `tasks` table (no separate table exists)
- **Synchronous Sync for Development**: `/sync/trigger` now runs synchronously when Inngest is not configured, enabling local development without Inngest Dev Server

#### Changed

- **Frontend Services Migration**: Completed migration from Tauri/Rust commands to HTTP backend
  - `useDailyData` hook now uses `backend/data.ts` services
  - `DailyPlan.tsx` fixed duplicate code and uses backend services
  - Added backward-compatible type conversions (`Email` → `ThreadSummary`, `CalendarEvent` → `ProcessedEvent`)
- **Theme Service**: Migrated from Tauri commands to `localStorage` for theme persistence
- **Deprecated Tauri Services**: Old services (`auth.ts`, `gmail.ts`, `calendar.ts`, `tasks.ts`) now redirect to backend services with deprecation warnings

#### Added

- **Actions Service**: New `src/services/backend/actions.ts` for task CRUD operations via HTTP
- **Better Error Handling**: Data services now return empty arrays on error instead of throwing

### [v0.1.16] - 2026-01-08

#### Added

- **Backend Integration**: Complete integration with Rainy Day Cloud backend for centralized data sync
  - New JWT-based authentication flow with polling mechanism
  - Backend token storage in OS keychain (`store_backend_tokens`, `get_backend_access_token`, `get_backend_refresh_token`, `clear_backend_tokens` commands)
  - New `BackendAuthContext` for React state management
- **Backend Services**: Created `src/services/backend/` module
  - `api.ts`: Base API client with JWT handling and auto-refresh
  - `auth.ts`: Polling auth flow (init → poll → exchange)
  - `data.ts`: Data fetching from backend (emails, events, tasks)
  - `plan.ts`: AI plan generation service
- **Server Endpoints**: New routes in backend server
  - `GET /auth/me`: Returns authenticated user info
  - `GET /data/emails`: Fetch synced emails
  - `GET /data/events`: Fetch calendar events
  - `GET /data/tasks`: Fetch tasks
  - `GET /data/task-lists`: Fetch task lists

#### Improvements

- **AuthContext**: Migrated from local Tauri Google OAuth to backend JWT authentication
- **DailyPlan Component**: Updated to fetch data from backend API instead of local Tauri commands
- **ConfigPage**: Added backend version display and simplified using unified AuthContext

#### Fixes

- **Race Condition**: Fixed SQL race condition in `completeLoginAttempt` where status was set to 'approved' before the one-time code was stored
- **Auth Exchange Endpoint**: Fixed path from `/auth/exchange` to `/auth/session/exchange`
- **User Query**: Fixed `/auth/me` SQL query to use existing columns (removed non-existent `picture` column)

### [v0.1.15] - 2026-01-08

#### Added

- **Retro Sunset Theme**: A nostalgic, cinema-noir inspired theme based on a "keyhole" lighting concept.
  - Day mode: Warm Cream (#fff7ed) with golden accents.
  - Night mode: Deep Brownish Black (#0f0a08) with intense Orange/Gold "keyhole" glow.
- **Config Page**: New page accessible via dock and Command Palette showing user account, app version, theme, and connected capabilities (Gmail, Calendar, Tasks).

### [v0.1.14] - 2026-01-08

#### Added

- **Cosmic Night Theme**: A deep blue variation of the Midnight Void theme.
  - Day mode: Cool Glacial Blue (#f8fafc)
  - Night mode: Deepest Cosmic Blue (#020617) with violet/cyan nebula glow
- **Midnight Void Theme**: A modern, black-focused theme with absolute blacks and graphite tones
  - Day mode: Matte Graphite aesthetic (#0a0a0a)
  - Night mode: Absolute Void (#000000) with subtle electric blue glows
- **Ocean Sunset Theme Optimization**: Revamped colors and backgrounds for a more premium experience
  - Day mode: Refined "peachy sand" palette with smoother sunset horizon gradients
  - Night mode: Deep midnight indigo background with starry patterns and horizon afterglow
  - Improved color precision using precise HSL values for better visual harmony
  - Enhanced contrast and readability across all components

#### Fixes

- **Command Palette UI**: Added glassmorphism effect (`bg/10` and `backdrop-blur-xl`) for a more premium look.

### [v0.1.11] - 2026-01-07

#### Added

- **Starry Christmas Theme**: Festive theme with pine green and Christmas red colors
  - Day mode: Snow white background with subtle snowflake patterns
  - Night mode: Deep forest night with stars and festive light glows
  - Animated stellar backgrounds using CSS radial gradients
- **Enhanced Command Palette** (`Cmd+K`)
  - All four theme variants now accessible from palette
  - Organized into "Theme Colors" and "Appearance Mode" sections
  - Added "Reload Application" action command with ⌘R indicator
  - Active theme indicators use `text-primary` for theme consistency

#### Improvements

- **Theme-aware hover states** across all components using `accent-foreground`
- **Updated Cosmic Gold colors** to Amber 500 (#f59e0b) for better contrast
- **Cosmic Gold night mode** with stellar background effects and radial star patterns
- **Removed ThemeSwitcher from Topbar** - accessible via Command Palette
- All page components (Inbox, Agenda, Task) now use theme variables for hover effects
- Improved component modularity - easier to add new themes

### [v0.1.10] - 2026-01-07

- Added

  - **Sky Blue Theme**: Adaptive light/dark variations with vibrant sky blue accents
  - **Cosmic Gold Theme**: Adaptive light/dark variations with premium gold/amber accents
  - High-contrast color palettes for better readability and aesthetics

- Improvements

  - **Theme Selection UI**: Redesigned `ThemeSwitcher` in Topbar with dual selectors for Theme Name and Appearance
  - Enhanced glassmorphism effects in the theme selectors with `backdrop-blur-2xl`
  - Improved theme transition smoothness

- Fixes
  - Persisting theme name alongside mode in the Tauri backend
  - Updated theme computation to handle named themes and system preferences correctly

### [v0.1.9] - 2026-01-07

#### Added

- **Theme System**: Complete theme management with day, night, and automatic modes
  - Persistent theme storage using Tauri Store plugin
  - Automatic theme detection based on system preferences
  - Smooth transitions between themes with CSS animations
- **Command Palette**: Global command palette accessible via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux)
  - Theme switching commands (Switch to Day/Night/Automatic Theme)
  - Dynamic glassmorphism background with `backdrop-blur-xl`
  - Theme-aware transparency (`bg-black/10` for dark, `bg-white/10` for light)
  - Rounded blue borders (`border-2 border-blue-500/20 rounded-2xl`)
- **Theme Switcher**: Dropdown component in topbar for quick theme switching
  - Icons for each theme mode (Sun, Moon, Monitor)
  - Glassmorphism styling consistent with app design
  - Real-time theme preview

#### Improvements

- Enhanced CSS with separate day and night theme variables
- Updated all components to support dynamic theming
- Improved glassmorphism effects across the UI
- Better color contrast and accessibility in both themes

#### Patches

- Fixed unused import warnings in theme components
- Optimized theme context to prevent unnecessary re-renders

### [v0.1.8] - 2026-01-07

#### Fixes

- **[CRITICAL]** Fixed window drag functionality by adding `core:window:allow-start-dragging` permission to capabilities file
- This was the missing permission required for `data-tauri-drag-region` to work in Tauri v2

### [v0.1.7] - 2026-01-07

#### Fixes

- Restored window drag functionality by adding `data-tauri-drag-region` and refining CSS `app-region` properties
- Improved titlebar stability and prevented text selection in drag regions

### [v0.1.6] - 2026-01-07

#### Improvements

- Enhanced dock tooltips with native macOS glassmorphism and refined aesthetics
- Refined dock and icon styling for a more premium experience
- Adjusted tooltip positioning and delays for better responsiveness

### [v0.1.5] - 2026-01-07

#### Added

- New thin topbar component with proper macOS traffic light spacing (78px)
- macOS-style active indicator dots on dock icons
- Tooltips on dock icons showing page names
- Skeleton loading states for all page components

#### Improvements

- Complete UI redesign with premium macOS aesthetic
- Refined dock styling with enhanced glassmorphism effect
- Consistent rounded blue borders (`rounded-2xl border-blue-500/20`) across all cards
- Proper spacing and centering throughout the app
- Migrated all styling to Tailwind CSS v4 (removed pure CSS)
- Better responsive design for all screen sizes
- Greeting section moved inside content area for cleaner layout

#### Fixes

- Fixed header collision with macOS window controls
- Fixed window drag region not working properly
- Fixed inconsistent spacing and alignment issues

---

### [v0.1.4] - 2026-01-06

#### Improvements

- **Centered UI Layout**: Refactored the main application container to be more centered (`max-w-3xl`) for better focus and aesthetics on larger screens.
- **Natural Design**: Simplified the visual density of all pages (Inbox, Agenda, Task) by replacing heavy borders with clean separators and better vertical spacing.
- **Refined Aesthetics**:
  - Improved list styling with a "natural" flow using `divide-y`.
  - Optimized header width to align with page content.
  - Enhanced item hover states for a more premium, responsive feel.
  - Adjusted icon and text alignment in events and tasks for better readability.

---

### [v0.1.3] - 2026-01-06

#### Added

- Premium macOS-style dock navigation with three pages (INBOX, AGENDA, TASK)
- Glassmorphism effects throughout the UI with semi-transparent backgrounds and backdrop blur
- Blue rounded borders with elegant styling (`border-blue-500/20`)
- Page-based navigation system with smooth transitions
- Custom `useDailyData` hook for shared data fetching across pages
- Individual page components:
  - `InboxPage` - Priority inbox with thread display
  - `AgendaPage` - Today's calendar events with time formatting
  - `TaskPage` - Task list with checkboxes and due dates
- `PremiumDock` component with magnification effects and active state glow
- `MainLayout` component with routing and shared header

#### Improvements

- Completely redesigned UI for professional and elegant appearance
- Enhanced responsive design optimized for macOS
- Smooth hover animations and micro-interactions
- Separated concerns with modular page components
- Premium gradient text effects in header
- Loading states with animated spinner
- Active dock item highlighting with glow effect

---

### [v0.1.2] - 2026-01-06

#### Added

- Native OS Keychain storage for refresh tokens
  - macOS: Keychain (AES-256-GCM encrypted)
  - Windows: Credential Manager
  - Linux: Secret Service
- `keychain.rs` module using cross-platform `keyring` crate
- Automatic migration from old `auth_session.json` to secure storage

#### Improvements

- Session metadata (email, expires_at) now separate from secrets
- Removed `tauri-plugin-stronghold` (not needed with native keychain)
- Hardened capabilities (removed google-api.json capability file)

#### Security

- `refresh_token` stored in OS keychain (encrypted by OS, no user password)
- `access_token` kept only in memory (not persisted)
- JSON file (`session_metadata.json`) contains only non-sensitive metadata

---

### [v0.1.1] - 2026-01-06

#### Improvements

- Session persistence: authentication now survives app restarts

#### Fixes

- Fixed session loss on app restart (tokens were only stored in memory)

---

### [v0.1.0] - 2026-01-06

First development version of Rainy Day - Your inbox converted into an actionable plan.

#### Added

**Backend (Rust - Tauri v2)**

- Initial Tauri v2 configuration with React 19 + Vite
- OAuth2 authentication module with PKCE for Google Sign-In
  - `src-tauri/src/auth/mod.rs` - Complete OAuth2 flow
  - `src-tauri/src/auth/token_store.rs` - Secure token storage
- Google API clients with complete types
  - `src-tauri/src/google/gmail.rs` - `threads.list`, `threads.get`
  - `src-tauri/src/google/calendar.rs` - `events.list` para hoy
  - `src-tauri/src/google/tasks.rs` - CRUD completo (create, update, complete, delete)
  - `src-tauri/src/google/types.rs` - Tipos de respuesta para todas las APIs
- Deep-link `rainyday://callback` para manejo de OAuth callback
- Content Security Policy para conexiones seguras a googleapis.com

**Tauri plugins**

- `tauri-plugin-deep-link` - Custom URI schema handling
- `tauri-plugin-stronghold` - Encrypted storage (macOS Keychain)
- `tauri-plugin-store` - Local data persistence
- `tauri-plugin-http` - Authenticated HTTP requests

**Frontend (React + TypeScript)**

- TypeScript type system (`src/types/index.ts`)
  - `AuthStatus`, `UserInfo` - Authentication types
  - `ThreadSummary`, `GmailThreadDetail` - Gmail types
  - `ProcessedEvent`, `CalendarEvent` - Calendar types
  - `Task`, `TaskList`, `NewTask`, `TaskUpdate` - Task types
- API services (`src/services/`)
  - `auth.ts` - Google OAuth wrapper
  - `gmail.ts` - Fetching threads
  - `calendar.ts` - Fetching events
  - `tasks.ts` - CRUD complete tasks
- Authentication context (`src/contexts/AuthContext.tsx`)
- UI components
  - `GoogleSignIn` - Sign-in screen with premium branding
  - `DailyPlan` - Main view with 3 blocks (Agenda, Inbox, Tasks)

**Design System**

- `src/styles/globals.css` - Complete design tokens
  - Dark theme with curated colors
  - Glassmorphism effects
  - Micro-animations
  - Soporte para title bar de macOS

**Configuración**

- `src-tauri/tauri.conf.json` - App and plugins configuration
- `src-tauri/capabilities/default.json` - Plugin permissions
- `src-tauri/capabilities/google-api.json` - Stronghold permissions

#### Security

- OAuth2 with PKCE (no client secret in the binary)
- Minimum scopes: `gmail.readonly`, `calendar.readonly`, `tasks`
- Tokens stored in Stronghold (backed by macOS Keychain)
- CSP configured for connections only to Google APIs
