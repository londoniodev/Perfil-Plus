## 2026-03-26 - Add Order Composite Indexes
**Learning:** The NestJS API uses a Prisma client extension called `prisma.secure` which automatically appends `tenantId` to all operations for row-level security. For frequently accessed large models like `Order`, indexes on `createdAt` and `status` are not enough. Without a composite index starting with `tenantId` (e.g. `@@index([tenantId, createdAt])`), Postgres cannot efficiently filter by tenant before applying business logic sorts/filters.
**Action:** When working on frequently queried models in this single-DB multi-tenant architecture, always ensure there is a composite index starting with `tenantId` coupled with the primary filtering/sorting columns.

## 2026-03-27 - [Optimize Prisma Create Logic in Loops]
 **Learning:** In Prisma interactive transactions, executing sequential queries such as individual nested creates using `for...of` loops results in N+1 query execution bottlenecks, significantly delaying response times. This is fully optimizable.
 **Action:** Instead of `for...of`, `Array.map` combined with `Promise.all` executes independent asynchronous transactional tasks (such as individual creation of groups that only depend on a parent's ID) in parallel safely, yielding vast performance improvements.
