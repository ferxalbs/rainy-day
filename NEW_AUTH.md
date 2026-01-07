Perfecto: sin Firebase y multi‑dispositivo, el plan “completo” es: **backend como autoridad** (tokens + memoria + AI + jobs) y el desktop como cliente seguro (UI + cache + keychain). La clave es separar *credenciales de terceros* (Google/Gemini/Turso/Inngest) de *sesiones de Rainy Day* (por dispositivo).[1][2]

## Arquitectura final (componentes)
### Backend (Bun + Hono)
- **Auth & sesiones**: emite `access_token` corto + `refresh_token` largo por dispositivo, con rotación.[3]
- **Conector Google**: OAuth web-server flow; backend guarda refresh token de Google y renueva access tokens cuando haga falta.[1]
- **AI Orchestrator**: endpoints `/ai/extract` y `/ai/plan` que llaman a Gemini; la API key vive en env vars.  
- **Memoria**: Turso/libSQL como DB principal (usuarios, conexiones, sesiones, “memoria” del agente, snapshots del plan).[4]
- **Jobs**: Inngest para cron/colas; signing key en env var y nunca se envía al cliente (el SDK la mantiene server-side).[2][5]

### Desktop (Tauri)
- **Solo guarda** tokens de sesión de Rainy Day (no Google) en keychain.[6]
- Llama al backend para plan/acciones; puede tener cache local para performance.

## Flujo de autenticación (sin exponer secretos)
### 1) Conectar Google (una vez por usuario)
1. Desktop abre el navegador a `https://api.rainyday.app/auth/google/start?device_id=...` (external user agent recomendado).[7][3]
2. Backend redirige a Google y recibe `code` en `/auth/google/callback`.[1]
3. Backend intercambia `code → tokens` y guarda **refresh token** de Google en DB (encriptado).[1]

### 2) Crear sesión del dispositivo
4. Backend crea una `session` para ese `device_id` y devuelve:
   - `access_token` (15–30 min)
   - `refresh_token` (rotación)  
5. Desktop guarda el refresh token en keychain y usa el access token en `Authorization: Bearer ...`.

### 3) Mantener sesión viva (multi‑dispositivo)
- Cuando expira el access token, el desktop hace `POST /auth/refresh`; backend valida refresh, rota y devuelve un nuevo par. (Esto permite sesiones ilimitadas por usuario porque cada dispositivo tiene su propia sesión).[8][3]

## Modelo de datos (Turso) — mínimo viable
- `users`: identidad interna.  
- `google_connections`: 1 por usuario (o por workspace) con `refresh_token_encrypted`, `scopes`, `email`.[1]
- `devices`: `device_id`, `name`, `platform`, `created_at`.  
- `sessions`: `session_id`, `user_id`, `device_id`, `refresh_token_hash`, `expires_at`, `revoked_at`, `last_seen_at`.[8]
- `memory_items`: para memoria del agente (preferencias, resumen diario, “person context”).  
- `plan_snapshots`: plan generado por día (para historial + debugging).

## Seguridad de secretos (operacional)
- **Nada en el binario**: ni Turso token, ni Gemini key, ni Inngest signing key. Todo en env vars del backend.[2][4]
- Inngest: su security model depende de signing key; mantenla secreta y rota si es necesario.[9][2]
- Google OAuth: el backend es el “confidential client” y protege `client_secret` y refresh tokens.[1]

## Endpoints (contrato definitivo)
Auth:
- `GET /auth/google/start`
- `GET /auth/google/callback`
- `POST /auth/refresh`
- `GET /sessions` (listar dispositivos)
- `POST /sessions/:id/revoke` (logout remoto)

Core:
- `GET /plan/today`
- `POST /actions/task` (create/update/complete/move)
- `POST /actions/email` (label/archive/reply draft – cuando lo habilites)

Jobs/Inngest:
- `POST /inngest` (serve endpoint)

## Sobre Bun + Hono
Sí, encaja bien: Hono corre en Bun de forma oficial/documentada, y es ideal para un backend API + webhooks + callbacks OAuth sin overhead.[10][1]

