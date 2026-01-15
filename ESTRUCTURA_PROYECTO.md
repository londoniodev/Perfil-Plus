# 📁 Estructura del Proyecto Mauro Web

> Monorepo con **TurboRepo** + **pnpm** que contiene una aplicación web (Next.js) y una API (NestJS).

---

## 📂 Raíz del Proyecto

```
Mauro Web/
├── apps/                    # Aplicaciones principales
├── packages/                # Paquetes compartidos
├── docker-compose.yml       # Configuración Docker para desarrollo/producción
├── turbo.json               # Configuración de TurboRepo
├── pnpm-workspace.yaml      # Configuración del monorepo con pnpm
└── package.json             # Dependencias y scripts del workspace
```

---

## 🌐 apps/web — Frontend (Next.js)

```
apps/web/
├── public/                  # Archivos estáticos públicos
│   ├── areas_impacto/       # Imágenes de las áreas de impacto del servicio
│   ├── clients_logo_optimized/  # Logos optimizados de clientes
│   ├── hero_icons/          # Iconos usados en la sección hero
│   ├── images/              # Imágenes generales
│   ├── proceso/             # Imágenes del proceso/metodología
│   ├── profile_images/      # Fotos de perfil de usuarios/equipo
│   ├── propuesta/           # Imágenes de la sección propuesta de valor
│   └── services/            # Imágenes de servicios ofrecidos
│
└── src/
    ├── app/                 # App Router de Next.js (SOLO RUTAS)
    │   ├── (dashboard)/     # Grupo de rutas del dashboard (autenticadas)
    │   │   ├── admin/       # Panel de administración
    │   │   │   ├── blog/    # CRUD de artículos del blog
    │   │   │   ├── cursos/  # Gestión de cursos LMS
    │   │   │   ├── ebooks/  # Gestión de ebooks
    │   │   │   └── usuarios/# Gestión de usuarios
    │   │   ├── cursos/      # Vista de cursos para usuarios
    │   │   ├── ebooks/      # Vista de ebooks para usuarios
    │   │   ├── perfil/      # Página de perfil del usuario
    │   │   └── suscripcion/ # Gestión de suscripciones
    │   │
    │   ├── auth/            # Páginas de autenticación
    │   ├── blog/            # Blog público con artículos
    │   ├── ebooks/          # Página pública de ebooks
    │   ├── formacion/       # Página de formación/cursos públicos
    │   ├── login/           # Página de inicio de sesión
    │   ├── politica-de-privacidad/ # Página de política de privacidad
    │   ├── portafolio/      # Página del portafolio
    │   ├── registro/        # Página de registro de usuarios
    │   ├── servicios/       # Página de servicios
    │   └── verificar-email/ # Página de verificación de email
    │
    ├── components/          # Componentes React reutilizables
    │   ├── LeadForm/        # Formulario de captura de leads
    │   ├── admin/           # Componentes del panel admin
    │   │   ├── blog/        # Componentes para gestión del blog
    │   │   ├── lms/         # Componentes para gestión LMS
    │   │   ├── ui/          # Componentes UI específicos del admin
    │   │   └── users/       # Componentes de gestión de usuarios
    │   ├── auth/            # Componentes de autenticación
    │   ├── dashboard/       # Componentes del dashboard de usuario
    │   ├── layout/          # Header, Footer, NavigationWrapper
    │   ├── portfolio/       # Componentes del portafolio
    │   ├── sections/        # Secciones de la página principal
    │   ├── seo/             # Componentes de SEO y metadata
    │   ├── servicios/       # Componentes de la página de servicios
    │   ├── subscription/    # Componentes de suscripción
    │   └── ui/              # Componentes UI reutilizables
    │
    ├── constants/           # Datos estáticos (casosData, etc.)
    │
    ├── styles/              # Estilos CSS centralizados
    │
    ├── context/             # Contextos de React
    │   ├── AuthContext.tsx  # Manejo de autenticación global
    │   └── DashboardContext.tsx # Estado del dashboard
    │
    └── lib/                 # Utilidades y configuración
        ├── api.ts           # Cliente HTTP para llamadas al backend
        ├── config.ts        # Configuración de la aplicación
        ├── lms-types.ts     # Tipos TypeScript para el LMS
        ├── sanitize.ts      # Sanitización de HTML (seguridad XSS)
        └── types.ts         # Tipos TypeScript generales
```

---

## 🔧 apps/api — Backend (NestJS)

```
apps/api/
├── prisma/
│   └── schema.prisma        # Esquema de base de datos (PostgreSQL)
│
└── src/
    ├── common/              # Utilidades compartidas del backend
    │   ├── decorators/      # Decoradores personalizados de NestJS
    │   └── guards/          # Guards de autenticación/autorización
    │
    ├── modules/             # Módulos de la API
    │   ├── auth/            # Autenticación (login, registro, JWT, recuperar contraseña)
    │   │   └── dto/         # Data Transfer Objects para auth
    │   ├── blog/            # CRUD de artículos del blog
    │   ├── ebooks/          # Gestión de ebooks y compras
    │   ├── email/           # Servicio de envío de emails (verificación, notificaciones)
    │   ├── leads/           # Captura y gestión de leads
    │   ├── lms/             # Sistema de gestión de aprendizaje (cursos, lecciones, evaluaciones)
    │   │   └── dto/         # DTOs para el LMS
    │   ├── payments/        # Integración con Mercado Pago (suscripciones, webhooks)
    │   │   └── dto/         # DTOs para pagos
    │   ├── storage/         # Almacenamiento de archivos (S3/MinIO)
    │   └── users/           # Gestión de usuarios
    │
    ├── prisma/              # Servicio de Prisma ORM
    │   ├── prisma.module.ts # Módulo de Prisma
    │   └── prisma.service.ts# Servicio de conexión a BD
    │
    └── test/                # Tests de la API
```

---

## 📦 packages/ — Paquetes Compartidos

```
packages/
├── shared/                  # Código compartido entre web y api
│   └── src/
│       ├── index.ts         # Exportaciones principales
│       ├── schemas.ts       # Esquemas de validación (Zod)
│       ├── types.ts         # Tipos TypeScript compartidos
│       └── utils.ts         # Utilidades comunes
│
└── ui/                      # Componentes UI compartidos (futuro)
    └── src/
        ├── index.ts         # Exportaciones
        └── lib/             # Componentes de la librería UI
```

---

## 🎨 Estilos CSS (apps/web/src/app/styles/)

| Archivo | Descripción |
|---------|-------------|
| `index.css` | Importa todos los estilos centralizados |
| `variables.css` | Variables CSS (colores, fuentes, espaciados) |
| `reset.css` | Reset de estilos por defecto del navegador |
| `typography.css` | Estilos de tipografía global |
| `buttons.css` | Estilos de botones reutilizables |
| `cards.css` | Estilos de tarjetas |
| `layout.css` | Estilos de layout general |
| `animations.css` | Animaciones CSS |
| `responsive.css` | Media queries para responsive design |
| `*.module.css` | CSS Modules específicos por componente/página |

---

## 🐳 Docker

El proyecto incluye `Dockerfile` en cada app y un `docker-compose.yml` en la raíz para orquestar:
- **web**: Frontend Next.js
- **api**: Backend NestJS
- **db**: PostgreSQL
- **minio**: Almacenamiento S3-compatible (opcional)

---

## 🚀 CI/CD

El proyecto utiliza **Dokploy** para despliegue continuo.
