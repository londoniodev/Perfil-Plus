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