Para continuar y aterrizarlo 100%: ¿quieres que el primer login sea “abre navegador y listo” (callback normal) o prefieres “device code” para que el desktop nunca reciba redirección?

[Bien: con “callback normal” el flujo queda muy limpio. La idea es que el **callback vaya a tu backend** (no al desktop), y el desktop solo “observa” el resultado y guarda su sesión de Rainy Day en el keychain. Google exige que el `redirect_uri` coincida exactamente con uno autorizado para el cliente OAuth (si no, `redirect_uri_mismatch`).[1]

## Plan completo (implementación)
### 0) Configuración en Google Cloud
- Crea un OAuth Client “Web application” para tu backend y registra el redirect:  
  `https://api.rainyday.app/auth/google/callback` (y el de staging).[1]
- Define scopes mínimos (Gmail/Calendar/Tasks) y usa incremental auth después si agregas más.[2]

### 1) Flujo de login (desktop → browser → backend callback)
1. Desktop genera `device_id` (UUID) y abre el navegador en:  
   `https://api.rainyday.app/auth/google/start?device_id=...`  
2. Backend:
   - Genera `state` aleatorio (CSRF) y lo asocia a `device_id` (en DB) con TTL.[3]
   - Redirige a Google con ese `state`, scopes, y `access_type=offline` para obtener refresh token.[1]
3. Google redirige a tu callback con `code` + `state`.[1]
4. Backend en `/auth/google/callback`:
   - Verifica `state` (anti-CSRF).[3]
   - Intercambia `code` por tokens y guarda el **refresh token** de Google server-side (encriptado).[1]
   - Crea/actualiza `user` y marca “device_id autorizado”.

### 2) Entrega de sesión al desktop (sin inventos raros)
Tienes 2 maneras seguras; elige una:

**Opción recomendada (simple): deep link de vuelta al desktop**
- Backend redirige a un deep link: `rainyday://auth/success?code=<one_time_code>` (ese `one_time_code` dura 60s y solo sirve una vez).  
- Desktop recibe el deep link, llama `POST /auth/session/exchange` con ese `one_time_code`.  
- Backend responde con `access_token` + `refresh_token` **de Rainy Day** (no Google).  

Esto evita copiar/pegar “claves largas” y te deja revocar sesiones por dispositivo.[4]

### 3) Multi-dispositivo ilimitado (modelo de sesiones)
- Cada dispositivo tiene su propia fila en `sessions` y su propio refresh token (rotación).[5][4]
- Implementa `POST /auth/refresh` para rotar refresh tokens (cada refresh invalida el anterior).[5]
- Implementa `GET /sessions` + `POST /sessions/:id/revoke` para cerrar sesión remotamente.[4]

## DB schema (Turso/libSQL)
- `users`
- `devices(device_id, user_id, name, platform, created_at, last_seen_at)`
- `oauth_states(state, device_id, expires_at)` (TTL corto)  
- `google_connections(user_id, refresh_token_encrypted, scopes, email, updated_at)`[1]
- `sessions(session_id, user_id, device_id, refresh_token_hash, expires_at, revoked_at, last_seen_at)`[4]

## Seguridad operacional (Bun + Hono)
- Secretos (Google client_secret, Gemini key, Turso token, Inngest signing key) **solo** en env vars del backend.[6][1]
- Inngest: mantén signing keys privadas y configúralas en el server; no hay motivo para que el cliente las conozca.[7][6]
- State param: úsalo siempre y valídalo en callback.[3]

## Hono/Bun: cómo lo haría
- Rutas: `/auth/google/start`, `/auth/google/callback`, `/auth/session/exchange`, `/auth/refresh`, `/plan/today`, `/actions/*`.  
- Puedes usar middleware tipo `@hono/oauth-providers` para acelerar el OAuth básico (lee `client_id`/`client_secret` desde `Bun.env`).[8]

Pregunta final para cerrar el diseño: ¿ya tienen configurado un deep link `rainyday://` (custom scheme) en Tauri, o prefieren que el desktop “polling” a `/auth/status?device_id=...` hasta que el backend marque éxito?

Entonces no necesitas deep link para arrancar; puedes mantener “callback normal” al backend y resolver el handoff al desktop con **polling seguro** por `device_id` + `state` + `one_time_code`. Esto respeta el flow web‑server de Google (redirect URI al backend) y evita exponer secretos o refresh tokens al cliente.[1][2]

## Plan sin deep link (polling)
### 1) Desktop inicia
- Desktop genera `device_id` (UUID) y llama a tu backend: `POST /auth/init` → backend devuelve:
  - `auth_url` (la URL de Google ya armada)
  - `state` (CSRF)
  - `poll_token` (opaco, random) con TTL corto (5–10 min)[2]
- Desktop abre `auth_url` en el navegador.

### 2) Backend maneja el callback Google
- Google redirige a `GET /auth/google/callback` con `code` + `state` (redirect URI exacta registrada).[1]
- Backend valida `state`, canjea `code → tokens`, y guarda el **refresh token de Google** en DB (encriptado).[1]
- Backend marca `login_attempt(device_id)` como `approved` y genera un `one_time_code` (60–120s, one‑use).

### 3) Desktop finaliza sesión (sin tocar tokens Google)
- Desktop hace polling: `GET /auth/poll?poll_token=...` cada 1–2s (backoff).  
- Cuando el backend responda `approved`, devuelve el `one_time_code`.  
- Desktop llama `POST /auth/session/exchange` con `one_time_code` → backend devuelve:
  - `access_token` corto + `refresh_token` largo **de Rainy Day** (rotación).[3]

Resultado: el cliente solo obtiene tokens de tu app; Google refresh tokens y secretos nunca salen del backend.[1]

## Qué reutilizas de tu versión actual
Tu app hoy “usa lo que Google OAuth v2 da”; eso normalmente significa que el desktop está haciendo el flow y guardando tokens. Lo que cambia es:
- El **OAuth con Google** se mueve al backend (redirect/callback en servidor).[1]
- El desktop cambia a “login contra Rainy Day”, y desde ahí consume tu API.

## Endpoints mínimos (Bun + Hono)
- `POST /auth/init` → `{ auth_url, poll_token }`
- `GET /auth/google/callback` → procesa `code`, setea `approved`
- `GET /auth/poll` → `{ status: pending | approved, one_time_code? }`
- `POST /auth/session/exchange` → `{ access_token, refresh_token }`
- `POST /auth/refresh` → rotación de refresh token.[3]

## Tablas mínimas en Turso
- `login_attempts(device_id, poll_token_hash, state, status, one_time_code_hash, expires_at)`
- `google_connections(user_id, refresh_token_encrypted, scopes, updated_at)`[1]
- `sessions(session_id, user_id, device_id, refresh_token_hash, revoked_at, expires_at)`[4]

## Nota de seguridad importante
- `poll_token` y `one_time_code` deben ser **opacos**, almacenados como hash en DB, con TTL corto y one‑time use; así el polling no se convierte en un vector de robo de sesión.[2][3]

Si esto te sirve, el siguiente paso es decidir: ¿el `device_id` lo generas por instalación (persistente) o por sesión (nuevo cada login)?

Perfecto: “device_id por sesión” (nuevo en cada login) funciona bien, pero **no reemplaza** al identificador de dispositivo para multi‑dispositivo; lo correcto es: *un login_attempt_id efímero* por login + *un device_install_id persistente* por instalación para poder listar/revocar sesiones por dispositivo.[1]

## Diseño final (recomendado)
### Identificadores
- `login_attempt_id` (nuevo cada login): sirve para `state`, `poll_token` y el handoff seguro.[2]
- `device_install_id` (persistente por instalación): se genera una vez y se guarda en disco/keychain; sirve para que el backend sepa “qué laptop es” y puedas revocar esa sesión desde otra máquina.[1]

Aunque “por sesión” te gusta, sin un ID persistente pierdes UX: verás “Unknown device” cada vez y revocar se vuelve confuso.[1]

## Flujo (sin deep link, callback normal)
1) Desktop (si es primera vez) crea `device_install_id` y lo guarda.  
2) Desktop inicia login → backend crea `login_attempt_id`, `state` y `poll_token` (TTL corto).[2]
3) Usuario autoriza en Google → callback al backend → backend valida `state` y guarda refresh token de Google.[3]
4) Backend marca el `login_attempt` como aprobado y genera `one_time_code` (one‑use, TTL 60–120s).  
5) Desktop hace polling con `poll_token` y recibe `one_time_code`.  
6) Desktop hace `POST /auth/session/exchange` con `one_time_code` + `device_install_id`.  
7) Backend crea una **session por dispositivo** y devuelve `access_token` + `refresh_token` de Rainy Day (rotación).[4][1]

