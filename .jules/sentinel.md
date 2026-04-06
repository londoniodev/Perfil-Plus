## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2025-02-18 - [Cross-Tenant IDOR in Blog Module Update/Delete]
**Vulnerability:** IDOR (Insecure Direct Object Reference) bypassing Row-Level Security in multiple endpoints.
**Learning:** The Blog Module's update and delete operations (`updatePost`, `deletePost`, `addAttachment`, `removeAttachment`, `deleteCategory`, `deleteTag`) were using `findUnique` and `delete` with only the `id` of the resource. Since these operations were executed via `this.prisma` and not `this.prisma.secure`, and no explicit `tenantId` constraint was applied, an authenticated user could manipulate the ID parameter to modify or delete resources belonging to other tenants.
**Prevention:** Always require and pass the current user's `tenantId` down from the controller to the service layer for all modifications. Instead of `findUnique({ where: { id } })`, use `findFirst({ where: { id, tenantId } })` to explicitly enforce tenant context and verify ownership before performing update or delete operations on models lacking automatic RLS enforcement.
