# Rainy Day

AI-powered productivity agent that turns your inbox into an actionable daily plan.

## Architecture

The application consists of two main parts:

1. **Frontend (Tauri + React)** - Desktop application built with Tauri and React
2. **Backend (Bun + Hono)** - HTTP API server that handles authentication, data sync, and AI features

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) - Package manager for frontend
- [Bun](https://bun.sh/) - Runtime for backend
- [Rust](https://rustup.rs/) - Required for Tauri (only for keychain access)

## Quick Start

### 1. Setup Backend

```bash
cd server
cp .env.example .env
# Edit .env with your credentials (Turso, Google OAuth, Gemini, etc.)
bun install
bun run dev
```

The backend will start at `http://localhost:3000`

### 2. Setup Frontend

```bash
# From root directory
cp .env.example .env
# Edit .env if needed (VITE_API_URL defaults to http://localhost:3000)
pnpm install
pnpm tauri dev
```

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET` | Secret for JWT tokens |
| `PORT` | Server port (default: 3000) |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: http://localhost:3000) |

## API Endpoints

### Authentication
- `POST /auth/init` - Start OAuth flow
- `GET /auth/poll` - Poll for auth completion
- `POST /auth/session/exchange` - Exchange code for tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Data
- `GET /data/emails` - Get synced emails
- `GET /data/events` - Get calendar events
- `GET /data/tasks` - Get tasks
- `GET /data/task-lists` - Get task lists

### Actions
- `POST /actions/tasks` - Create task
- `PATCH /actions/tasks/:id` - Update task
- `POST /actions/tasks/:id/complete` - Complete task
- `DELETE /actions/tasks/:id` - Delete task

### Sync
- `POST /sync/trigger` - Trigger data sync
- `GET /sync/status` - Get sync status

### Plan
- `GET /plan/today` - Get today's AI plan
- `POST /plan/generate` - Generate new plan

## Development

### Frontend Development
```bash
pnpm dev          # Start Vite dev server only
pnpm tauri dev    # Start full Tauri app
```

### Backend Development
```bash
cd server
bun run dev       # Start with hot reload
```

### Type Checking
```bash
pnpm typecheck    # Frontend
cd server && bun run typecheck  # Backend
```

## Project Structure

```
├── src/                    # Frontend React code
│   ├── components/         # UI components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   │   └── backend/        # HTTP backend services
│   └── types/              # TypeScript types
├── server/                 # Backend API
│   └── src/
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── db/             # Database schema & migrations
│       └── jobs/           # Background jobs (Inngest)
└── src-tauri/              # Tauri/Rust code (keychain only)
```

## License

MIT