## Persistencia y seguridad en el cliente
- Guarda `refresh_token` de Rainy Day en keychain (macOS Keychain / Windows Credential Manager / etc.) usando un plugin tipo keyring.[5][6]
- `access_token` lo puedes mantener solo en memoria; si se pierde, haces refresh.[4]

## Refresh token rotation (obligatorio)
- En `/auth/refresh`: validas refresh token, lo marcas como usado/inválido, generas un nuevo par y lo devuelves. Esto reduce replay si roban un refresh token.[7][4]
- Si detectas reuse (llega un refresh token ya rotado), revocas esa sesión completa.[4]

## Resumen de “por sesión”
- Sí: el **login attempt** y los tokens cambian por sesión.  
- No: conviene mantener `device_install_id` persistente para multi-dispositivo real (listado, nombres, revocación).[1]

Si te parece bien, el siguiente paso es elegir: ¿quieres que el usuario pueda renombrar el dispositivo (“MacBook Pro”, “PC oficina”) desde Rainy Day, o lo autogeneran desde `os + hostname`?

Auto‑generarlos es perfecto y encaja con multi‑dispositivo: el backend puede listar sesiones “por instalación” y el usuario igual podrá revocar cualquiera aunque no la renombre.[1]

## Identidad del dispositivo (auto)
En el desktop genera y envía al backend en `/auth/session/exchange`:
- `device_install_id` (UUID persistente por instalación; guardado en keychain/archivo local).[2]
- `device_name` auto: `platform + hostname` (ej. `macOS • Andres-MBP`) y si no hay hostname, usa `macOS • Desktop`.  
- `device_meta`: `os`, `os_version`, `app_version` (para debug).

