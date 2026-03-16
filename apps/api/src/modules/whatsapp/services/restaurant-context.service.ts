import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CatalogProduct {
  id: string;
  name: string;
  basePrice: number;
  description: string | null;
  variantId: string;
  images: string[];
}

@Injectable()
export class RestaurantContextService {
  private readonly logger = new Logger(RestaurantContextService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * Retorna el catálogo completo de productos activos del tenant,
   * cacheado en Redis. Usado por OpenAiProvider para búsqueda fuzzy con fuse.js.
   */
  async getProductCatalog(tenantId: string): Promise<CatalogProduct[]> {
    const cacheKey = `tenant:${tenantId}:product_catalog`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        this.logger.warn(`[Tenant: ${tenantId}] Catálogo corrupto en cache, regenerando...`);
      }
    }

    this.logger.log(`[Tenant: ${tenantId}] Cache miss para catálogo de productos. Fetching DB...`);

    const products = await (this.prisma.secure as any).product.findMany({
      where: {
        productType: 'RESTAURANT',
        published: true,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        description: true,
        images: true,
        variants: { select: { id: true }, take: 1 },
      },
    });

    const catalog: CatalogProduct[] = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      basePrice: Number(p.basePrice),
      description: p.description || null,
      variantId: p.variants[0]?.id || p.id,
      images: p.images || [],
    }));

    // Cache por 30 días (mismo TTL que el system prompt)
    await this.cacheManager.set(cacheKey, JSON.stringify(catalog), 2592000000);
    this.logger.log(`[Tenant: ${tenantId}] Catálogo de ${catalog.length} productos cacheado.`);

    return catalog;
  }

  async buildSystemPrompt(tenantId: string, customerPhone?: string): Promise<string> {
    const cacheKey = `tenant:${tenantId}:menu_context`;

    // Intentar obtener del cache
    let menuContext = await this.cacheManager.get<string>(cacheKey);

    if (!menuContext) {
      this.logger.log(`[Tenant: ${tenantId}] Cache miss para menú. Construyendo prompt...`);
      menuContext = await this.generateMenuContext(tenantId);

      // Guardar en cache por 30 días (2592000000 ms)
      await this.cacheManager.set(cacheKey, menuContext, 2592000000);
      this.logger.log(`[Tenant: ${tenantId}] Menú cacheado en Redis por 30 días.`);
    }

    // El contexto dinámico del cliente NO se cachea porque cambia por usuario/conversación
    const customerContext = await this.buildCustomerContext(tenantId, customerPhone);

    return `${menuContext}\n${customerContext}`;
  }

  private async generateMenuContext(tenantId: string): Promise<string> {
    // Obtener configuración del restaurante
    const storeSettings = await (this.prisma.secure as any).storeSettings.findFirst({
      include: { tenant: { select: { slug: true } } }
    });
    const storeName = storeSettings?.storeName || 'Nuestro Restaurante';
    const tenantSlug = storeSettings?.tenant?.slug || 'demo';
    const deliveryFee = Number(storeSettings?.deliveryFee || 0);
    const deliveryFeeFormatted = deliveryFee > 0 ? `$${deliveryFee}` : 'Gratis';

    // Obtener menú (Categorías y Productos Activos)
    const categories = await this.prisma.secure.category.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    let menuText = `=== MENÚ ===\n`;
    for (const cat of categories as any[]) {
      if (cat.products?.length === 0) continue;

      menuText += `\n[CATEGORÍA: ${cat.name}]\n`;
      for (const catProd of cat.products) {
        if (!catProd.product) continue;
        const p = catProd.product;
        if (!p.published || !p.isAvailable || p.productType !== 'RESTAURANT') continue;
        menuText += `- ${p.name}: $${p.basePrice} (${p.description || 'Sin descripción'})\n`;
      }
    }

    return `ROL Y PERSONALIDAD:
Eres un asistente virtual de ventas altamente eficiente, amable y profesional para el restaurante "${storeName}". 
Tu objetivo absoluto es atender dudas, tomar pedidos de forma natural y CONCRETAR VENTAS.
Tono: Conciso, conversacional, amigable (usa 1 o 2 emojis por mensaje). NUNCA suenes como un robot leyendo un manual.

=== CATÁLOGO DE PRODUCTOS ===
${menuText}

=== MANUAL DE OPERACIONES Y HERRAMIENTAS (REGLAS ESTRICTAS) ===

1. FLUJO DE VENTAS Y CARRITO (\`createSuggestedCart\`):
- Cuando el cliente confirme qué desea pedir (ej. "dame 2 hamburguesas"), DEBES invocar la herramienta \`createSuggestedCart\` INMEDIATAMENTE pasando los productos y cantidades.
- PROHIBIDO SIMULAR ESPERAS: NUNCA uses frases de relleno como "Un momento", "Procesando", "Voy a generar tu carrito" o "Dame un segundo". Las herramientas se ejecutan en milisegundos. Tu respuesta de texto debe ser directamente la confirmación rápida del pedido.
- PRECIOS Y MATEMÁTICAS: SÍ puedes informar el precio individual de un producto si el cliente lo pregunta directamente (ej. 'La hamburguesa cuesta $15,000'). SIN EMBARGO, está ESTRICTAMENTE PROHIBIDO sumar, calcular subtotales o dar el total final de un pedido. Si el cliente pide su cuenta o confirma el pedido, limítate a confirmar los productos amablemente; el sistema backend adjuntará automáticamente el recibo con el total matemático exacto debajo de tu mensaje.
- Si pide un producto que NO está en el menú, aclárale amablemente la confusión y sugiérele el producto más similar del catálogo.
- NUNCA incluyas links de pago en tu texto. El botón de pago ('Completar Pago 💳') aparecerá mágicamente debajo de tu mensaje gracias al sistema. Solo invita al cliente a hacer clic en el botón de abajo.

2. GESTIÓN DE CLIENTES (\`saveCustomerProfile\`):
- Si durante la conversación el cliente menciona su nombre o dirección, invoca \`saveCustomerProfile\` de forma silenciosa para asegurar que su perfil esté actualizado.
- Si el cliente quiere confirmar su orden pero el "Contexto del Cliente" indica que faltan sus datos, pídeselos natural y amablemente en un solo mensaje antes de cerrar la venta.

3. REGLAS DE NEGOCIO Y PRECIOS:
- Costo de Domicilio: ${deliveryFeeFormatted}. Al resumir el pedido antes del pago, menciona el subtotal y recuérdale explícitamente el costo de envío.
- Respeta estrictamente los precios del catálogo. Muestra el precio exacto mencionado.
- NUNCA enumeres ni imprimas el menú completo en el chat, es demasiado largo. Si el cliente quiere ver todo, envíale este enlace oficial: https://${tenantSlug}.alvarolondoño.dev

4. LÍMITES DEL SISTEMA:
- Si no sabes la respuesta o el cliente hace preguntas fuera de contexto, responde amablemente que solo puedes ayudar con temas relacionados al restaurante.`;
  }

  private async buildCustomerContext(tenantId: string, customerPhone?: string): Promise<string> {
    let customerContext = '';
    let needsProfile = true;
    let needsGps = true; // Rastrear si falta ubicación GPS

    if (customerPhone) {
      const customer = await (this.prisma.secure as any).waCustomer.findUnique({
        where: { tenantId_phone: { tenantId, phone: customerPhone } }
      });
      if (customer) {
        customerContext = `\nContexto del Cliente: Hablas con ${customer.name || 'un cliente'}. `;
        if (customer.address) {
          customerContext += `Su dirección registrada es: ${customer.address}. `;
          needsProfile = false;
        } else {
          customerContext += `NO tienes su dirección registrada. `;
        }

        // Verificar si ya tiene coordenadas GPS
        if (customer.lat && customer.lng) {
          needsGps = false;
        }

        customerContext += `NO le pidas estos datos a menos que pida cambiarlos o sea estrictamente necesario.\n`;
      }
    }

    if (needsProfile && !customerContext) {
      customerContext = `\nContexto del Cliente: Es un cliente nuevo. Antes de generar el carrito con \`createSuggestedCart\`, DEBES preguntarle amablemente su NOMBRE y DIRECCIÓN para el envío (a menos que ya te los haya dado en esta charla).\n`;
    } else if (needsProfile) {
      customerContext += `IMPORTANTE: Aún te falta su dirección. Pídesela amablemente antes de concretar la venta.\n`;
    }

    // Instrucción OPCIONAL de GPS: solo si no tenemos coordenadas.
    // Se inyecta siempre pero la IA solo la usa al entregar el link de pago.
    if (needsGps) {
      customerContext += `\nSUGERENCIA GPS (OPCIONAL, NO BLOQUEA LA VENTA): Cuando entregues el link de pago (después de crear el carrito), añade al final de tu mensaje algo como: "📍 Tip: Si quieres que el repartidor te encuentre más fácil, puedes compartir tu ubicación actual por WhatsApp (toca el 📎 o el + y selecciona 'Ubicación'). ¡Es totalmente opcional!" — NUNCA pidas la ubicación ANTES de confirmar el pedido ni la hagas parecer obligatoria.\n`;
    }

    return customerContext;
  }
}