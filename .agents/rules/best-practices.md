---
trigger: model_decision
description: Buenas prácticas de desarrollo, convenciones de nombres, diseño de formularios y gestión del WhatsApp Bot.
---

# Buenas Prácticas de Desarrollo y Ecosistema

Es fundamental seguir el principio de No Repetirse (DRY). Está estrictamente prohibido duplicar esquemas de datos, tipos o componentes. Cualquier elemento compartido entre frontend y backend debe residir en su paquete correspondiente del monorepo.

La construcción de formularios debe seguir un enfoque de "Esquema Primero" (Schema-First). Nunca se debe manejar el estado de las entradas individuales manualmente; todo el flujo debe dictarse por la validación del esquema de Zod, infiriendo los tipos y conectándolos con los controladores del formulario. El código debe mantenerse limpio utilizando "camelCase" para variables y funciones, y "PascalCase" para la declaración de componentes.

En la gestión de integraciones externas, como bots de mensajería (WhatsApp/Meta), se requiere un control estricto del tráfico para evitar bloqueos por sobrecarga (Rate Limiting). Los envíos masivos deben fraccionarse en lotes controlados. Para interacciones con audios e inteligencia artificial, se exige el formateo estricto a tipos de archivo soportados nativamente por las APIs y el uso de constructores de formularios (FormData).

Finalmente, los historiales de conversación delegados a modelos de lenguaje deben mantener una ventana deslizante estricta (Sliding Window), limitando el contexto a los mensajes más recientes para optimizar el consumo de tokens y asegurar la relevancia de las respuestas.
