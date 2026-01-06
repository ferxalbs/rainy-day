# Guía: Configuración de Google Cloud para Rainy Day (Desktop)

Esta guía te llevará paso a paso para configurar los servicios de Google Cloud necesarios para Rainy Day, una aplicación de escritorio construida con Tauri.

---

## Índice

1. [Crear Proyecto en Google Cloud](#1-crear-proyecto-en-google-cloud)
2. [Habilitar APIs Requeridas](#2-habilitar-apis-requeridas)
3. [Configurar OAuth 2.0 (Desktop App)](#3-configurar-oauth-20-desktop-app)
4. [Configurar Firebase (Opcional)](#4-configurar-firebase-opcional)
5. [Variables de Entorno](#5-variables-de-entorno)
6. [Verificación y Testing](#6-verificación-y-testing)

---

## 1. Crear Proyecto en Google Cloud

### Paso 1.1: Acceder a la Consola

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Iniciar sesión con tu cuenta de Google

### Paso 1.2: Crear Nuevo Proyecto

1. Click en el selector de proyectos (arriba a la izquierda)
2. Click **"Nuevo Proyecto"**
3. Configurar:
   - **Nombre del proyecto**: `rainy-day` (o el nombre que prefieras)
   - **ID del proyecto**: Se genera automáticamente (puedes editarlo)
   - **Organización**: Opcional
4. Click **"Crear"**

> ⏱️ Espera ~30 segundos mientras se crea el proyecto

### Paso 1.3: Seleccionar el Proyecto

1. Una vez creado, selecciónalo desde el selector de proyectos
2. Verifica que estás en el proyecto correcto (nombre visible en la barra superior)

---

## 2. Habilitar APIs Requeridas

### Paso 2.1: Acceder a la Biblioteca de APIs

1. En el menú lateral: **APIs y servicios** → **Biblioteca**

### Paso 2.2: Habilitar Cada API

Busca y habilita las siguientes APIs (click en cada una → **"Habilitar"**):

| API                     | Uso en Rainy Day                 |
| ----------------------- | -------------------------------- |
| **Gmail API**           | Leer threads/emails del inbox    |
| **Google Calendar API** | Leer eventos del calendario      |
| **Google Tasks API**    | CRUD de tareas                   |
| **People API**          | (Opcional) Contexto de contactos |

### Paso 2.3: Verificar APIs Habilitadas

1. Ir a **APIs y servicios** → **APIs y servicios habilitados**
2. Confirmar que las 3-4 APIs aparecen listadas

---

## 3. Configurar OAuth 2.0 (Desktop App)

### Paso 3.1: Configurar Pantalla de Consentimiento

1. Ir a **APIs y servicios** → **Pantalla de consentimiento OAuth**
2. Seleccionar **"Externo"** (para usuarios fuera de tu organización)
3. Click **"Crear"**

#### Información de la App:

- **Nombre de la app**: `Rainy Day`
- **Correo de asistencia**: Tu email
- **Logo de la app**: Opcional (puedes agregar después)

#### Información del desarrollador:

- **Correos electrónicos**: Tu email de contacto

4. Click **"Guardar y continuar"**

### Paso 3.2: Configurar Scopes

1. Click **"Agregar o quitar alcances"**
2. Buscar y seleccionar estos scopes:

```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/tasks
openid
email
profile
```

3. Click **"Actualizar"** → **"Guardar y continuar"**

### Paso 3.3: Agregar Usuarios de Prueba

> ⚠️ Mientras la app no esté verificada, solo usuarios de prueba pueden autenticarse

1. Click **"Add users"**
2. Agregar tu email y emails de testers
3. Click **"Guardar y continuar"**

### Paso 3.4: Crear Credenciales OAuth

1. Ir a **APIs y servicios** → **Credenciales**
2. Click **"+ Crear credenciales"** → **"ID de cliente de OAuth"**

#### Configuración:

- **Tipo de aplicación**: `Aplicación de escritorio`
- **Nombre**: `Rainy Day Desktop`

3. Click **"Crear"**

### Paso 3.5: Guardar Credenciales

Se mostrará un popup con:

- **Client ID**: `xxxx.apps.googleusercontent.com`
- **Client Secret**: No necesario para apps desktop con PKCE

> 📋 **Copia el Client ID** - lo necesitarás para configurar la app

---

## 4. Configurar Firebase (Opcional)

Firebase puede complementar la app para funcionalidades específicas. Para desktop, los servicios más útiles son:

### Servicios Recomendados para Desktop

| Servicio                   | Uso                             | ¿Útil para Rainy Day?                      |
| -------------------------- | ------------------------------- | ------------------------------------------ |
| **Firebase Auth**          | Autenticación federada          | ⚠️ Ya usamos OAuth directo                 |
| **Cloud Firestore**        | Base de datos NoSQL tiempo real | ✅ Sync de preferencias entre dispositivos |
| **Cloud Functions**        | Backend serverless              | ✅ Procesamiento pesado (IA, batch)        |
| **Firebase Remote Config** | Feature flags                   | ✅ Activar features gradualmente           |
| **Firebase Analytics**     | Métricas de uso                 | ⚠️ Limitado en desktop                     |
| **Cloud Messaging**        | Push notifications              | ❌ No aplica para desktop                  |

### Paso 4.1: Crear Proyecto Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Agregar proyecto"**
3. Seleccionar el proyecto de Google Cloud que ya creaste (`rainy-day`)
4. Seguir el wizard (Analytics opcional)

### Paso 4.2: Configurar Firestore (Si lo usarás)

1. En Firebase Console: **Firestore Database** → **Crear base de datos**
2. Seleccionar modo de producción o prueba
3. Seleccionar ubicación (ej: `us-east1`)

#### Reglas de Seguridad Básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuario solo puede leer/escribir sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Paso 4.3: Obtener Configuración para Desktop

Para apps desktop, NO usamos el SDK de Firebase directamente. En su lugar:

**Opción A: REST APIs de Firebase**

```
https://firestore.googleapis.com/v1/projects/{project-id}/databases/(default)/documents
```

**Opción B: Admin SDK desde Backend**
Si tienes un backend, usa Firebase Admin SDK para operaciones seguras.

---

## 5. Variables de Entorno

### Paso 5.1: Crear archivo .env

En la raíz del proyecto, crea `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com

# Firebase (opcional)
FIREBASE_PROJECT_ID=rainy-day
FIREBASE_API_KEY=tu-api-key
```

### Paso 5.2: Agregar .env a .gitignore

Asegúrate de que `.env` esté en `.gitignore`:

```gitignore
# Environment
.env
.env.local
.env.*.local
```

### Paso 5.3: Usar en Tauri (Rust)

El client ID se puede leer en runtime:

```rust
let client_id = std::env::var("GOOGLE_CLIENT_ID")
    .unwrap_or_else(|_| "default-for-dev".to_string());
```

---

## 6. Verificación y Testing

### Paso 6.1: Test de OAuth

1. Ejecutar la app: `pnpm tauri dev`
2. Click "Continue with Google"
3. Verificar que abre el navegador con la pantalla de consentimiento
4. Autorizar la app
5. Verificar que el callback `rainyday://callback` es capturado

### Paso 6.2: Test de APIs

Una vez autenticado, probar en la consola del navegador (DevTools):

```javascript
// Desde el frontend de Tauri
await window.__TAURI__.core.invoke("get_today_events");
await window.__TAURI__.core.invoke("get_inbox_summary", { maxItems: 5 });
await window.__TAURI__.core.invoke("get_task_lists");
```

### Paso 6.3: Verificar Quotas

1. En Google Cloud Console: **APIs y servicios** → **Cuotas**
2. Revisar límites de cada API

| API          | Límite Gratuito          |
| ------------ | ------------------------ |
| Gmail API    | 250 unidades/usuario/seg |
| Calendar API | 1,000,000 queries/día    |
| Tasks API    | 50,000 queries/día       |

---

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"

- **Causa**: Redirect URI no configurado
- **Solución**: Para apps desktop con PKCE, no necesitas redirect URI en la consola (el flujo usa loopback)

### Error: "This app isn't verified"

- **Causa**: App en modo de prueba
- **Solución**: Agregar usuarios a la lista de testers, o verificar la app para producción

### Error: "Quota exceeded"

- **Causa**: Demasiadas requests
- **Solución**: Implementar caché local y rate limiting

---

## Próximos Pasos

1. [ ] Crear proyecto en Google Cloud Console
2. [ ] Habilitar Gmail, Calendar, Tasks APIs
3. [ ] Configurar OAuth 2.0 (Desktop App)
4. [ ] Agregar tu email como usuario de prueba
5. [ ] Copiar Client ID al archivo `.env`
6. [ ] Probar flujo de autenticación con `pnpm tauri dev`

---

## Referencias

- [Google Cloud Console](https://console.cloud.google.com)
- [Firebase Console](https://console.firebase.google.com)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Calendar API Documentation](https://developers.google.com/calendar/api)
- [Tasks API Documentation](https://developers.google.com/tasks)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
