import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del Test
export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de las peticiones en < 500ms
    http_req_failed: ['rate<0.01'],   // Tasa de error < 1%
  },
};

// Array de tenants disponibles (Usa IDs reales de la DB para garantizar funcionamiento)
const TENANTS = [
  'cm7mman6x000208jsf3h9h2k1', // soydeborasoysaludable
  'cm7mm6m7p000108js6k7p98w2', // cocinasiete
  'cm7mm52c4000008jsh45x2b9q', // mauromera
  'cm7mmb7z9000308jsg9j1k4l2', // daniela-botina
  'cm7ficticio_tenant_para_prueba', // Ficticio completar array de 5
];

export default function () {
  const baseUrl = __ENV.API_URL;
  if (!baseUrl) {
    throw new Error('API_URL no definida. Usa: k6 run -e API_URL=http://... src/checkout-smoke.js');
  }

  // 1. Elegir tenant aleatorio
  const tenantId = TENANTS[Math.floor(Math.random() * TENANTS.length)];

  const headers = {
    'x-tenant-id': tenantId,
    'Content-Type': 'application/json',
  };

  // 2. Obtener productos de forma dinámica
  const resProducts = http.get(`${baseUrl}/store/products?allVariants=true`, { headers });

  // Validar respuesta de productos
  const productsOk = check(resProducts, {
    'get products status is 200': (r) => r.status === 200,
  });

  if (!productsOk) {
    sleep(1);
    return;
  }

  const products = resProducts.json();

  if (!products || products.length === 0) {
    // El tenant no tiene productos publicados, saltar iteración o simular error
    sleep(1);
    return;
  }

  // 3. Seleccionar producto y variante aleatoria
  const randomProduct = products[Math.floor(Math.random() * products.length)];
  const variants = randomProduct.variants;

  if (!variants || variants.length === 0) {
    sleep(1);
    return;
  }

  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  const variantId = randomVariant.id;

  // 4. Crear Orden (POST /orders)
  const orderPayload = JSON.stringify({
    orderType: 'DINE_IN',
    items: [
      {
        variantId: variantId,
        quantity: 1,
        notes: 'k6 Smoke Test Item',
      },
    ],
    customerName: 'VU k6 Test User',
    notes: 'Smoke Test de Carga con k6',
    paymentMethod: 'CASH', // Ajustar según lógica de negocio si aplica
  });

  const resOrder = http.post(`${baseUrl}/orders`, orderPayload, { headers });

  // 5. Validaciones
  check(resOrder, {
    'create order status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  // Pequeña pausa entre iteraciones
  sleep(1);
}
