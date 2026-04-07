## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.

## 2025-02-18 - Fix Cross-Tenant IDOR in LMS Module
**Vulnerability:** IDOR (Insecure Direct Object Reference) on global LMS models (Theme, Course, Lesson, Evaluation, Question).
**Learning:** Models lacking a direct `tenantId` field (global models linked via parent relationships) bypass automatic Row-Level Security. Admin users from one tenant could manipulate IDs to update or delete educational content belonging to other tenants because the `findUnique` verification lacked tenant validation.
**Prevention:** Always enforce tenant isolation manually for nested global models by replacing `findUnique` with `findFirst` and verifying the `tenantId` through relation traversal (e.g., `where: { id, evaluation: { theme: { tenantId } } }`) before allowing update or delete operations.
