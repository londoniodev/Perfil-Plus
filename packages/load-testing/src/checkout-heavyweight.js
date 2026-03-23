import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '3m', target: 1500 }, // Rampa agresiva hasta 1500 VUs
    { duration: '5m', target: 1500 }, // Meseta de tortura mantenida
    { duration: '1m', target: 0 },    // Rampa de bajada
  ],
  thresholds: {
    // Objetivo principal: Identificar en qué punto P95 supera 2s
    http_req_duration: ['p(95)<2000'],
  },
};

const TENANT_ID = 'test-tenant-heavy';
const SEARCH_TERMS = ['camisa', 'pantalón', 'chaqueta', 'generico', 'heavy'];

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
    // Variamos el término para que PostgreSQL no devuelva los resultados directo de la caché de buffers
    const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const resGet = http.get(`${baseUrl}/store/products?search=${randomTerm}&limit=100`, { headers });
    
    check(resGet, {
      'get products is 200': (r) => r.status === 200,
    });
  } else {
    // 10% de las peticiones: Crear una orden con JSON complejo
    // Generamos 5 items mínimo para estresar profundamente el ValidationPipe de NestJS y transacciones Prisma
    const orderItems = [];
    for (let i = 0; i < 5; i++) {
        orderItems.push({
          quantity: Math.floor(Math.random() * 3) + 1,
          notes: `Item complex note ${i} from VU ${__VU}`,
          // Mandamos un ID random; aunque el backend lance un error 400 por validación, la carga de
          // parseo JSON y validación DTO se realizará, quemando CPU del KVM4
          variantId: `fake-variant-lock-${Math.floor(Math.random() * 100000)}` 
        });
    }

    const orderPayload = JSON.stringify({
      orderType: 'DINE_IN',
      items: orderItems,
      customerName: `VU Extreme ${__VU}`,
      notes: 'Stress Test de Saturacion Extrema KVM4',
      paymentMethod: 'CASH',
      // Agregamos data ruidosa para alargar el parseo JSON
      metadata: { source: 'k6_stress', timestamp: new Date().toISOString() },
      clientAddress: 'Avenida Falsa 1234, Extensión 90'
    });

    const resPost = http.post(`${baseUrl}/orders`, orderPayload, { headers });
    
    // Asumimos que procesa hasta el controlador, incluso si lanza fallo de validación 400 por id falso
    check(resPost, {
      'post orders processed (status < 500)': (r) => r.status < 500,
    });
  }

  sleep(0.5); // Dormir un poco para no quemar el nodo inyector de k6
}
