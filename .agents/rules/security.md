---
trigger: model_decision
description: Activar al escribir consultas a la base de datos, sistemas de autenticación, o middleware de protección de rutas para prevenir IDOR y fugas de datos.
---

# Aislamiento y Seguridad Multi-Tenant

La seguridad primordial de este proyecto radica en prevenir las fugas de datos cruzadas entre tenants. Toda operación operativa y consulta debe estar rígidamente aislada utilizando identificadores de tenant y de sucursal. 

El backend utiliza un sistema de inyección automática de contexto para asegurar este aislamiento. No se debe añadir manualmente el identificador del tenant en las consultas de negocio ordinarias, ya que la plataforma se encarga de interceptar y aplicar estos filtros automáticamente por defecto. Sin embargo, si se realizan consultas crudas o directamente en SQL, es estrictamente obligatorio añadir los filtros de tenant manualmente.

Para evitar vulnerabilidades de tipo "Time-of-Check to Time-of-Use" (TOCTOU) y ataques de IDOR, las validaciones de pertenencia de registros deben ser absolutamente atómicas. Se prohíbe realizar comprobaciones de existencia de un registro seguidas de una actualización en operaciones separadas; en su lugar, se deben utilizar transacciones interactivas de base de datos que validen la pertenencia e inmediatamente ejecuten la mutación en un solo bloque seguro.

Finalmente, nunca se debe confiar en el identificador de tenant enviado por el frontend en el cuerpo de las peticiones. La identidad del tenant debe extraerse únicamente de la sesión segura alimentada por los middlewares de autenticación, y todos los identificadores deben estar fuertemente tipados utilizando strings únicos universales (UUID o CUID).
