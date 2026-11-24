# Sistema de Control de Proyectos y Recursos — Frontend

Interfaz web del Sistema de Control de Proyectos y Recursos de FACYT.

- **Framework:** Next.js 16 (App Router, React 19).
- **Autenticación:** NextAuth v5 con Google.
- **UI:** Tailwind CSS 4, componentes shadcn/ui, modo claro/oscuro.
- **Datos:** SWR. Usuarios, roles, auditoría, solicitudes de gasto y overhead ya
  consumen el backend real mediante BFF routes; otros módulos conservan mocks.

El backend vive en el repositorio hermano `../backend-proyectos-facyt-dw`.

---

## 1. Requisitos

- Node.js 20.9 o superior (probado con Node 22).
- npm.
- Backend FastAPI en ejecución (`http://localhost:8000`) con la base y los
  seeders aplicados.
- Un Client ID de Google configurado para login.

---

## 2. Instalación y arranque

```bash
npm ci
cp .env.example .env.local    # completar valores
npm run dev
```

La aplicación queda en <http://localhost:3000>.

En PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Si no hay backend, la portada y el login cargan, pero el callback de Google
falla al llamar a `/api/user/auth/google/login`.

---

## 3. Variables de entorno

Copia `.env.example` a `.env.local`. Nunca versiones `.env.local`.

| Variable | Obligatoria | Uso |
|---|---|---|
| `BACKEND_URL` | Sí | URL del backend para las llamadas server-side (BFF). En local: `http://localhost:8000` |
| `AUTH_SECRET` | Sí | Secreto de NextAuth v5 |
| `NEXTAUTH_SECRET` | Sí | Debe coincidir con `AUTH_SECRET` |
| `AUTH_URL` | Sí | URL pública del frontend; `http://localhost:3000` en local |
| `NEXTAUTH_URL` | Sí | Igual que `AUTH_URL` |
| `AUTH_TRUST_HOST` | Sí | `true` en local y detrás de proxies |
| `GOOGLE_CLIENT_ID` | Sí | Mismo Client ID que el backend |
| `GOOGLE_CLIENT_SECRET` | Sí | Secreto OAuth de Google |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` | No | Dominio permitido en el formulario de usuarios (ej. `uc.edu.ve`). Se incrusta en el bundle: requiere rebuild si cambia |

Genera secretos con:

```bash
openssl rand -base64 32
```

`NEXT_PUBLIC_*` se incrusta en el bundle del navegador: no pongas secretos con
ese prefijo.

---

## 4. Conexión con el backend

```text
Navegador
  │  sesión NextAuth (cookie HttpOnly)
  ▼
Next.js (server)
  │  Authorization: Bearer <JWT del backend>
  ▼
FastAPI
```

- `lib/backend.ts` toma el token del backend desde la sesión de NextAuth y lo
  reenvía en el header `Authorization`.
- `lib/axios.ts` usa `BACKEND_URL` para el login (intercambio del ID token de
  Google por el JWT del backend).
- El navegador **no** recibe el JWT del backend ni conoce `BACKEND_URL`.
- Los BFF routes (`/api/users`, `/api/roles`, `/api/audit`) responden `401` sin
  sesión y vuelven a validar el rol en el backend.

### Login con Google

En Google Cloud Console, para el OAuth Client:

- Origen autorizado: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

El email de Google debe estar pre-registrado y activo en `private."user"`. No
hay autorregistro: un administrador crea la cuenta desde el módulo de usuarios
o con `POST /api/user`.

Cuentas de prueba del seed (solo si se usan esos emails en Google; no son
cuentas reales):

| Email | Rol |
|---|---|
| `admin@example.com` | Administrador del Sistema |
| `coordinador1@example.com` | Coordinador de Proyecto |
| `aprobador@example.com` | Aprobador / Gestor de Inventario |

---

## 5. Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run format` | Prettier sobre TS/TSX |

Antes de entregar:

```bash
npm run typecheck
npm run build
npm run lint
```

`npm run lint` actualmente reporta 5 errores y 11 advertencias preexistentes
en componentes de UI (`Date.now()` en render, `setState` dentro de `useEffect`
y variables `_key` sin usar). No están relacionados con este entregable;
`typecheck` y `build` pasan sin errores.

---

## 6. Rutas

