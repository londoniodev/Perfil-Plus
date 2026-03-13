import { Injectable, Logger } from '@nestjs/common';
import { AiProvider } from './ai-provider.interface';
import { OpenAI } from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    tenantId: string,
    systemContext: string,
    history: { role: 'USER' | 'ASSISTANT'; content: string }[],
    userMessage: string,
    customerPhone?: string,
    tenantSlug?: string,
  ): Promise<string> {
    try {
      const messages: any[] = [
        { role: 'system', content: systemContext },
        ...history.map((msg) => ({
          role: msg.role === 'USER' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const tools: any[] = [
        {
          type: 'function',
          function: {
            name: 'getLatestOrderStatus',
            description: 'Obtiene el estado, el total a pagar y la hora de última actualización de la última orden (pedido) que ha hecho el cliente. Usa esta herramienta UNICAMENTE cuando el cliente pregunte por el estado de un pedido o por su cuenta.',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'createSuggestedCart',
            description: 'Crea un carrito de compras con los productos solicitados y genera el link de pago. IMPORTANTE: Usa esta herramienta SIEMPRE que el cliente decida pedir ciertos productos.',
            parameters: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  description: 'Lista de productos que el cliente quiere pedir',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Nombre exacto del producto tal como figura en el menú' },
                      quantity: { type: 'integer', description: 'Cantidad solicitada de este producto' }
                    },
                    required: ['name', 'quantity']
                  }
                }
              },
              required: ['items'],
            },
          },
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 400, // Ajustado para tools
        tools,
        tool_choice: 'auto',
      });

      const responseMessage = completion.choices[0].message;

      // Check if OpenAI wanted to call a tool
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        messages.push(responseMessage); // Add assistant's tool call message
        
        for (const rawToolCall of responseMessage.tool_calls) {
          const toolCall = rawToolCall as any;
          if (toolCall.function.name === 'getLatestOrderStatus') {
            this.logger.log(`[Tenant: ${tenantId}] OpenAI invocó la herramienta getLatestOrderStatus para ${customerPhone}`);
            
            // 1. Ejecutar consulta segura a DB
            const order = await (this.prisma.secure as any).order.findFirst({
              where: { customerPhone },
              orderBy: { createdAt: 'desc' },
              select: { status: true, totalAmount: true, updatedAt: true },
            });

            // 2. Construir la respuesta de la herramienta
            let toolResponseText = '';
            if (order) {
              toolResponseText = JSON.stringify({
                status: order.status,
                total: order.totalAmount,
                updatedAt: order.updatedAt,
              });
            } else {
              toolResponseText = JSON.stringify({
                error: 'No active or past orders found for this customer.',
                actionRequired: `Invitar al cliente a su primer pedido usando amablemente el link del menú: https://${tenantSlug || 'demo'}.tu-dominio.com`
              });
            }

            // 3. Añadir resultado a los mensajes
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: toolResponseText,
            });
          } else if (toolCall.function.name === 'createSuggestedCart') {
            this.logger.log(`[Tenant: ${tenantId}] OpenAI invocó la herramienta createSuggestedCart para ${customerPhone}`);
            let toolResponseText = '';
            
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const requestedItems: { name: string, quantity: number }[] = args.items || [];
              
              if (requestedItems.length === 0) {
                toolResponseText = JSON.stringify({ error: 'No items provided to create cart.' });
              } else {
                const foundProducts: any[] = [];
                const missingProducts: string[] = [];
                
                // Buscar cada producto por nombre (case-insensitive simple)
                for (const item of requestedItems) {
                  const product = await (this.prisma.secure as any).product.findFirst({
                    where: { 
                      name: { equals: item.name, mode: 'insensitive' },
                      productType: 'RESTAURANT',
                      published: true,
                      isAvailable: true
                    },
                    select: { 
                      id: true, 
                      name: true, 
                      basePrice: true,
                      productType: true,
                      variants: { select: { id: true }, take: 1 },
                      images: true
                    }
                  });
                  
                  if (product) {
                    foundProducts.push({
                      productId: product.id,
                      variantId: product.variants[0]?.id || product.id,
                      title: product.name,
                      quantity: item.quantity,
                      price: Number(product.basePrice),
                      productType: product.productType,
                      imageSrc: product.images[0] || ''
                    });
                  } else {
                    missingProducts.push(item.name);
                  }
                }
                
                if (foundProducts.length === 0) {
                   toolResponseText = JSON.stringify({ 
                     error: 'None of the requested products were found in the active menu.',
                     actionRequired: 'Por favor, dile al cliente que esos productos no están disponibles y ofrécele alternativas del menú actual.'
                   });
                } else {
                   // Generar URL firmada / serializada temporal
                   // Formato: JSON Array encoded en Base64
                   const cartData = Buffer.from(JSON.stringify(foundProducts)).toString('base64');
                   const checkoutUrl = `https://${tenantSlug || 'demo'}.alvarolondoño.dev/checkout?cart=${cartData}`;
                   
                   toolResponseText = JSON.stringify({
                     success: true,
                     message: 'Cart created successfully.',
                     checkoutUrl: checkoutUrl,
                     itemsFound: foundProducts.map(p => `${p.quantity}x ${p.name}`),
                     itemsNotFound: missingProducts.length > 0 ? missingProducts : undefined
                   });
                }
              }
            } catch (err) {
              this.logger.error(`Error procesando createSuggestedCart: ${err.message}`);
              toolResponseText = JSON.stringify({ error: 'Internal error generating cart.' });
            }

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: toolResponseText,
            });
          }
        }

        // 4. Hacer la segunda llamada a la IA con los datos de las herramientas
        const secondResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        });

        return secondResponse.choices[0].message.content || 'Lo siento, no pude procesar tu solicitud tras revisar los datos.';
      }

      return responseMessage.content || 'Lo siento, no pude procesar tu solicitud.';
    } catch (error) {
      this.logger.error(`Error en OpenAI para tenant ${tenantId}: ${error.message}`, error.stack);
      throw new Error('Fallo al comunicarse con OpenAI');
    }
  }
}
