# Perfil-Plus AI Coding Guidelines & Architecture Context

Este documento contiene las directivas exactas y detalladas de arquitectura, backend, stack, performance y seguridad. Ninguna regla ha sido resumida. Cualquier Pull Request o cambio que viole estas directivas se considera inválido.

---

# 🏛️ Directivas de Arquitectura y Reglas de Desarrollo (Perfil+ / Flash Urbano)

Este documento define las reglas estrictas de código, seguridad y rendimiento para la IA (Bolt/Jules) y el equipo de ingeniería. Cualquier Pull Request o cambio que viole estas directivas se considera inválido.

## 1. Aislamiento Multi-Tenant y Prevención IDOR (Seguridad)
- **Regla Global:** Todo dato operativo debe estar estrictamente aislado por `tenantId` y `branchId` (sucursal). El frontend SIEMPRE debe inyectar la cabecera `x-branch-id` en peticiones operativas.
- **Global Models (Bypass del Proxy):** Modelos estructurales (ej. `Evaluation`, `Question`) que están en la lista de exclusión del Proxy de Prisma no reciben inyección automática de `tenantId`. 
- **Validación Atómica (Cero TOCTOU):** Para actualizar/eliminar un modelo global comprobando el `tenantId` de su padre, NO hagas un `findFirst` suelto seguido de un `update` (Time-of-Check to Time-of-Use). Tampoco intentes relaciones dentro de `updateMany` (Prisma lanzará error de validación). **Usa una Transacción Interactiva:**
  ```typescript
  return await this.prisma.$transaction(async (tx) => {
    // 1. Verificar pertenencia cruzando relaciones
    const exists = await tx.model.findFirst({ where: { id, parent: { tenantId } }, select: { id: true }});
    if (!exists) throw new NotFoundException('No autorizado');
    
    // 2. Ejecutar mutación
    return await tx.model.update({ where: { id }, data });
  });
  ```

## 2. Optimización de Base de Datos y Prevención de Deadlocks
**Eliminación de N+1:** Reemplaza los bucles secuenciales `for...of` por ejecuciones concurrentes utilizando `Promise.all` y `map()` al interactuar con Prisma.

**ALERTA DE DEADLOCK (Regla Obligatoria):** Cuando necesites actualizar o descontar inventario de múltiples filas en una misma tabla (ej. ProductVariant o Modifier) dentro de una transacción, SIEMPRE debes ordenar (sort) el arreglo alfanuméricamente por su ID ANTES del Promise.all.

**Motivo:** Al asegurar que PostgreSQL reciba los bloqueos de fila (Row Locks) siempre en el mismo orden, el riesgo de Deadlocks cruzados desaparece matemáticamente.

## 3. Asincronismo Seguro e I/O de Red
**Promise.allSettled vs Promise.all:** Usa Promise.all SOLO para transacciones atómicas de base de datos.
Usa Promise.allSettled para llamadas de red independientes (ej. pedir 10 Signed URLs a S3 o hacer Pings). Un fallo en una red no debe colapsar la promesa entera.

**Fire-and-Forget en Transacciones:** NUNCA uses un await para invocar APIs de terceros (ej. envío de Emails vía AWS/Resend) dentro de un bloque prisma.$transaction. Ejecútalos con .then().catch() para no mantener la transacción de la DB bloqueada ni el Event Loop colgado esperando latencias externas.

## 4. WhatsApp Bot y Meta API
**Formato OGG Estricto:** Para enviar audios hacia OpenAI Whisper, construye un FormData e inyecta el Buffer asignando forzosamente el nombre del archivo como audio.ogg. Un Buffer plano provocará un Error 400.

**Rate Limiting (Anti-Spam):** Al enviar arreglos de archivos multimedia (ej. fotos del catálogo), no dispare un Promise.all masivo. Aplica "chunking" (lotes de máx. 5 concurrencias) para evitar ser bloqueado por Meta (Error 429).

**Indicadores UX Requeridos:** Inmediatamente al recibir un Webhook, dispara peticiones asíncronas para enviar mark_as_read y typing_on mientras el LLM procesa la respuesta.

**Gestión del Tiempo:** Prohibido usar setTimeout para encolar tareas futuras (ej. Feedback 30 min post-entrega). Usa @nestjs/schedule (CronJobs en DB) o colas en memoria (BullMQ/Redis) resistentes a reinicios del servidor.

## 5. Gestión del Contexto y Hub de Notificaciones
**Sliding Window:** Para mantener contexto en el LLM sin arruinarse en costos de tokens, el historial de WaConversation debe hacer slice para enviar estrictamente los últimos 15 mensajes operativos.

