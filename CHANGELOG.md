# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
