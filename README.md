# SalesCore CRM

> CRM de ventas profesional para negocios que venden por WhatsApp y otros canales.

![SalesCore Dashboard](https://via.placeholder.com/1200x600/6366f1/ffffff?text=SalesCore+CRM+Dashboard)

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Base de datos** | PostgreSQL 16 |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **Validación** | Zod (compartido frontend/backend) |
| **UI Components** | shadcn/ui + Recharts |
| **Infra** | Docker + docker-compose |
| **Arquitectura** | Monorepo (npm workspaces) |

---

## 📁 Estructura del Proyecto

```
salescore/
├── apps/
│   ├── api/                    # Backend Node.js + Express
│   │   ├── src/
│   │   │   ├── config/         # DB connection, env vars
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── repositories/   # DB queries
│   │   │   ├── middlewares/    # Auth, tenant guard, error handler
│   │   │   ├── routes/         # Express routers
│   │   │   ├── scripts/        # migrate.ts, seed.ts
│   │   │   └── types/          # Express type extensions
│   │   ├── migrations/         # SQL migrations
│   │   ├── Dockerfile
│   │   └── .env.example
│   └── web/                    # Frontend Next.js 14
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── (auth)/     # login, register
│       │   │   └── (dashboard)/# dashboard, clients, deals, tasks, settings
│       │   ├── components/     # UI components + layout
│       │   ├── contexts/       # AuthContext
│       │   ├── hooks/          # use-toast
│       │   └── lib/            # api.ts, auth.ts, utils.ts
│       ├── Dockerfile
│       └── .env.example
└── packages/
    └── shared/                 # Tipos y schemas Zod compartidos
        └── src/schemas/
```

---

## ⚡ Levantar con Docker (Recomendado)

### Prerequisitos
- Docker Desktop instalado y corriendo
- Puertos 3000, 4000, 5432 disponibles

### Paso 1: Clonar y configurar

```bash
git clone <repo-url>
cd salescore
```

### Paso 2: Levantar todos los servicios

```bash
docker-compose up --build -d
```

Esto levanta:
- **PostgreSQL** en `localhost:5432`
- **API** en `http://localhost:4000`
- **Web** en `http://localhost:3000`

### Paso 3: Correr migraciones

```bash
docker-compose exec api node -e "require('ts-node').register({project:'tsconfig.json'}); require('./src/scripts/migrate.ts')"
```

O desde el host (si tenés Node.js instalado):
```bash
cd apps/api
cp .env.example .env
# Editar .env con DATABASE_URL correcto
npm run migrate
```

### Paso 4: Cargar datos demo

```bash
docker-compose exec api node -e "require('ts-node').register({project:'tsconfig.json'}); require('./src/scripts/seed.ts')"
```

O desde el host:
```bash
cd apps/api
npm run seed
```

### Paso 5: Abrir la app

```
http://localhost:3000
```

---

## 💻 Desarrollo Local (sin Docker)

### Prerequisitos
- Node.js 20+
- PostgreSQL 16 corriendo localmente

### Setup

```bash
# 1. Instalar dependencias (desde raíz del monorepo)
npm install

# 2. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Editar ambos archivos con tus valores

# 3. Correr migraciones
npm run migrate

# 4. Cargar datos demo
npm run seed

# 5. Iniciar en modo desarrollo (api + web en paralelo)
npm run dev
```

La API corre en `http://localhost:4000` y el frontend en `http://localhost:3000`.

---

## 🔑 Credenciales Demo

| Campo | Valor |
|-------|-------|
| **Email** | `admin@salescore.demo` |
| **Contraseña** | `demo1234` |
| **Empresa** | TechVentas AR |
| **Rol** | ADMIN |

---

## 🗄️ Base de Datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `companies` | Empresas (multi-tenant) |
| `users` | Usuarios con roles ADMIN/USER |
| `refresh_tokens` | Tokens de refresh JWT |
| `clients` | Clientes con datos de contacto |
| `deals` | Oportunidades de venta (pipeline) |
| `tasks` | Tareas relacionadas a clientes/deals |
| `activities` | Historial de actividades (notas, llamadas, WhatsApp) |

### Comandos útiles

```bash
# Correr migraciones
npm run migrate

# Cargar datos demo
npm run seed

# Conectar a PostgreSQL (Docker)
docker-compose exec postgres psql -U salescore -d salescore_db
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register     # Crear empresa + admin
POST   /api/auth/login        # Login → tokens
POST   /api/auth/refresh      # Renovar access token
POST   /api/auth/logout       # Invalidar refresh token
GET    /api/auth/me           # Usuario actual
PATCH  /api/auth/branding     # Actualizar branding empresa
```

### Clients
```
GET    /api/clients           # Listar (search, limit, offset)
GET    /api/clients/:id       # Detalle
POST   /api/clients           # Crear
PATCH  /api/clients/:id       # Actualizar
DELETE /api/clients/:id       # Eliminar
```

### Deals
```
GET    /api/deals             # Listar (stage, client_id, limit, offset)
GET    /api/deals/kanban      # Agrupado por stage
GET    /api/deals/:id         # Detalle
POST   /api/deals             # Crear
PATCH  /api/deals/:id         # Actualizar
PATCH  /api/deals/:id/stage   # Cambiar etapa
DELETE /api/deals/:id         # Eliminar
```

### Tasks
```
GET    /api/tasks             # Listar (filter: today|overdue|upcoming|all)
GET    /api/tasks/:id         # Detalle
POST   /api/tasks             # Crear
PATCH  /api/tasks/:id         # Actualizar
PATCH  /api/tasks/:id/done    # Marcar como hecha/pendiente
DELETE /api/tasks/:id         # Eliminar
```

### Activities
```
GET    /api/activities        # Listar (related_type, related_id)
GET    /api/activities/:id    # Detalle
POST   /api/activities        # Crear
DELETE /api/activities/:id    # Eliminar
```

### Metrics
```
GET    /api/metrics/summary   # KPIs del dashboard
```

### Formato de respuestas

**Éxito:**
```json
{ "ok": true, "data": { ... } }
```

**Error:**
```json
{ "ok": false, "error": { "message": "...", "code": "..." } }
```

---

## 🔒 Seguridad

- **JWT** con access token (15min) + refresh token (7 días)
- **bcrypt** para hash de contraseñas (salt rounds: 12)
- **helmet** para headers HTTP seguros
- **cors** configurado por origen
- **rate limiting** (100 req / 15min por IP)
- **Multi-tenant**: todo query incluye `company_id` del JWT
- **tenantGuard**: middleware que valida que el recurso pertenece a la empresa del token

---

## 📸 Screenshots para LinkedIn

Para sacar las mejores capturas para LinkedIn:

### 1. Dashboard (más impactante)
- URL: `http://localhost:3000/dashboard`
- Asegurate de tener datos demo cargados
- Capturá el dashboard completo con KPIs y gráfico

### 2. Pipeline Kanban
- URL: `http://localhost:3000/deals`
- Seleccioná vista "Kanban"
- Mostrá las columnas con deals en diferentes etapas

### 3. Detalle de Cliente
- URL: `http://localhost:3000/clients/[id]`
- Mostrá el historial de actividades y deals

### 4. Lista de Clientes
- URL: `http://localhost:3000/clients`
- Mostrá la tabla con datos reales

### 5. Configuración / Branding
- URL: `http://localhost:3000/settings`
- Mostrá el panel de personalización

### Tips para LinkedIn:
- Usá modo oscuro del navegador para variedad
- Capturá en resolución 1280x800 o superior
- Mostrá el sidebar + contenido principal
- Destacá el diseño responsive en mobile

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    MONOREPO                          │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  @salescore/ │    │      apps/web             │   │
│  │   shared     │◄───│   Next.js 14 App Router   │   │
│  │  (Zod types) │    │   Tailwind + shadcn/ui    │   │
│  └──────┬───────┘    └──────────────────────────┘   │
│         │                        │ HTTP/REST          │
│         │            ┌──────────────────────────┐   │
│         └────────────►      apps/api             │   │
│                      │   Express + TypeScript    │   │
│                      │   Controllers/Services/   │   │
│                      │   Repositories            │   │
│                      └──────────┬───────────────┘   │
│                                 │                    │
│                      ┌──────────▼───────────────┐   │
│                      │      PostgreSQL 16         │   │
│                      │   Multi-tenant by         │   │
│                      │   company_id              │   │
│                      └──────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### La app no carga datos
```bash
# Verificar que las migraciones corrieron
docker-compose exec postgres psql -U salescore -d salescore_db -c "\dt"

# Verificar que el seed corrió
docker-compose exec postgres psql -U salescore -d salescore_db -c "SELECT count(*) FROM clients;"
```

### Error de conexión a la DB
```bash
# Verificar que postgres está healthy
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres
```

### Error CORS
- Verificar que `CORS_ORIGIN` en la API coincide con la URL del frontend
- En desarrollo: `CORS_ORIGIN=http://localhost:3000`

### Rebuild completo
```bash
docker-compose down -v
docker-compose up --build -d
```

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (api + web en paralelo) |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar en producción |
| `npm run migrate` | Correr migraciones SQL |
| `npm run seed` | Cargar datos demo |

---

## 🤝 Contribuir

1. Fork el repo
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📄 Licencia

MIT © 2024 SalesCore

---

*Construido con ❤️ para demostrar arquitectura full-stack moderna en TypeScript*
