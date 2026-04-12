## 2024-03-26 - [Tenant Isolation Gap in Branding Updates]
**Vulnerability:** IDOR (Insecure Direct Object Reference) combined with RLS Bypass.
**Learning:** Updates to a tenant's BrandSettings were using the non-secure Prisma client (`this.prisma.brandSettings.upsert()`). Even though `tenantId` was supplied, it bypassed Row-Level Security, allowing a user from one tenant to modify another tenant's branding if they manipulated the ID.
**Prevention:** Always use the injected `this.prisma.secure` client for operations scoped to a tenant. Only use the standard or `raw` clients for explicit global operations (like resolving the tenant context initially or global CRON jobs).
## 2025-02-18 - Fix Sensitive Data Exposure in Tenant Config
**Vulnerability:** The API endpoint returning tenant configuration did not properly filter for public settings (`isPublic: true`), exposing sensitive system data.
**Learning:** System configurations can contain sensitive secrets. When providing configuration variables to the frontend, always filter and only expose explicit public keys or values marked as `isPublic: true`.
**Prevention:** Always scope data queries to limit data returned explicitly to public contexts by filtering on database attributes designed to partition visibility, such as `isPublic: true`.
## 2026-04-12 - [Tenant Isolation Gap in LMS Evaluations and Questions]
**Vulnerability:** Cross-Tenant IDOR. Global models (`Evaluation`, `Question`) lacked direct `tenantId` fields, allowing users from one tenant to update or delete resources belonging to another tenant if they manipulated the resource IDs.
**Learning:** RLS in the database or direct filtering is bypassed if models lack a tenant identifier and the API relies only on primary keys. For models linked hierarchically (e.g., `Theme` -> `Evaluation` -> `Question`), tenant association exists but must be manually enforced.
**Prevention:** Always enforce tenant isolation on global models by injecting a relational lookup for `tenantId` (e.g., `where: { id, evaluation: { theme: { tenantId } } }`) using `findFirst` in the service layer before updates or deletions.
