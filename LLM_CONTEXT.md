# Project LLM Context

This file serves as a strict guideline for any Large Language Model (LLM) or AI Coding Assistant interacting with this repository.

## 🏗 Core Architecture: Multitenant, Single DB, Agnostic
This project is built around a **Multitenant, Single DB, Agnostic** architecture. 

### 1. Multitenant (Single Database Strategy)
- **Logical Isolation**: All tenants share the same PostgreSQL database and the same schemas. 
- **Strict Data Segregation**: Every entity/table that belongs to a tenant MUST have a `tenantId` column (or equivalent foreign key that traces back to a tenant).
- **Automatic Context Injection (RLS)**: The backend uses `nestjs-cls` (Continuation-Local Storage) and a Custom Prisma Extension (`PrismaService`) to **automatically** track and inject the current `tenantId` into EVERY query (`findMany`, `create`, `update`, etc.).
- **Rule of Thumb**: DO NOT manually append `tenantId` to your Prisma query `where` or `data` clauses in business services. The secure `PrismaService` handles this under the hood. Only use `this.prisma.unscoped` if you explicitly need to bypass this Global RLS (e.g., in SuperAdmin or cron jobs), and do so with extreme caution.

### 2. Agnostic Core
- The business logic and core components must remain **agnostic** to any specific tenant's domain.
- Do not hardcode tenant-specific logic, IDs, or magic strings in the codebase.
- Tenant-specific behavior should be driven by configuration, feature flags, or database settings, never by `if (tenantId === 'x')` statements.

## 🛠 Tech Stack & Monorepo Structure
The project uses a Monorepo approach managed by **Turborepo** and **pnpm workspaces**.

### Backend (`apps/api`)
- **Framework**: NestJS
- **ORM**: Prisma (`@prisma/client`)
- **Database**: PostgreSQL
- **Key Modules**: Uses `nestjs-cls` for context management, `@nestjs/event-emitter` for event-driven architecture, and custom decorators (e.g., `@CurrentTenant()`).

### Frontend (`apps/saas_dashboard` & `apps/_template`)
- **Ecosystem**: React-based apps.
- **Design System**: (Awaiting new design system guidelines).

## 🧑‍💻 Coding Rules for LLMs
1. **Always verify context**: Before modifying DB operations, verify you are accounting for `tenantId`.
2. **Nomenclature**: The codebase is migrating variables to standard `camelCase`. Avoid using `snake_case` in TypeScript/JavaScript code unless strictly necessary for external integrations or DB raw queries. (Refer to `analysis_results.md` for context).
3. **Paths**: Use relative paths or configured absolute path aliases properly.
4. **Style**: Do not remove existing JSDoc comments or disrupt formatting. 

---
*Note to LLM: When generating code for this project, prefix your thoughts with a quick check on how it impacts the multitenant data isolation.*
