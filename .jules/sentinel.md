## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-04-14 - Fix IDOR and RLS Bypass in LMS Update/Delete operations
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with potential RLS Bypass.
**Learning:** `findUnique` requires a unique constraint. If RLS automatically injects `tenantId` into `where` args for queries, using `findUnique` across relations might fail or fail to properly scope the update/delete.
**Prevention:** Prisma's `findUnique` query should be replaced with `findFirst` to prevent IDOR and bypass issues in multi-tenant architectures, especially for models without a direct `tenantId`.
## 2025-04-14 - Fix IDOR and RLS Bypass in LMS Update/Delete operations
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with potential RLS Bypass.
**Learning:** `findUnique` requires a unique constraint. If RLS automatically injects `tenantId` into `where` args for queries, using `findUnique` across relations might fail or fail to properly scope the update/delete.
**Prevention:** Prisma's `findUnique` query should be replaced with `findFirst` to prevent IDOR and bypass issues in multi-tenant architectures, especially for models without a direct `tenantId` or compound keys. However, compound unique keys containing `userId` and `evaluationId`/`lessonId` are inherently secure and cannot be swapped to `findFirst` when utilizing `userId_evaluationId` wrapper objects.
