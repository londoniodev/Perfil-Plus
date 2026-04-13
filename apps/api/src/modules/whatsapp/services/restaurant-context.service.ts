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
  ) {}

  /**
   * Retorna el catálogo completo de productos activos del tenant,
   * filtrado por BranchProduct si se proporciona branchId.
   * Cacheado en Redis. Usado por OpenAiProvider para búsqueda fuzzy con fuse.js.
   */
  async getProductCatalog(tenantId: string, branchId?: string): Promise<CatalogProduct[]> {
    const cacheKey = branchId
      ? `tenant:${tenantId}:branch:${branchId}:product_catalog`
      : `tenant:${tenantId}:product_catalog`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        this.logger.warn(
          `[Tenant: ${tenantId}] Catálogo corrupto en cache, regenerando...`,
        );
      }
    }

    this.logger.log(
      `[Tenant: ${tenantId}] Cache miss para catálogo de productos. Fetching DB...`,
    );

    // Si tenemos branchId, filtramos via BranchProduct (disponibilidad + price override)
    if (branchId) {
      const branchProducts = await (this.prisma as any).branchProduct.findMany({
        where: {
          branchId,
          isAvailable: true,
          product: {
            productType: 'RESTAURANT',
            published: true,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              description: true,
              images: true,
              variants: { select: { id: true }, take: 1 },
            },
          },
        },
      });

      const catalog: CatalogProduct[] = branchProducts.map((bp: any) => ({
        id: bp.product.id,
        name: bp.product.name,
        basePrice: bp.priceOverride !== null ? Number(bp.priceOverride) : Number(bp.product.basePrice),
        description: bp.product.description || null,
        variantId: bp.product.variants[0]?.id || bp.product.id,
        images: bp.product.images || [],
      }));

      await this.cacheManager.set(cacheKey, JSON.stringify(catalog), 2592000000);
      this.logger.log(
        `[Tenant: ${tenantId}] Catálogo de ${catalog.length} productos (branch: ${branchId}) cacheado.`,
      );
      return catalog;
    }

    // Fallback: catálogo sin filtro de branch (legacy)
    const products = await this.prisma.product.findMany({
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

    const catalog: CatalogProduct[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: Number(p.basePrice),
      description: p.description || null,
      variantId: p.variants[0]?.id || p.id,
      images: p.images || [],
    }));

    // Cache por 30 días (mismo TTL que el system prompt)
    await this.cacheManager.set(cacheKey, JSON.stringify(catalog), 2592000000);
    this.logger.log(
      `[Tenant: ${tenantId}] Catálogo de ${catalog.length} productos cacheado.`,
    );

    return catalog;
  }

  async buildSystemPrompt(
    tenantId: string,
    customerPhone?: string,
  ): Promise<string> {
    const cacheKey = `tenant:${tenantId}:menu_context`;

    // Intentar obtener del cache
    let menuContext = await this.cacheManager.get<string>(cacheKey);

    if (!menuContext) {
      this.logger.log(
        `[Tenant: ${tenantId}] Cache miss para menú. Construyendo prompt...`,
      );
      menuContext = await this.generateMenuContext(tenantId);

      // Guardar en cache por 30 días (2592000000 ms)
      await this.cacheManager.set(cacheKey, menuContext, 2592000000);
      this.logger.log(
        `[Tenant: ${tenantId}] Menú cacheado en Redis por 30 días.`,
      );
    }

    // El contexto dinámico del cliente NO se cachea porque cambia por usuario/conversación
    const customerContext = await this.buildCustomerContext(
      tenantId,
      customerPhone,
    );

    return `${menuContext}\n${customerContext}`;
  }

  private async generateMenuContext(tenantId: string): Promise<string> {
    // Obtener TenantSettings (config global: nombre del restaurante)
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      include: { tenant: { select: { slug: true } } },
    });
    const storeName = tenantSettings?.storeName || 'Nuestro Restaurante';
    const tenantSlug = (tenantSettings as any)?.tenant?.slug || 'demo';

    // Obtener BranchSettings de la sucursal default (delivery fee operativo)
    const defaultBranch = await this.prisma.branch.findFirst({
      where: { tenantId, isDefault: true },
      select: { id: true },
    });
    let deliveryFee = 0;
    if (defaultBranch) {
      const branchSettings = await this.prisma.branchSettings.findUnique({
        where: { branchId: defaultBranch.id },
        select: { deliveryFee: true },
      });
      deliveryFee = Number(branchSettings?.deliveryFee || 0);
    }
    const deliveryFeeFormatted = deliveryFee > 0 ? `$${deliveryFee}` : 'Gratis';

    // Obtener menú (Categorías y Productos Activos)
    const categories = await this.prisma.category.findMany({
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
        if (!p.published || !p.isAvailable || p.productType !== 'RESTAURANT')
          continue;
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
- NUNCA enumeres ni imprimas el menú completo en el chat, es demasiado largo. Si el cliente quiere ver todo, envíale el enlace oficial al menú usando la herramienta o proporciónale: https://${tenantSlug}.${process.env.BASE_DOMAIN || 'perfil.plus'}/menu

4. ENVÍO DE FOTOS (\`sendProductPhotos\`):
- Si el cliente pide ver fotos, imágenes o cómo se ven los productos, usa \`sendProductPhotos\` con los nombres de los productos.
- Las fotos se enviarán automáticamente como mensajes separados debajo de tu respuesta.

5. ESCALACIÓN A HUMANO (\`escalateToHuman\`):
- Si el cliente pide EXPLÍCITAMENTE hablar con una persona, un humano, un agente, o muestra frustración/enojo extremo repetido, usa \`escalateToHuman\`.
- NUNCA escales por tu cuenta. Solo cuando el cliente lo pida o la situación sea claramente insostenible.
- Después de escalar, despídete amablemente indicando que un humano le atenderá pronto.

6. ENLACE AL MENÚ COMPLETO:
- Si el cliente quiere ver el menú completo online, comparte este enlace: https://${tenantSlug}.${process.env.BASE_DOMAIN || 'perfil.plus'}/menu
- NUNCA imprimas el menú completo en el chat, es demasiado largo.

7. LÍMITES DEL SISTEMA:
- Si no sabes la respuesta o el cliente hace preguntas fuera de contexto, responde amablemente que solo puedes ayudar con temas relacionados al restaurante.`;
  }

  private async buildCustomerContext(
    tenantId: string,
    customerPhone?: string,
  ): Promise<string> {
    let customerContext = '';
    let needsProfile = true;
    let needsGps = true; // Rastrear si falta ubicación GPS

    if (customerPhone) {
      const customer = await this.prisma.waCustomer.findUnique({
        where: { tenantId_phone: { tenantId, phone: customerPhone } },
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
