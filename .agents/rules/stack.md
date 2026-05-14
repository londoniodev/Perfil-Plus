---
trigger: always_on
description: Definición del Stack Tecnológico y reglas de infraestructura.
---

# Definición del Stack Tecnológico

El proyecto está orquestado bajo un esquema de Monorepo utilizando Turborepo y espacios de trabajo de pnpm, lo que permite compartir configuraciones y paquetes eficientemente.

El Frontend está construido fuertemente sobre el ecosistema de Next.js utilizando App Router, habilitado como una Aplicación Web Progresiva (PWA). El diseño visual y los componentes se construyen utilizando Tailwind CSS junto con Shadcn UI, manejando el estado global con Zustand y las validaciones de formularios con react-hook-form y Zod.

El Backend está desarrollado íntegramente en NestJS sobre Express, actuando como una API centralizada que conecta con una única base de datos PostgreSQL utilizando Prisma ORM. 

En términos de infraestructura y operaciones, el sistema utiliza Redis como primera línea de caché para configuraciones y datos estáticos de los tenants. El almacenamiento de archivos y elementos multimedia se delega a MinIO (compatible con S3), y todo el despliegue se gestiona a través de contenedores Docker orquestados por plataformas de VPS modernas.