En la DB (Turso):
- `devices(device_install_id, user_id, device_name, platform, created_at, last_seen_at)`  
- `sessions(session_id, user_id, device_install_id, refresh_token_hash, revoked_at, expires_at, last_seen_at)`[1]

## Flujo completo (callback normal + polling)
1) `POST /auth/init` (desktop → backend) con `device_install_id + device_name` → backend devuelve `auth_url + poll_token`.  
2) Usuario hace consent en Google → callback en backend valida `state` y guarda refresh token Google server‑side.[3][4]
3) Desktop hace polling `GET /auth/poll` y recibe `one_time_code`.  
4) Desktop hace `POST /auth/session/exchange` con `one_time_code` → backend devuelve `access_token + refresh_token` (Rainy Day).  
5) Desktop guarda refresh token en keychain y renueva con `/auth/refresh` usando **rotation**.[5][2]

## Recomendación rápida de implementación (sin fricción)
- Auto “device_name” desde `os + hostname`, pero agrega sufijo si hay colisión: “(2)”, “(3)”.  
- Actualiza `last_seen_at` en cada request autenticada para mostrar “activo hace 2 min” en UI.[1]

Para aterrizarlo a código: ¿el backend lo vas a desplegar en Vercel/Cloudflare/Render/Railway, o en tu propio VPS? (Importa para decidir cómo persistir cookies, env vars y el endpoint de Inngest).

Se desplegara en Google Cloud Run.