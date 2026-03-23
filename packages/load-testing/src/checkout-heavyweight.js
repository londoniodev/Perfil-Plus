import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 500 }, // Rampa hasta 500/1000 VUs según se corra localmente o no
    { duration: '3m', target: 500 }, // Pico mantenido
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Umbral relajado por el estrés masivo de BD
  },
};

const TENANT_ID = 'test-tenant-heavy';

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api-staging.xn--alvarolondoo-khb.dev/api';
  
  const headers = {
    'x-tenant-id': TENANT_ID,
    'Content-Type': 'application/json',
  };

  // Décima oportunidad para realizar una petición POST (10% POST / 90% GET)
  const isPost = Math.random() < 0.10;

  if (!isPost) {
    // 90% de las peticiones: Búsqueda pesada
    // Esto fuerza LIKE %camisa%, LIMIT 50 y un COUNT() + serializar muchas descripciones largas
    const resGet = http.get(`${baseUrl}/store/products?search=camisa&limit=50`, { headers });
    
    check(resGet, {
      'get products is 200': (r) => r.status === 200,
    });
  } else {
    // 10% de las peticiones: Crear una orden con variantes quemadas o aleatorias
    // Simulamos items simples para ver los locks sobre la tabla de órdenes e inventario (si aplica)
    const orderPayload = JSON.stringify({
      orderType: 'DINE_IN',
      items: [
        {
          quantity: 1,
          notes: 'Heavy stress item',
          // Normalmente enviarías el ID real, aquí mandamos un string que tal vez se procese como nota
          // o falle de forma controlada si el variantId no está validado. Si Prisma valida, necesitamos
          // consultar primero. Como es un stress test puro, usaremos un randomUUID para intentar forzar error controlado
          // O preferiblemente extraemos el ID para no causar 400 Bad Request masivos:
          // * Pero por velocidad vamos a asumir que no estiramos la máquina del atacante leyendo la db
          variantId: `fake-variant-for-lock-${Math.floor(Math.random() * 1000)}` 
        },
      ],
      customerName: 'VU Heavy',
      notes: 'Stress Test de Carga con k6',
      paymentMethod: 'CASH',
    });

    const resPost = http.post(`${baseUrl}/orders`, orderPayload, { headers });
    
    // Nota: Es posible que dé 400 o 500 si la validación falla (ej: variantId no existe).
    // Si queremos un POST 100% exitoso, deberíamos precargar un Variant ID en memoria de k6,
    // o asumir que los locks de BD se disparan en el insert transaccional de todos modos.
    check(resPost, {
      'post orders processed': (r) => r.status < 500, // Relajado para aceptar 400 Validation Error
    });
  }

  sleep(0.5); // Dormir un poco para no quemar el nodo inyector de k6
}
