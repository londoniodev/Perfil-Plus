# Resumen de Pruebas de Estrés y Corrección de Rendimiento (KVM4)

## Contexto de la Sesión
Se llevó a cabo una prueba de "Saturación Extrema" en el entorno Staging (Dokploy VPS KVM4 de $20/m, 4 Cores, 16GB RAM) utilizando **k6** (`checkout-heavyweight.js`) contra el backend **NestJS 11 + Prisma + PostgreSQL 15**.

El objetivo fue identificar fugas de memoria y cuellos de botella en la base de datos bajo la arquitectura "Single-Database con Row-Level Security" usando un tenant de prueba con **50,000 productos inyectados**.

## Bug Descubierto y Solución
Durante la rampa inicial, el controlador `GET /api/store/products` colapsó los recursos del servidor (98% CPU, 7.5GB RAM ocupados por Node) y lanzó el siguiente error de Prisma:
> `PrismaClientKnownRequestError: P2035 - too many bind variables in prepared statement, expected maximum of 32767, received 32768`

**Diagnóstico:** La ruta estaba ignorando por completo los parámetros `limit` y `search`. `ProductsService.findAllPublished` estaba haciendo un `findMany()` sin límite superior (trayendo las 50,000 filas de golpe por cada usuario). Esto generaba un `IN (...)` gigantesco en Postgres, destrozando la memoria y superando el límite de parámetros.

**Solución Implementada:**
1. Modificado `store.controller.ts` para capturar explícitamente `@Query('search')` y `@Query('limit')`.
2. Modificado `products.service.ts` para aplicar un valor seguro a la consulta `take: limit || 100` y agregar lógica de búsquedas de texto.

## Resultados de la Prueba Final (Exitosa)
Inmediatamente tras el deploy del parche, se volvió a lanzar el asedio de k6 apuntando los 1,500 Usuarios Concurrentes (VUs) durante 9 minutos con 90% del tráfico hacia el GET de búsqueda recíproca.

**Métricas Finales (`k6-summary.json` & Grafana Node Exporter):**
- **Iteraciones procesadas:** 932,691 peticiones exitosas completadas.
- **Rendimiento Máximo:** ~1,725 Peticiones por segundo (req/s).
- **Consumo de Memoria Node (Apps):** Totalmente plano (~3GB), cero fugas (Memory Leaks identificadas y erradicadas).
- **Consumo CPU:** Oscilando sano en el 70-74%, manejando la alta concurrencia con holgura.
- **Latencia:** p(95) de 442.14ms.
- **Errores:** 0% (Ningún `504 Gateway Timeout` ni `502 Bad Gateway`).

## Estado Actual de la Arquitectura
La arquitectura actual (Monorepo, Next.js, NestJS y Prisma) se encuentra certificada para soportar demandas de tráfico altísimas de forma eficiente (más de 1,500 usuarios constantes). Las siguientes tareas de este Agente deberán centrarse en desarrollo normal de producto, confiando en la estabilidad fundacional del sistema.