**Hub Efímero:** El modelo AppNotification en la base de datos existe solo para alertas graves (Handoff a humano, fallos de cobro). NO implementar Soft-Deletes. La acción de "descartar" debe disparar un DELETE físico real para liberar almacenamiento en producción.

---

# Arquitectura y Estructura del Proyecto (Monorepo SaaS Multi-Tenant)

## Principios Generales
- **Estrategia Multi-Tenant**: Single-Database con aislamiento a nivel de fila (Row-Level Security / Filtrado automático por `tenantId`).
- **Single Source of Truth**: `@alvarosky/database` contiene el ÚNICO schema de base de datos del negocio. Prohibido duplicar schemas en la app de la API.
- **Clean Architecture**: Separación estricta entre UI (Componentes en `@alvarosky/ui`), Lógica (Hooks en `@alvarosky/restaurant-sdk`) y Datos (Schemas en `@alvarosky/features`).

## Flujo de Enrutamiento (Proxy de Tenants)
1. El usuario entra a `slug.alvarolondoño.dev`.
2. `apps/_template/src/middleware.ts` intercepta, extrae el slug y verifica el tenant (con caché).
3. Rutas protegidas (`/dashboard`, `/kitchen`, `/admin`) hacen un **rewrite** transparente a `apps/saas_dashboard` (puerto 3002).
4. El middleware inyecta los headers `x-tenant-id` y `x-tenant-features` para el backend.

## Estructura Física
- **`apps/_template`**: Proxy de entrada, Landing pública y PWA base.
- **`apps/saas_dashboard`**: Código de la aplicación SaaS (Panel de admin, POS, cocina). Separado del template para optimizar builds.
- **`apps/api`**: Backend único en NestJS. Atiende a todos los tenants diferenciando por el header `x-tenant-id`.
- **`apps/platform`**: Panel SuperAdmin. Gestiona la creación de tenants.

---

# Reglas de Backend (NestJS + Multi-tenant Single DB)

## Aislamiento de Tenant (CRÍTICO)
- **Auto-Filtering**: El aislamiento se logra usando `nestjs-cls` y una extensión de Prisma.
- **Regla de Oro**: EN NINGÚN CASO se debe usar `this.prisma` estándar para queries de negocio. SIEMPRE usar `this.prisma.secure` para garantizar que se inyecte automáticamente el `tenantId` en las cláusulas `where` y `data`.
- **Modelos Globales**: Solo los modelos definidos explícitamente en el Prisma Extension (como `User`, `SystemSettings`) pueden ignorar el filtrado de tenant.

## Modelo de Negocio
- **Entidad Única**: NUNCA crear tablas como `Book`, `Ebook` o `Shirt`. Usar el modelo `Product` con el enum `productType` (`PHYSICAL`, `DIGITAL`, `SERVICE`, `RESTAURANT`).
- **Inventario**: Utilizar el esquema avanzado unificado (`Warehouse`, `InventoryItem`, `Recipe`).

## Seguridad y Storage
- **Archivos Privados**: Archivos vendibles se suben a buckets en MinIO.
- **Signed URLs**: Nunca exponer la URL pública del bucket para entregables. Usar `getProductDownloadUrl` para firmar URLs temporales.
- **CORS**: Validado dinámicamente según los dominios permitidos del tenant.

---

# Definición del Stack Tecnológico

## Core
- **Arquitectura**: Monorepo (Turborepo) con pnpm Workspaces.
- **Frontend**: Next.js 16+ (App Router).
- **Backend**: NestJS 11 (Express).
- **Base de Datos**: PostgreSQL 15 (Single-Database).
- **ORM**: Prisma 5.2x.

## Frontend & UI
- **PWA Engine**: `@ducanh2912/next-pwa`.
- **Estilos**: Tailwind CSS 3.4 + Componentes Shadcn UI (`@alvarosky/ui`).
- **Estado**: Zustand.
- **Formularios**: `react-hook-form` + `zod` (`@hookform/resolvers`).

## Infraestructura & DevOps
- **Cache**: Redis (`cache-manager-redis-yet`).
- **Storage**: MinIO (S3 Compatible).
- **Deploy**: Dokploy (VPS) con Docker Compose.

---

# Reglas de Performance y Optimización

## Base de Datos (Single-DB Escalabilidad)
- **Índices Obligatorios**: Al usar una sola DB para todos los tenants, CADA tabla transaccional debe tener un índice compuesto: `@@index([tenantId])` o `@@index([tenantId, ...otrosCamposFrecuentes])`. De lo contrario, los queries harán full table scans a medida que la DB crezca.

