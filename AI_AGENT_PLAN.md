# 🧠 Rainy Day AI Agent - Plan de Día Inteligente

> **Objetivo**: Crear un agente de productividad que unifica Email + Calendario + Tareas para generar un **plan de día accionable**, no solo un resumen. Diferenciador clave: workflow completo, no features individuales.

---

## 📋 Resumen Ejecutivo

| Aspecto      | Decisión                           |
| ------------ | ---------------------------------- |
| **Backend**  | Bun + Hono (repo: `rainy-day-api`) |
| **Database** | Turso (libSQL)                     |
| **AI**       | Gemini API                         |
| **Jobs**     | Inngest (cron + colas)             |
| **Deploy**   | Google Cloud Run                   |
| **Sync**     | Cada 5 min + on-demand             |
| **Cliente**  | Tauri v2 (notificaciones nativas)  |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Tauri v2)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  • UI del Plan de Día                                                        │
│  • Notificaciones nativas (Tauri Notification API)                          │
│  • Cache local (performance)                                                 │
│  • Keychain: solo tokens de Rainy Day                                       │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Bun + Hono)                                 │
│                         Repo: rainy-day-api                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Auth     │  │   Sync      │  │ AI Agent    │  │   Actions   │        │
│  │   Module    │  │   Engine    │  │  (Gemini)   │  │   Engine    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                          │
│                          ┌────────┴────────┐                                │
│                          │  Memory System  │                                │
│                          │  (Patrones +    │                                │
│                          │   Preferencias) │                                │
│                          └─────────────────┘                                │
│                                                                              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     ┌──────────┐         ┌──────────┐         ┌──────────┐
     │  Turso   │         │  Google  │         │ Inngest  │
     │   (DB)   │         │   APIs   │         │  (Jobs)  │
     └──────────┘         └──────────┘         └──────────┘
