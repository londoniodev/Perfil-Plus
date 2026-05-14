---
trigger: model_decision
description: Optimización de velocidad, escalabilidad de base de datos, concurrencia y prevención de deadlocks.
---

# Reglas de Performance y Optimización

El rendimiento de la base de datos es crítico en esta arquitectura compartida. Para evitar escaneos completos de tablas, es mandatorio que cualquier tabla transaccional posea índices compuestos que comiencen con el identificador del tenant. 

Para prevenir "Deadlocks" o bloqueos mutuos de la base de datos al realizar actualizaciones masivas de inventario o modificaciones de múltiples filas, es una regla obligatoria ordenar alfanuméricamente los identificadores de los registros antes de ejecutar las operaciones concurrentes. Esto garantiza que la base de datos reciba los bloqueos de fila siempre en el mismo orden matemático.

En cuanto al manejo de asincronismo y la red, se debe erradicar el problema de N+1 reemplazando bucles secuenciales por ejecuciones concurrentes. Se debe diferenciar entre transacciones de base de datos, donde el fallo de una operación debe revertir el resto, y las llamadas a redes externas, que deben ser tolerantes a fallos individuales sin colapsar el proceso completo. Además, las llamadas a servicios externos de terceros jamás deben bloquear una transacción de base de datos; deben ejecutarse de forma asíncrona ("Fire-and-Forget") para no agotar el Event Loop.

A nivel de frontend, se requiere el uso extensivo de carga diferida (Lazy Loading) para componentes pesados y la implementación de cachés en el middleware de enrutamiento para no sobrecargar los servidores con peticiones de identificación repetitivas.
