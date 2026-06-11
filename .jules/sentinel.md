## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-02-28 - [Fix Cross-Tenant IDOR in Global LMS Models]
 **Vulnerability:** Cross-Tenant IDOR. Global models (`Evaluation`, `Question`) bypassed the automatic `tenantId` Prisma proxy injection, and update/delete methods lacked relation-traversal tenant validation.
 **Learning:** Global models inherently bypass the primary Prisma RLS proxy filter because they lack a direct `tenantId` attribute. Any mutative operation on these objects requires manual relationship traversal up to a tenant-linked entity to prove ownership safely.
 **Prevention:** Use an interactive `this.prisma.$transaction(async (tx) => {...})` wrapper. First, perform a `findFirst` to verify the relation up to the `tenantId` (e.g. `where: { id, evaluation: { theme: { tenantId } } }`), selecting only the `id`. Then conditionally execute the `update` or `delete` query, completely eliminating TOCTOU scenarios.

## 2025-02-18 - Fix Cross-Tenant IDOR in OrdersService
**Vulnerability:** Insecure Direct Object Reference (IDOR) due to missing tenant isolation checks.
**Learning:** In a multi-tenant setup, using Prisma's `findUnique` or `update` with only an `id` parameter allows users to bypass Row-Level Security if they guess or obtain an `id` from another tenant. Prisma's strict unique constraints prevent simply adding `tenantId` to these queries.
**Prevention:** Always use `findFirst` with explicit `tenantId` filtering for reads, and `updateMany` (coupled with a subsequent `findFirst` if the updated record is needed) for writes to securely enforce tenant boundaries without requiring composite unique keys.

## 2024-04-08 - [High] Fix Cross-Tenant IDOR in Products Service
 **Vulnerability:** Cross-Tenant IDOR on product mutation endpoints (`update`, `updateAvailability`, `remove`). The endpoints used `findUnique` on `id` without verifying the `tenantId` of the target resource, allowing users to modify or delete products from other tenants if they knew the ID.
 **Learning:** In multi-tenant environments relying on row-level isolation via the application layer or scoped Prisma clients, queries checking resource existence prior to modification MUST explicitly validate the `tenantId`. `findUnique` cannot do this if `tenantId` is not part of the unique constraint.
 **Prevention:** Use `findFirst` instead of `findUnique` when querying by `id` to allow including `tenantId: this.cls.get('tenantId')` in the `where` clause, ensuring the resource definitively belongs to the authenticated user's tenant before performing update or delete operations.
