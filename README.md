# Perfil+ / Flash Urbano (SaaS Monorepo)

Este es el repositorio principal para **Perfil+** y **Flash Urbano**, una plataforma SaaS Multi-Tenant construida bajo una arquitectura de Single-Database y estructurada como un Monorepo de Turborepo.

## 🤖 Para Asistentes de IA (Copilot, Cursor, Windsurf, etc.)
**¡ATENCIÓN!** Antes de proponer o modificar código, la IA está obligada a leer el archivo de contexto:
👉 [**LLM_CONTEXT.md**](./LLM_CONTEXT.md)

Además, las reglas fraccionadas de arquitectura, backend y seguridad se encuentran en la carpeta [`.agents/rules/`](./.agents/rules/). Modificar la estructura de Prisma, el Proxy de Tenants o ignorar el Row-Level Security (tenantId) resultará en código rechazado.

## 🚀 Tecnologías Principales
- **Framework Frontend**: Next.js 16+ (App Router) + PWA
- **Framework Backend**: NestJS 11
- **Base de Datos**: PostgreSQL 15 + Prisma ORM (v5.22)
- **Gestión de Paquetes**: pnpm workspaces
- **Estilos y UI**: Tailwind CSS 3.4 + Shadcn UI
- **Caché y Almacenamiento**: Redis + MinIO (S3 compatible)

## 📁 Estructura del Monorepo

```bash
├── apps/
│   ├── _template        # Proxy de entrada, landing pública y PWA base
│   ├── saas_dashboard   # Panel administrativo del SaaS (POS, Cocina, etc.)
│   └── api              # Backend centralizado en NestJS
├── packages/
│   ├── database         # Única fuente de verdad: Prisma schemas y migraciones
│   ├── ui               # Componentes compartidos de React (Shadcn UI)
│   ├── features         # Lógica compartida, validaciones (Zod)
│   └── restaurant-sdk   # Hooks y lógica específica de negocio
├── tooling/
│   ├── landing-builder  # CLI de procesamiento HTML y MinIO
│   └── load-testing     # Pruebas de estrés con K6
├── .agents/rules/       # Reglas detalladas de arquitectura para IAs
└── LLM_CONTEXT.md       # Reglas unificadas de desarrollo
```

## 🛠️ Comandos Principales (Turborepo)
*Asegúrate de estar usando `pnpm`.*

- **Instalar dependencias**: `pnpm install`
- **Levantar en desarrollo**: `pnpm dev`
- **Compilar para producción**: `pnpm build`
- **Actualizar Base de Datos**: `pnpm --filter @alvarosky/database db:push`