## Frontend (Next.js & PWA)
- **Resolución de Middleware Cacheada**: La llamada a `/api/tenant/identify` en el `middleware.ts` DEBE estar respaldada por caché (Redis o Next.js unrolled cache) para no saturar el backend.
- **Lazy Loading**: Componentes como `<SecurePdfViewer />`, `<POSInterface />` o Gráficos pesados deben cargarse con `dynamic(() => import(...), { ssr: false })`.
- **Imágenes**: SIEMPRE usar `<Image />` de `next/image` con `sizes`.

## Backend (NestJS)
- **Cache de Configuración**: Las configuraciones del tenant (`SystemSettings`, Features) deben vivir en Redis.
- **Selects Restrictivos**: En Prisma, prohibido hacer `include` anidados de más de 2 niveles. Usar `select` explícito.

---

# Buenas Prácticas de Desarrollo y Monorepo

## Monorepo Management (Reglas Estrictas)
- **Única Fuente de Verdad (DRY)**: Prohibido duplicar schemas de base de datos, tipos o componentes.
- Si un tipo o validación se usa en Frontend y Backend, DEBE ir en `@alvarosky/features` o `@alvarosky/shared`.
- Si se modifica la base de datos, se hace EXCLUSIVAMENTE en `packages/database/prisma/schema.prisma`.

## Formularios (Schema-First)
- **Regla de Oro**: NUNCA usar `useState` para inputs individuales.
- El flujo es: Zod Schema (en `features`) -> `z.infer` -> `useForm` -> `<FormField>` (Shadcn).

## Manejo de Errores y Naming
- **Variables y Funciones**: `camelCase`. Componentes: `PascalCase`.
- **Frontend**: Usar `sonner` (`toast.error`) para feedback.
- **Backend**: Nunca silenciar errores con bloques `catch` vacíos. Usar filtros de excepción globales de NestJS.

---

# Reglas de Escalabilidad (Escalando el SaaS)

## 1. Connection Pooling (Cuello de botella de DB)
- **Problema**: En una arquitectura Single-DB, el backend puede agotar rápidamente el límite de conexiones de PostgreSQL.
- **Regla**: Prisma Client debe instanciarse UNA SOLA VEZ como un singleton global. Si la concurrencia es alta, se debe implementar `PgBouncer` a nivel de infraestructura Docker, y configurar Prisma para usarlo (`?pgbouncer=true`).

## 2. Eventos y Real-Time (Meseros y Cocina)
- **Tecnología**: Para los módulos de restaurante (KDS, POS), usar Server-Sent Events (SSE) o WebSockets (Socket.io).
- **Aislamiento de Eventos**: Los canales de WebSockets DEBEN usar el `tenantId` como sala/room (`room: tenantId_orders`). Un mesero de un tenant nunca debe recibir pings de órdenes de otro tenant.

## 3. Caché Multinivel
- **Nivel 1 (Edge/Next.js)**: Caché de páginas estáticas (Blog, Landing) usando ISR (`revalidate`). Estas páginas no varían frecuentemente.
- **Nivel 2 (Redis)**: Datos compartidos y estáticos del tenant (Menú del día, configuración de branding, listado de productos base). Invalidar caché solo cuando el admin hace un `update` o `toggle-product-availability`.

## 4. Rate Limiting por Tenant
- El límite de peticiones no solo debe ser por IP, sino monitoreado por `tenantId`. Un tenant con un ataque DDoS en su subdominio no debe afectar el performance del resto de tenants.

---

# Aislamiento y Seguridad Multi-Tenant

## 1. Prevención de Fugas de Datos (Cross-Tenant Data Leak)
- Todo query escrito manualmente o Raw SQL (si se llegara a usar `prisma.$queryRaw`) DEBE incluir explícitamente `WHERE tenant_id = $1`. No confiar ciegamente en la abstracción si se hacen queries complejos con JOINs manuales.
- Las referencias de ID cruzadas están prohibidas. Si un usuario intenta acceder a `/admin/products/123`, el backend DEBE verificar implícitamente que el producto `123` pertenece al `x-tenant-id` actual.

## 2. Validación de Inputs a Nivel Plataforma
- NUNCA confiar en que el frontend enviará el `tenantId` en el body del request para operaciones críticas.
- El `tenantId` siempre debe ser extraído del contexto de la sesión segura (vía `nestjs-cls` alimentado por el middleware autenticado) y no de un payload (`req.body.tenantId` = 🛑 PELIGRO).

## 3. Tipado Estricto de IDs
- Para evitar colisiones y asegurar la integridad referencial en toda la plataforma, el `tenantId` en TODOS los esquemas (`database` y `database-management`) debe ser de tipo `String` usando identificadores universalmente únicos (CUID o UUID).