```

---

## 🎯 Funcionalidades del Agente

### Nivel 1: Lectura y Análisis

| Fuente       | Datos que extrae                                                      |
| ------------ | --------------------------------------------------------------------- |
| **Gmail**    | Emails sin leer, urgentes, seguimientos pendientes, hilos importantes |
| **Calendar** | Eventos del día, conflictos, tiempo libre, duración de reuniones      |
| **Tasks**    | Tareas pendientes, vencidas, prioridades, subtareas                   |

### Nivel 2: Inteligencia Avanzada

| Capacidad                    | Descripción                                             |
| ---------------------------- | ------------------------------------------------------- |
| **Priorización inteligente** | Ordena tareas por urgencia + importancia + contexto     |
| **Time blocking**            | Sugiere bloques de trabajo profundo en huecos libres    |
| **Detección de conflictos**  | Alerta sobre reuniones superpuestas o tareas imposibles |
| **Estimación de tiempo**     | Aprende cuánto le toma al usuario tipos de tareas       |
| **Sugerencias proactivas**   | "Responde este email antes de tu reunión de las 3pm"    |

### Nivel 3: Acciones Automatizables

| Categoría          | Acciones                                                            |
| ------------------ | ------------------------------------------------------------------- |
| **Email**          | Archivar, etiquetar, marcar como leído, crear borrador de respuesta |
| **Calendario**     | Crear evento, mover reunión, declinar automáticamente               |
| **Tareas**         | Crear, completar, mover fecha, asignar prioridad                    |
| **Cross-platform** | Crear tarea desde email, bloquear calendario para tarea             |

---

## 🧠 Sistema de Memoria del Agente

### Tipos de Memoria

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMORIA DEL AGENTE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PATRONES      │  │  PREFERENCIAS   │  │    CONTEXTO     │  │
│  │   (Aprendidos)  │  │  (Explícitas)   │  │   (Temporal)    │  │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  │
│  │• Deep work AM   │  │• No reuniones   │  │• Proyecto       │  │
│  │• Emails post-   │  │  viernes PM     │  │  activo actual  │  │
│  │  lunch          │  │• Responder en   │  │• Deadlines      │  │
│  │• Duración real  │  │  24h máximo     │  │  próximos       │  │
│  │  de tareas      │  │• Priorizar      │  │• Estado de      │  │
│  │• Horario peak   │  │  cliente X      │  │  ánimo          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Aprendizaje de Patrones

El agente analiza y aprende:

1. **Patrones Temporales**

   - ¿Cuándo hace deep work? (mañanas, noches)
   - ¿Cuándo revisa emails?
   - ¿Días de más productividad?

2. **Patrones de Comportamiento**

   - Tiempo real vs estimado de tareas
   - Tasa de completación de tareas
   - Tipos de emails que ignora vs responde rápido

3. **Patrones de Contexto**
   - Proyectos recurrentes
   - Personas con las que más interactúa
   - Temas que requieren más tiempo

---

## 📡 API Endpoints

### Auth (Autenticación Multi-dispositivo)

```
POST   /auth/init                    → Inicia flow OAuth
GET    /auth/google/callback         → Callback de Google
GET    /auth/poll                    → Polling para desktop
POST   /auth/session/exchange        → Intercambia code por tokens
POST   /auth/refresh                 → Rota refresh token
GET    /sessions                     → Lista dispositivos
POST   /sessions/:id/revoke          → Cierra sesión remota
```

### Sync (Sincronización)

```
POST   /sync/trigger                 → Fuerza sync inmediato
GET    /sync/status                  → Estado última sync
GET    /sync/health                  → Health check del sync
```

### Plan (Core del Agente)

```
GET    /plan/today                   → Plan del día actual
GET    /plan/tomorrow                → Plan de mañana (preview)
POST   /plan/regenerate              → Regenera plan manualmente
GET    /plan/history/:date           → Plan histórico
POST   /plan/feedback                → Feedback sobre sugerencias
```

### Actions (Ejecutar Acciones)

```
POST   /actions/task/create          → Crear tarea
POST   /actions/task/complete        → Marcar completada
POST   /actions/task/reschedule      → Mover fecha
POST   /actions/email/archive        → Archivar email
POST   /actions/email/label          → Aplicar etiqueta
POST   /actions/email/draft          → Crear borrador
POST   /actions/calendar/create      → Crear evento
POST   /actions/calendar/decline     → Declinar invitación
POST   /actions/cross/email-to-task  → Convertir email a tarea
```

### Memory (Sistema de Memoria)

```
GET    /memory/patterns              → Patrones aprendidos
GET    /memory/preferences           → Preferencias del usuario
POST   /memory/preferences           → Actualizar preferencias
DELETE /memory/patterns/:id          → Borrar patrón incorrecto
POST   /memory/feedback              → Feedback para ajustar
```

### Notifications (Push al Cliente)

```
GET    /notifications/pending        → Notificaciones pendientes
POST   /notifications/ack            → Marcar como vista
```

---

## 🗄️ Esquema de Base de Datos (Turso)

### Tablas Core

```sql
-- Usuarios
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Dispositivos
CREATE TABLE devices (
  device_install_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  device_name TEXT NOT NULL,
  platform TEXT NOT NULL, -- macos, windows, linux
  app_version TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

-- Sesiones (multi-dispositivo)
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  device_install_id TEXT NOT NULL REFERENCES devices(device_install_id),
  refresh_token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  last_seen_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Estados de login (TTL corto)
CREATE TABLE login_attempts (
  id TEXT PRIMARY KEY,
  device_install_id TEXT NOT NULL,
  poll_token_hash TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, expired
  one_time_code_hash TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Conexiones con Google
CREATE TABLE google_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  access_token_encrypted TEXT,
  access_token_expires_at INTEGER,
  scopes TEXT NOT NULL, -- JSON array
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Tablas de Sync

```sql
-- Emails sincronizados
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  gmail_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  snippet TEXT,
  from_email TEXT,
  from_name TEXT,
  date INTEGER NOT NULL,
  is_unread INTEGER DEFAULT 1,
  is_important INTEGER DEFAULT 0,
  labels TEXT, -- JSON array
  needs_response INTEGER DEFAULT 0,
  response_urgency TEXT, -- low, medium, high
  synced_at INTEGER NOT NULL,
  UNIQUE(user_id, gmail_id)
);

-- Eventos de calendario
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  google_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  is_all_day INTEGER DEFAULT 0,
  location TEXT,
  attendees TEXT, -- JSON array
  response_status TEXT, -- accepted, declined, tentative, needsAction
  synced_at INTEGER NOT NULL,
  UNIQUE(user_id, google_event_id)
);

-- Tareas
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  google_task_id TEXT,
  task_list_id TEXT,
  title TEXT NOT NULL,
  notes TEXT,
  due_date INTEGER,
  completed_at INTEGER,
  status TEXT DEFAULT 'needsAction', -- needsAction, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  parent_task_id TEXT REFERENCES tasks(id),
  position INTEGER,
  synced_at INTEGER NOT NULL,
  UNIQUE(user_id, google_task_id)
);
```

### Tablas de Memoria

```sql
-- Patrones aprendidos
CREATE TABLE memory_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pattern_type TEXT NOT NULL, -- time_preference, task_duration, email_behavior
  pattern_key TEXT NOT NULL,
  pattern_value TEXT NOT NULL, -- JSON
  confidence REAL DEFAULT 0.5, -- 0-1
  occurrences INTEGER DEFAULT 1,
  last_observed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, pattern_type, pattern_key)
);

-- Preferencias explícitas
CREATE TABLE memory_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  preference_type TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL, -- JSON
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, preference_type, preference_key)
);

-- Contexto temporal
CREATE TABLE memory_context (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  context_type TEXT NOT NULL, -- active_project, deadline, focus_mode
  context_data TEXT NOT NULL, -- JSON
  expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Tablas de Plan

```sql
-- Snapshots del plan diario
CREATE TABLE plan_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  plan_date TEXT NOT NULL, -- YYYY-MM-DD
  plan_data TEXT NOT NULL, -- JSON con el plan completo
  generated_at INTEGER NOT NULL,
  version INTEGER DEFAULT 1,
  feedback_score INTEGER, -- 1-5 rating del usuario
  feedback_notes TEXT,
  UNIQUE(user_id, plan_date, version)
);

-- Acciones ejecutadas
CREATE TABLE action_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- email, task, calendar
  target_id TEXT NOT NULL,
  action_data TEXT, -- JSON
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);
```

### Tablas de Notificaciones

```sql
-- Notificaciones pendientes
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- plan_ready, urgent_email, conflict, reminder
  title TEXT NOT NULL,
  body TEXT,
  data TEXT, -- JSON metadata
  priority TEXT DEFAULT 'normal', -- low, normal, high
  delivered_to TEXT, -- JSON array of device_ids
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
```

---

## ⏰ Jobs con Inngest

### Sync Jobs (Cada 5 minutos por usuario)

```typescript
// Sync periódico
inngest.createFunction(
  { id: "sync-user-data" },
  { cron: "*/5 * * * *" }, // Cada 5 min
  async ({ step }) => {
    // 1. Obtener usuarios activos (last_seen < 1h)
    // 2. Para cada usuario, ejecutar sync
    // 3. Detectar cambios y generar notificaciones
  }
);

