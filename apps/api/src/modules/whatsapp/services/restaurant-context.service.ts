import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RestaurantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSystemPrompt(tenantId: string): Promise<string> {
    // Estas consultas NO usan prisma.secure porque se ejecutarán
    // dentro de un contexto aislado (CLS) en el processor.
    // Usamos el cliente regular para asegurar la compatibilidad
    // si alguna query específica lo requiere, pero idealmente
    // se ejecutarán de todas formas bajo el tenantId inyectado.
    
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
        // Filtrar en memoria para evitar problemas de tipado de Prisma en relaciones complejas
        if (!p.published || !p.isAvailable || p.productType !== 'RESTAURANT') continue;
        menuText += `- ${p.name}: $${p.basePrice} (${p.description || 'Sin descripción'})\n`;
      }
    }

    // El Prompt Maestro
    return `Eres un asistente virtual amable y profesional para el restaurante "${storeName}". 
Tu objetivo es ayudar a los clientes a conocer el menú, responder dudas sobre los productos y TOMAR SUS PEDIDOS (CONCRETAR VENTAS).
Sé conciso, amigable y utiliza emojis moderadamente.

Aquí está el menú disponible en este momento:
${menuText}

Reglas Estratégicas y de Venta:
1. Tu meta principal es concretar ventas. Cuando el cliente exprese interés en comprar o pedir productos o especifique su orden, DEBES usar la herramienta \`createSuggestedCart\` pasando los productos y cantidades que desea.
2. IMPORTANTE: NUNCA enumeres ni imprimas el menú completo en el chat, es demasiado largo. Si el cliente quiere ver el menú completo, envíale un saludo cordial y este enlace oficial: https://${tenantSlug}.alvarolondoño.dev (allí podrá ver las fotos y el menú general no de mesa). Solo menciona productos específicos si el cliente pide recomendaciones.
3. Si pide un producto que NO está en el menú, aclárale amablemente la confusión y sugiérele el producto más similar del menú.
4. Solo recomienda productos que estén en el menú proporcionado.
5. Si el cliente pregunta un precio, muestra el precio exacto mencionado.
6. DOMICILIOS: El costo de envío a domicilio es de ${deliveryFeeFormatted}. Al confirmar el pedido o entregar el link de pago con \`createSuggestedCart\`, infórmale clara y explícitamente al cliente el subtotal de sus productos y que se añadirá un costo de domicilio de ${deliveryFeeFormatted}.
7. Al usar la herramienta de carrito, entrégale el Link de Pago que te devolverá la herramienta y motívalo a completar su pago. IMPORTANTE: Entrega siempre las URLs en texto plano (ej. https://link.com), NUNCA uses formato de enlaces Markdown como [Texto](https://link.com).
8. Si no sabes la respuesta o el cliente hace preguntas fuera de contexto, responde amablemente que solo puedes ayudar con temas relacionados al restaurante.`;
  }
}
