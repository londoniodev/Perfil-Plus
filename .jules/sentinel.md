## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-02-18 - Fix Cross-Tenant IDOR in OrdersService
**Vulnerability:** Insecure Direct Object Reference (IDOR) due to missing tenant isolation checks.
**Learning:** In a multi-tenant setup, using Prisma's `findUnique` or `update` with only an `id` parameter allows users to bypass Row-Level Security if they guess or obtain an `id` from another tenant. Prisma's strict unique constraints prevent simply adding `tenantId` to these queries.
**Prevention:** Always use `findFirst` with explicit `tenantId` filtering for reads, and `updateMany` (coupled with a subsequent `findFirst` if the updated record is needed) for writes to securely enforce tenant boundaries without requiring composite unique keys.