// Sync on-demand
inngest.createFunction(
  { id: "sync-on-demand" },
  { event: "sync/requested" },
  async ({ event, step }) => {
    // Sync inmediato para un usuario específico
  }
);
```

### AI Jobs

```typescript
// Generación de plan diario (6am timezone del usuario)
inngest.createFunction(
  { id: "generate-daily-plan" },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    // 1. Para cada usuario en ese timezone
    // 2. Generar plan con Gemini
    // 3. Guardar snapshot
    // 4. Enviar notificación
  }
);

// Re-análisis cuando hay cambios significativos
inngest.createFunction(
  { id: "reanalyze-plan" },
  { event: "plan/needs-update" },
  async ({ event, step }) => {
    // Recalcular plan por cambio en calendario/tareas
  }
);
```

### Learning Jobs

```typescript
// Análisis de patrones (diario a medianoche)
inngest.createFunction(
  { id: "analyze-patterns" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    // Analizar comportamiento del día
    // Actualizar patrones en memory_patterns
  }
);
```

---

## 🔔 Notificaciones con Tauri v2

### Tipos de Notificaciones

| Tipo                | Trigger                 | Prioridad |
| ------------------- | ----------------------- | --------- |
| `plan_ready`        | Plan del día generado   | Normal    |
| `urgent_email`      | Email marcado urgente   | Alta      |
| `meeting_reminder`  | 15 min antes de reunión | Alta      |
| `conflict_detected` | Conflicto en calendario | Alta      |
| `task_overdue`      | Tarea vencida           | Normal    |
| `focus_suggestion`  | Sugerencia de deep work | Baja      |

### Implementación Cliente

```typescript
// Tauri v2 Notification API
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

