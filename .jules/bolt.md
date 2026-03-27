## 2026-03-26 - Add Order Composite Indexes
**Learning:** The NestJS API uses a Prisma client extension called `prisma.secure` which automatically appends `tenantId` to all operations for row-level security. For frequently accessed large models like `Order`, indexes on `createdAt` and `status` are not enough. Without a composite index starting with `tenantId` (e.g. `@@index([tenantId, createdAt])`), Postgres cannot efficiently filter by tenant before applying business logic sorts/filters.
**Action:** When working on frequently queried models in this single-DB multi-tenant architecture, always ensure there is a composite index starting with `tenantId` coupled with the primary filtering/sorting columns.

## 2026-03-27 - Optimize N+1 Query in Order Cancellation
 **Learning:** Restoring stock inside loops sequentially (N+1 `findUnique` and `update`) causes severe database bottlenecks for large orders.
 **Action:** To resolve N+1 query bottlenecks in loops while preserving tenant isolation, pre-fetch data outside the loop using `this.prisma.secure.<model>.findMany` with an `in:` filter, build in-memory `Map`s for increment aggregation, and execute all `.update` operations concurrently using `Promise.all()`.
