# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

---

## Building

### [v0.1.0] - 2026-01-06

Primera versión de desarrollo de Rainy Day - Tu inbox convertido en un plan accionable.

#### Added

**Backend (Rust - Tauri v2)**

- Configuración inicial de Tauri v2 con React 19 + Vite
- Módulo de autenticación OAuth2 con PKCE para Google Sign-In
  - `src-tauri/src/auth/mod.rs` - Flujo OAuth2 completo
  - `src-tauri/src/auth/token_store.rs` - Almacenamiento seguro de tokens
- Clientes API de Google con tipos completos
  - `src-tauri/src/google/gmail.rs` - `threads.list`, `threads.get`
  - `src-tauri/src/google/calendar.rs` - `events.list` para hoy
  - `src-tauri/src/google/tasks.rs` - CRUD completo (create, update, complete, delete)
  - `src-tauri/src/google/types.rs` - Tipos de respuesta para todas las APIs
- Deep-link `rainyday://callback` para manejo de OAuth callback
- Content Security Policy para conexiones seguras a googleapis.com

**Plugins de Tauri**

- `tauri-plugin-deep-link` - Manejo de esquema custom URI
- `tauri-plugin-stronghold` - Almacenamiento encriptado (macOS Keychain)
- `tauri-plugin-store` - Persistencia de datos local
- `tauri-plugin-http` - Requests HTTP autenticados

**Frontend (React + TypeScript)**

- Sistema de tipos TypeScript (`src/types/index.ts`)
  - `AuthStatus`, `UserInfo` - Tipos de autenticación
  - `ThreadSummary`, `GmailThreadDetail` - Tipos de Gmail
  - `ProcessedEvent`, `CalendarEvent` - Tipos de Calendar
  - `Task`, `TaskList`, `NewTask`, `TaskUpdate` - Tipos de Tasks
- Servicios de API (`src/services/`)
  - `auth.ts` - Google OAuth wrapper
  - `gmail.ts` - Fetching de threads
  - `calendar.ts` - Fetching de eventos
  - `tasks.ts` - CRUD completo de tareas
- Contexto de autenticación (`src/contexts/AuthContext.tsx`)
- Componentes UI
  - `GoogleSignIn` - Pantalla de sign-in con branding premium
  - `DailyPlan` - Vista principal con 3 bloques (Agenda, Inbox, Tasks)

**Design System**

- `src/styles/globals.css` - Tokens de diseño completos
  - Dark theme con colores curados
  - Glassmorphism effects
  - Micro-animaciones
  - Soporte para title bar de macOS

**Configuración**

- `src-tauri/tauri.conf.json` - Configuración de app y plugins
- `src-tauri/capabilities/default.json` - Permisos de plugins
- `src-tauri/capabilities/google-api.json` - Permisos para Stronghold

#### Security

- OAuth2 con PKCE (sin client secret en el binario)
- Scopes mínimos: `gmail.readonly`, `calendar.readonly`, `tasks`
- Tokens almacenados en Stronghold (respaldado por Keychain de macOS)
- CSP configurado para conexiones solo a Google APIs

---

## Production

> _Esta sección contendrá releases de producción cuando el proyecto esté listo para uso público._

---

[Unreleased]: https://github.com/enosislabs/rainy-day/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/enosislabs/rainy-day/releases/tag/v0.1.0