// Polling cada 30s para notificaciones
async function checkNotifications() {
  const pending = await api.get("/notifications/pending");
  for (const notif of pending) {
    await sendNotification({
      title: notif.title,
      body: notif.body,
      icon: getIconForType(notif.type),
    });
    await api.post("/notifications/ack", { id: notif.id });
  }
}
```

---

## 📁 Estructura del Proyecto (rainy-day-api)

```
rainy-day-api/
├── src/
│   ├── index.ts                 # Entry point Hono
│   ├── config/
│   │   ├── env.ts               # Variables de entorno
│   │   └── constants.ts         # Constantes
│   │
│   ├── routes/
│   │   ├── auth.ts              # Rutas de auth
│   │   ├── sync.ts              # Rutas de sync
│   │   ├── plan.ts              # Rutas del plan
│   │   ├── actions.ts           # Rutas de acciones
│   │   ├── memory.ts            # Rutas de memoria
│   │   └── notifications.ts     # Rutas de notifs
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── google-oauth.ts  # OAuth con Google
│   │   │   ├── session.ts       # Gestión de sesiones
│   │   │   └── tokens.ts        # JWT utilities
│   │   │
│   │   ├── sync/
│   │   │   ├── gmail.ts         # Sync Gmail
│   │   │   ├── calendar.ts      # Sync Calendar
│   │   │   ├── tasks.ts         # Sync Tasks
│   │   │   └── orchestrator.ts  # Coordina syncs
│   │   │
│   │   ├── ai/
│   │   │   ├── gemini.ts        # Cliente Gemini
│   │   │   ├── prompts.ts       # Prompts del agente
│   │   │   ├── planner.ts       # Generador de plan
│   │   │   └── analyzer.ts      # Análisis de datos
│   │   │
│   │   ├── memory/
│   │   │   ├── patterns.ts      # Detector de patrones
│   │   │   ├── preferences.ts   # Preferencias
│   │   │   └── context.ts       # Contexto temporal
│   │   │
│   │   └── actions/
│   │       ├── email.ts         # Acciones email
│   │       ├── calendar.ts      # Acciones calendar
│   │       └── tasks.ts         # Acciones tasks
│   │
│   ├── db/
│   │   ├── client.ts            # Cliente Turso
│   │   ├── schema.ts            # Schema SQL
│   │   └── migrations/          # Migraciones
│   │
│   ├── jobs/
│   │   ├── inngest.ts           # Cliente Inngest
│   │   ├── sync.ts              # Jobs de sync
│   │   ├── plan.ts              # Jobs de plan
│   │   └── learning.ts          # Jobs de aprendizaje
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT validation
│   │   ├── rateLimit.ts         # Rate limiting
│   │   └── logging.ts           # Request logging
│   │
│   └── utils/
│       ├── crypto.ts            # Encriptación
│       ├── time.ts              # Timezone helpers
│       └── validation.ts        # Zod schemas
│
├── .env.example                 # Template de env vars
├── package.json
├── tsconfig.json
├── Dockerfile                   # Para Cloud Run
└── README.md
```

---

## 🚀 Fases de Implementación

### Fase 1: Foundation (Semana 1-2)

- [x] Estructura del proyecto
- [ ] Configuración Bun + Hono
- [ ] Cliente Turso + migraciones
- [ ] Sistema de auth completo (OAuth + sesiones + refresh)
- [ ] Middleware básico (auth, logging)
- [ ] Health checks

### Fase 2: Sync Engine (Semana 3-4)

- [ ] Sync Gmail (emails del día)
- [ ] Sync Calendar (eventos de hoy + mañana)
- [ ] Sync Tasks (todas las listas)
- [ ] Inngest: job cada 5 min
- [ ] Endpoint on-demand

### Fase 3: AI Agent Core (Semana 5-6)

- [ ] Cliente Gemini
- [ ] Prompts para análisis de datos
- [ ] Generador de plan de día
- [ ] Priorización inteligente
- [ ] Detección de conflictos

### Fase 4: Actions Engine (Semana 7-8)

- [ ] Acciones de email (archive, label, draft)
- [ ] Acciones de calendario (create, decline)
- [ ] Acciones de tareas (complete, reschedule)
- [ ] Cross-platform (email → tarea)

### Fase 5: Memory System (Semana 9-10)

- [ ] Detector de patrones temporales
- [ ] Aprendizaje de duración de tareas
- [ ] Sistema de preferencias explícitas
- [ ] Contexto temporal (proyecto activo)

### Fase 6: Notifications + Polish (Semana 11-12)

- [ ] Sistema de notificaciones
- [ ] Integración Tauri v2
- [ ] Optimización de performance
- [ ] Rate limiting y seguridad
- [ ] Deploy a Cloud Run

---

## 🔐 Variables de Entorno Requeridas

```env
# Database
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.rainyday.app/auth/google/callback

