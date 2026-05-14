---
trigger: model_decision
description: Reglas fundamentales sobre la lógica de negocio, aislamiento del backend en NestJS y gestión de almacenamiento.
---

# Reglas de Backend y Dinámica con Frontend

El núcleo del backend está construido sobre NestJS y actúa como el cerebro centralizado para todos los inquilinos (Tenants). La comunicación entre el frontend y el backend depende estrictamente de la inyección de cabeceras de identificación (como `x-tenant-id`), lo que permite que una sola API sirva a múltiples instancias de forma completamente agnóstica.

El aislamiento a nivel de base de datos es la directiva más crítica. Se prohíbe el uso de instancias de Prisma estándar sin envoltorio; en su lugar, todo el acceso a datos debe realizarse a través de un cliente seguro extendido que inyecta automáticamente el contexto del tenant en las cláusulas de consulta y mutación. Las únicas excepciones a esta regla son los modelos estructurales globales del sistema, los cuales están explícitamente autorizados para ignorar el filtro de tenant.

En cuanto al modelado de negocio, la base de datos debe permanecer unificada y genérica. Se prohíbe estrictamente la creación de tablas específicas por vertical (como 'Libro' o 'Camiseta'). Cualquier artículo comercializable debe registrarse bajo el modelo universal 'Product' utilizando enumeraciones para definir su naturaleza, y el inventario debe fluir a través de un esquema avanzado de almacenes y recetas compartidas.

Para la gestión de archivos privados y multimedia, el backend interactúa con depósitos (buckets) en MinIO. Para proteger la propiedad intelectual y los archivos de los tenants, nunca se deben exponer las URLs públicas de estos depósitos. El frontend debe solicitar y utilizar URLs firmadas temporalmente para acceder o descargar entregables, asegurando que los recursos solo sean accesibles por usuarios autenticados y autorizados. Las políticas de intercambio de recursos cruzados (CORS) son dinámicas y responden exclusivamente a los dominios permitidos registrados por cada tenant.
