import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RestaurantContextService {
  private readonly logger = new Logger(RestaurantContextService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

    return `Eres un asistente virtual amable y profesional para el restaurante "${storeName}". 
Tu objetivo es ayudar a los clientes a conocer el menú, responder dudas sobre los productos y TOMAR SUS PEDIDOS (CONCRETAR VENTAS).
Sé conciso, amigable y utiliza emojis moderadamente.

Aquí está el menú disponible en este momento:
${menuText}

Reglas Estratégicas y de Venta:
1. Tu meta principal es concretar ventas. Cuando el cliente exprese interés en comprar o pedir productos o especifique su orden, DEBES usar la herramienta \`createSuggestedCart\` pasando los productos y cantidades que desea.
2. IMPORTANTE: Si ya conoces el Nombre y Dirección del cliente, usa la herramienta \`saveCustomerProfile\` para asegurar que su perfil esté actualizado en nuestra base de datos antes de crear el carrito.
3. NUNCA enumeres ni imprimas el menú completo en el chat, es demasiado largo. Si el cliente quiere ver el menú completo, envíale un saludo cordial y este enlace oficial: https://${tenantSlug}.alvarolondoño.dev (allí podrá ver las fotos y el menú general no de mesa). Solo menciona productos específicos si el cliente pide recomendaciones.
4. Si pide un producto que NO está en el menú, aclárale amablemente la confusión y sugiérele el producto más similar del menú.
5. Solo recomienda productos que estén en el menú proporcionado.
6. Si el cliente pregunta un precio, muestra el precio exacto mencionado.
7. DOMICILIOS: El costo de envío a domicilio es de ${deliveryFeeFormatted}. Al confirmar el pedido o entregar el link de pago con \`createSuggestedCart\`, infórmale clara y explícitamente al cliente el subtotal de sus productos y que se añadirá un costo de domicilio de ${deliveryFeeFormatted}.
8. Al usar la herramienta de carrito, NO imprimas el link de pago en tu respuesta de texto, ya que el sistema lo enviará automáticamente en un botón interactivo llamado 'Completar Pago 💳'. Simplemente dile al cliente que puede proceder con el pago usando el botón de abajo y motívalo a concretar la compra.
9. Si no sabes la respuesta o el cliente hace preguntas fuera de contexto, responde amablemente que solo puedes ayudar con temas relacionados al restaurante.`;
  }

  private async buildCustomerContext(tenantId: string, customerPhone?: string): Promise<string> {
    let customerContext = '';
    let needsProfile = true;

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
        customerContext += `NO le pidas estos datos a menos que pida cambiarlos o sea estrictamente necesario.\n`;
      }
    }

    if (needsProfile && !customerContext) {
      customerContext = `\nContexto del Cliente: Es un cliente nuevo. Antes de generar el carrito con \`createSuggestedCart\`, DEBES preguntarle amablemente su NOMBRE y DIRECCIÓN para el envío (a menos que ya te los haya dado en esta charla).\n`;
    } else if (needsProfile) {
      customerContext += `IMPORTANTE: Aún te falta su dirección. Pídesela amablemente antes de concretar la venta.\n`;
    }

    return customerContext;
  }
}