| Ruta | Contenido |
|---|---|
| `/` | Portada institucional; con sesión redirige a `/dashboard` |
| `/login` | Inicio de sesión con Google |
| `/unauthorized` | Error de acceso |
| `/dashboard` | KPIs y proyectos |
| `/dashboard/projects/[id]/edit` | Edición de proyecto |
| `/dashboard/priority` | Cambio de prioridad con justificación |
| `/dashboard/inventory` | Stock y mínimos |
| `/dashboard/inventory/lots` | Lotes de entrada |
| `/dashboard/inventory/dispatch` | Despachos |
| `/dashboard/equipment` | Equipos |
| `/dashboard/equipment/reservations` | Reservas |
| `/dashboard/expenses` | Solicitudes de gasto |
| `/dashboard/overhead` | Cierre y prorrateo |
| `/dashboard/vendors` | Proveedores |
| `/dashboard/users` | Usuarios (admin) |
| `/dashboard/audit` | Auditoría (admin) |
| `/dashboard/reports` | Exportaciones |

Todo `/dashboard/**` está protegido por `proxy.ts` (NextAuth). Cada llamada al
backend vuelve a validar JWT, rol y alcance; la protección del frontend no
sustituye la del backend.

### Estado de los módulos

| Módulo | Estado |
|---|---|
| Usuarios, roles, auditoría | Conectado al backend real |
| Proyectos, prioridad | Mock en memoria (SWR) |
| Inventario, lotes, despachos | Mock en memoria |
| Equipos y reservas | Mock en memoria |
| Solicitudes de gasto | Conectado al backend real (BFF + SWR) |
| Overhead y reportes | Overhead real; reportes consumen los hooks reales |

Las solicitudes de gasto y el prorrateo ya no usan snapshots locales: los
reportes de gastos y overhead leen los mismos hooks reales
(`useExpenses`/`useOverheadPeriods`). Los BFF routes validan los cuerpos con Zod
y reenvían el Bearer de la sesión; el backend vuelve a validar rol, alcance,
máquina de estados y cuadre del reparto.

Los mocks que quedan en otros módulos están marcados con comentarios `MAÑANA:` y
`auditUiEvent(...)`. Al conectar esos endpoints reales, cada mutación debe
auditarse en el backend y el puente `ui-event` debe retirarse.

---

## 7. Docker

El repositorio incluye `Dockerfile` multi-stage (Node 22 Alpine) y
`.dockerignore`. Se puede construir solo:

```bash
docker build -t proyectos-facyt-frontend .
docker run --rm -p 3000:3000 \
  -e BACKEND_URL=http://host.docker.internal:8000 \
  -e AUTH_SECRET=... -e NEXTAUTH_SECRET=... \
  -e AUTH_URL=http://localhost:3000 -e NEXTAUTH_URL=http://localhost:3000 \
  -e AUTH_TRUST_HOST=true \
  -e GOOGLE_CLIENT_ID=... -e GOOGLE_CLIENT_SECRET=... \
  proyectos-facyt-frontend
```

O junto con PostgreSQL y el backend:

```bash
cd ../backend-proyectos-facyt-dw
cp .env.example .env
docker compose up --build
```

El `docker-compose.yml` del backend usa `../frontend-proyectos-facyt` como
contexto de build. Si mueves los repositorios, ajusta esa ruta.

`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` se pasa como build arg; los demás secretos
se inyectan en runtime y no quedan horneados en la imagen.

---

## 8. Seguridad

- Sesión con cookie HttpOnly; el JWT del backend no se expone al navegador.
- `proxy.ts` protege `/dashboard/**`; el backend valida de nuevo en cada
  request.
- CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` y HSTS (en producción) configurados en
  `next.config.ts`.
- No se guardan tokens en `localStorage`.
- Los logs no incluyen el `id_token` de Google.
- `.dockerignore` excluye `.env*` (excepto `.env.example`).

---

## 9. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Redirige a `/unauthorized?error=AccessDenied` | El backend rechazó el login: email no registrado, inactivo o dominio inválido | Crea/activa el usuario en el backend |
| `401` en `/api/users` | No hay sesión o el token expiró (60 min) | Vuelve a iniciar sesión |
| `ECONNREFUSED` al backend | `BACKEND_URL` incorrecto o backend apagado | Revisa la variable y `/health` |
| Error de redirect URI en Google | Redirect no autorizado | Añade `http://localhost:3000/api/auth/callback/google` |
| El build falla por variables | Faltan `AUTH_SECRET`/`GOOGLE_*` en el entorno de build | Usa `.env.local` o variables del CI |
| Cambios de `NEXT_PUBLIC_*` no aparecen | Se incrustan en build time | Reinicia `npm run dev` o reconstruye la imagen |

---

## 10. Relación con el backend

- Modelo de datos, triggers y seeders: `../backend-proyectos-facyt-dw/db/`.
- Login, JWT y RBAC: `../backend-proyectos-facyt-dw/docs/auth.md`.
- Auditoría: `../backend-proyectos-facyt-dw/docs/audit.md`.
- README del backend: `../backend-proyectos-facyt-dw/README.md`.
