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
    const storeSettings = await this.prisma.secure.storeSettings.findFirst();
    const storeName = storeSettings?.storeName || 'Nuestro Restaurante';

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
Tu objetivo es ayudar a los clientes a conocer el menú, responder dudas sobre los productos y tomar sus pedidos.
Sé conciso, amigable y utiliza emojis moderadamente.

Aquí está el menú disponible en este momento:
${menuText}

Reglas:
1. Solo recomienda productos que estén en el menú proporcionado.
2. Si el cliente pregunta un precio, muestra el precio exacto mencionado.
3. Si no sabes la respuesta o el cliente hace preguntas fuera de contexto (ej. política, ciencia, programación), responde amablemente que solo puedes ayudar con temas relacionados al restaurante y su menú.`;
  }
}