# AI
GEMINI_API_KEY=...

# Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...  # Para refresh tokens de Google

# App
APP_URL=https://api.rainyday.app
NODE_ENV=production
```

---

## 📊 Métricas de Éxito

| Métrica                  | Target          |
| ------------------------ | --------------- |
| Tiempo de sync           | < 5 segundos    |
| Generación de plan       | < 10 segundos   |
| Precisión de sugerencias | > 80% aceptadas |
| Uptime                   | 99.9%           |
| Latencia API             | < 200ms p95     |

---

## ⚠️ Consideraciones de Seguridad

1. **Refresh tokens de Google**: Encriptados con AES-256-GCM en DB
2. **Tokens de sesión**: Rotación en cada refresh, one-time use
3. **Rate limiting**: Por usuario y por IP
4. **CORS**: Solo orígenes permitidos
5. **Audit log**: Todas las acciones críticas
6. **Scopes mínimos**: Solo los necesarios de Google

---

## 🎯 Diferenciadores vs Competencia

| Nosotros                         | Otros (Notion, Todoist, etc.) |
| -------------------------------- | ----------------------------- |
| Plan de día **generado** por AI  | Usuario organiza manualmente  |
| Unifica email + cal + tasks      | Silos separados               |
| Aprende tus patrones             | Reglas estáticas              |
| Acciones automáticas             | Solo lectura                  |
| Desktop-first (Tauri)            | Web-first                     |
| Privacidad (datos en tu control) | Datos en sus servers          |

---

**Próximo Paso**: Inicializar el repositorio `rainy-day-api` y comenzar con Fase 1 (Foundation).
