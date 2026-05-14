---
trigger: model_decision
description: Activar al diseñar arquitecturas, endpoints de alto tráfico o cuando se pregunte sobre cómo escalar la plataforma SaaS para manejar múltiples tenants.
---

# Escalabilidad y Arquitectura de Alta Disponibilidad

Para soportar el crecimiento del modelo SaaS y evitar agotar los límites de conexión de la base de datos centralizada, la gestión de conexiones es primordial. El cliente de base de datos debe ser instanciado como un único Singleton global (Connection Pooling). A medida que aumenta el tráfico, esta arquitectura requiere la implementación de un agrupador de conexiones, como PgBouncer, a nivel de infraestructura para multiplexar eficientemente las transacciones.

La plataforma soporta operaciones en tiempo real críticas, como sistemas de visualización para cocinas (KDS) y puntos de venta (POS). Esta dinámica bidireccional entre frontend y backend debe canalizarse mediante eventos enviados por el servidor (SSE) o WebSockets. Es imperativo que las salas de transmisión de eventos estén estrictamente segregadas utilizando el identificador del tenant para asegurar que un comercio nunca reciba las notificaciones operativas o pings de otro comercio ajeno.

El rendimiento se maximiza a través de una estrategia de almacenamiento en caché multinivel que reduce drásticamente la carga hacia el backend. A nivel del perímetro (Edge), el frontend utiliza regeneración estática incremental (ISR) para páginas públicas que rara vez cambian, como blogs o portafolios. En un segundo nivel, el backend almacena configuraciones estáticas compartidas de cada tenant (como menús del día y configuraciones de marca) en una caché de Redis de alta velocidad, la cual se invalida selectivamente solo cuando ocurren actualizaciones administrativas críticas.

Por último, para garantizar la disponibilidad general, la plataforma emplea limitación de tasa (Rate Limiting) enfocada en el inquilino en lugar de limitarse a la dirección IP. Si un inquilino específico recibe un pico de tráfico anómalo o un ataque, sus límites de estrangulamiento deben aplicarse aisladamente, asegurando que el rendimiento del resto del ecosistema SaaS permanezca inalterado.
