# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
