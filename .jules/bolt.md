## 2026-03-26 - Add Order Composite Indexes
**Learning:** The NestJS API uses a Prisma client extension called `prisma.secure` which automatically appends `tenantId` to all operations for row-level security. For frequently accessed large models like `Order`, indexes on `createdAt` and `status` are not enough. Without a composite index starting with `tenantId` (e.g. `@@index([tenantId, createdAt])`), Postgres cannot efficiently filter by tenant before applying business logic sorts/filters.
**Action:** When working on frequently queried models in this single-DB multi-tenant architecture, always ensure there is a composite index starting with `tenantId` coupled with the primary filtering/sorting columns.

## 2026-03-27 - Product tenant query indexing
**Learning:** Frequent queries that filter by `tenantId` AND multiple boolean flags (like `published` and `isAvailable`) on the `Product` table can cause full-table scans per tenant or slow sorts.
**Action:** Always add a composite index like `@@index([tenantId, flag1, flag2])` (e.g., `@@index([tenantId, published, isAvailable])`) on widely queried models to help the database engine immediately pinpoint the exact subset of records.
