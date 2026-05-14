---
trigger: always_on
description: Reglas fundamentales sobre la estructura Multi-Tenant, Monorepo y arquitectura del proyecto Perfil Plus.
---

# Arquitectura y Estructura del Proyecto

La arquitectura principal de este proyecto es SaaS Multi-Tenant utilizando una estrategia de base de datos única (Single-Database). La separación de datos entre diferentes inquilinos se realiza lógicamente mediante seguridad a nivel de fila (Row-Level Security), donde cada registro pertenece a un tenant específico.

Es vital mantener el principio de Única Fuente de Verdad. El esquema de base de datos vive exclusivamente en el paquete compartido de base de datos, y bajo ninguna circunstancia debe duplicarse en el backend. Además, el proyecto sigue una arquitectura limpia (Clean Architecture), separando drásticamente la interfaz de usuario, la lógica de negocio a través de SDKs y el acceso a datos.

El flujo de enrutamiento actúa como un proxy inteligente. Cuando un usuario accede a la plataforma, un middleware intercepta la petición, verifica al tenant usando caché, y redirige el tráfico de forma transparente hacia la aplicación del panel SaaS, inyectando cabeceras esenciales de identificación de tenant para que el backend pueda procesarlas. Físicamente, el monorepo se divide en aplicaciones (`apps/`), un backend en NestJS que atiende a todos los tenants y una plataforma administrativa superior. 

Es OBLIGATORIO respetar la división estricta de directorios:
- **`packages/`**: Exclusivo para librerías compartidas (ej. `ui`, `features`, `database`). Nunca alojar scripts ejecutables aquí.
- **`tooling/`**: Exclusivo para herramientas CLI independientes, scripts de operaciones y testing (`landing-builder`, `load-testing`).
