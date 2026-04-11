## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-04-11 - [Cross-Tenant IDOR in Evaluation/LMS Module]
 **Vulnerability:** Unprotected endpoints allowed users to modify, delete, or submit evaluations and questions for any tenant by manipulating object IDs (`findUnique` bypassing relation checks).
 **Learning:** In multi-tenant environments where RLS operates at the tenant level, global models without direct `tenantId` fields (like Evaluations or Questions attached to Themes) remain exposed if queries do not traverse the relationship tree to validate ownership.
 **Prevention:** For operations on deeply nested models, always replace `findUnique` with `findFirst` and inject a relational query path ending in the tenant identifier (e.g., `where: { id, evaluation: { theme: { tenantId } } }`) using context extracted from `ClsService`.
