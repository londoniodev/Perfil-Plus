## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-10-24 - [Fix Cross-Tenant IDOR in LMS Module]
 **Vulnerability:** Unsafe `.unscoped` Prisma client usage and missing relation-based tenant checks in update/delete endpoints.
 **Learning:** When replacing `findUnique` with `findFirst` to patch IDOR, ensure that relations (e.g. `course: { tenantId }` or `theme: { tenantId }`) are explicitly queried if the entity itself doesn't possess a `tenantId`. Additionally, ensure such entities are correctly configured in `globalModels` to avoid crash loops on `tenantId` injection attempts.
 **Prevention:** Use `this.prisma.secure` client universally for standard CRUD operations and assert ownership using relation traversals in `.findFirst()` calls for child entities lacking a native `tenantId` field.
