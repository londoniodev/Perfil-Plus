## 2026-03-26 - Add Order Composite Indexes
**Learning:** The NestJS API uses a Prisma client extension called `prisma.secure` which automatically appends `tenantId` to all operations for row-level security. For frequently accessed large models like `Order`, indexes on `createdAt` and `status` are not enough. Without a composite index starting with `tenantId` (e.g. `@@index([tenantId, createdAt])`), Postgres cannot efficiently filter by tenant before applying business logic sorts/filters.
**Action:** When working on frequently queried models in this single-DB multi-tenant architecture, always ensure there is a composite index starting with `tenantId` coupled with the primary filtering/sorting columns.

## 2026-03-27 - Parallelize storefront cache revalidation to improve throughput
**Learning:** In the NestJS API (`apps/api`), when purging cache in the Next.js Storefront for multiple tags (like in `StorageService` or `TenantService`), executing fetch requests sequentially using a `for...of` loop causes significant cumulative latency.
**Action:** Always parallelize multiple independent outbound HTTP requests (like revalidating cache tags) using `Promise.all` with `.map()`. Ensure proper timeout handling (`AbortSignal.timeout`) per request and safe error catching using `catch (e: unknown)`.
