import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AiProvider, AiResponse } from './ai-provider.interface';
import { OpenAI } from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  RestaurantContextService,
  CatalogProduct,
} from '../services/restaurant-context.service';
import Fuse from 'fuse.js';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly contextService: RestaurantContextService,
  ) {
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
  ): Promise<AiResponse> {
    // Variable para rastrear si se generó un checkoutUrl durante tool calls
    let detectedCheckoutUrl: string | undefined;
    let deterministicReceipt: string | undefined;

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
            name: 'saveCustomerProfile',
            description:
              'Guarda o actualiza el perfil del cliente (nombre, dirección). Úsala cuando el cliente te proporcione sus datos.',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nombre del cliente' },
                address: {
                  type: 'string',
                  description: 'Dirección de envío completa',
                },
              },
              required: ['name'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'createSuggestedCart',
            description:
              'Crea un carrito de compras con los productos solicitados y genera el link de pago. IMPORTANTE: Usa esta herramienta SIEMPRE que el cliente decida pedir ciertos productos.',
            parameters: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  description: 'Lista de productos que el cliente quiere pedir',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description:
                          'Nombre del producto tal como figura en el menú (no necesita ser exacto)',
                      },
                      quantity: {
                        type: 'integer',
                        description: 'Cantidad solicitada de este producto',
                      },
                      notes: {
                        type: 'string',
                        description:
                          'Instrucciones especiales o modificadores para este item. Ej: "sin cebolla", "extra queso", "bien cocida"',
                      },
                    },
                    required: ['name', 'quantity'],
                  },
                },
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
        max_tokens: 400,
        tools,
        tool_choice: 'auto',
      });

      const responseMessage = completion.choices[0].message;

      // Check if OpenAI wanted to call a tool
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        messages.push(responseMessage);

        for (const rawToolCall of responseMessage.tool_calls) {
          const toolCall = rawToolCall as any;

          if (toolCall.function.name === 'saveCustomerProfile') {
            this.logger.log(
              `[Tenant: ${tenantId}] OpenAI invocó la herramienta saveCustomerProfile para ${customerPhone}`,
            );
            let toolResponseText = '';
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const { name, address } = args;

              const customer = await this.prisma.secure.waCustomer.upsert({
                where: {
                  tenantId_phone: { tenantId, phone: customerPhone || '' },
                },
                update: { name, address },
                create: { tenantId, phone: customerPhone || '', name, address },
              });

              toolResponseText = JSON.stringify({
                success: true,
                customerId: customer.id,
              });
            } catch (err) {
              this.logger.error(`Error en saveCustomerProfile: ${err.message}`);
              toolResponseText = JSON.stringify({
                error: 'Failed to save customer profile',
              });
            }

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: toolResponseText,
            });
          } else if (toolCall.function.name === 'getLatestOrderStatus') {
            this.logger.log(
              `[Tenant: ${tenantId}] OpenAI invocó la herramienta getLatestOrderStatus para ${customerPhone}`,
            );

            const order = await this.prisma.secure.order.findFirst({
              where: { customerPhone: customerPhone || '' },
              orderBy: { createdAt: 'desc' },
              select: { status: true, totalAmount: true, updatedAt: true },
            });

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
                actionRequired: `Invitar al cliente a su primer pedido usando amablemente el link del menú: https://${tenantSlug || 'demo'}.alvarolondoño.dev`,
              });
            }

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: toolResponseText,
            });
          } else if (toolCall.function.name === 'createSuggestedCart') {
            this.logger.log(
              `[Tenant: ${tenantId}] OpenAI invocó la herramienta createSuggestedCart para ${customerPhone}`,
            );
            let toolResponseText = '';

            try {
              const args = JSON.parse(toolCall.function.arguments);
              const requestedItems: {
                name: string;
                quantity: number;
                notes?: string;
              }[] = args.items || [];

              if (requestedItems.length === 0) {
                toolResponseText = JSON.stringify({
                  error: 'No items provided to create cart.',
                });
              } else {
                const foundProducts: any[] = [];
                const missingProducts: string[] = [];

                // Búsqueda Fuzzy con Fuse.js contra catálogo cacheado
                const catalog =
                  await this.contextService.getProductCatalog(tenantId);
                const fuse = new Fuse(catalog, {
                  keys: ['name'],
                  threshold: 0.4,
                  includeScore: true,
                  ignoreLocation: true,
                });

                for (const item of requestedItems) {
                  const results = fuse.search(item.name);

                  if (
                    results.length > 0 &&
                    results[0].score !== undefined &&
                    results[0].score <= 0.4
                  ) {
                    const match = results[0].item;
                    this.logger.log(
                      `[Fuzzy] "${item.name}" → "${match.name}" (score: ${results[0].score?.toFixed(3)})`,
                    );
                    foundProducts.push({
                      productId: match.id,
                      variantId: match.variantId,
                      title: match.name,
                      quantity: item.quantity,
                      price: match.basePrice,
                      productType: 'RESTAURANT',
                      imageSrc: match.images[0] || '',
                      notes: item.notes || undefined,
                    });
                  } else {
                    this.logger.warn(
                      `[Fuzzy] No match for "${item.name}" (best score: ${results[0]?.score?.toFixed(3) || 'N/A'})`,
                    );
                    missingProducts.push(item.name);
                  }
                }

                if (foundProducts.length === 0) {
                  toolResponseText = JSON.stringify({
                    error:
                      'None of the requested products were found in the active menu.',
                    actionRequired:
                      'Por favor, dile al cliente que esos productos no están disponibles y ofrécele alternativas del menú actual.',
                  });
                } else {
                  // ==========================================
                  // PERSISTIR CARRITO EN POSTGRESQL (WaCart)
                  // ==========================================
                  const cartId = `wa-${Date.now().toString(36)}-${Math.random().toString(36).substring(7)}`;

                  // Obtener perfil del cliente para hidratar el checkout
                  const customer =
                    await this.prisma.secure.waCustomer.findUnique({
                      where: {
                        tenantId_phone: {
                          tenantId,
                          phone: customerPhone || '',
                        },
                      },
                    });

                  const cartPayload = {
                    items: foundProducts,
                    customerData: customer
                      ? {
                          name: customer.name,
                          address: customer.address,
                          phone: customer.phone,
                          lat: customer.lat,
                          lng: customer.lng,
                        }
                      : {
                          phone: customerPhone,
                        },
                  };

                  const expiresAt = new Date();
                  expiresAt.setHours(expiresAt.getHours() + 24); // TTL 24 horas

                  this.logger.log(
                    `[CART_SAVE] === INICIO GUARDADO POSTGRESQL ===`,
                  );
                  this.logger.log(`[CART_SAVE] CartID: ${cartId}`);
                  this.logger.log(`[CART_SAVE] TenantID: ${tenantId}`);

                  try {
                    await this.prisma.secure.waCart.create({
                      data: {
                        id: cartId,
                        tenantId,
                        customerPhone: customerPhone || '',
                        cartData: cartPayload as any,
                        expiresAt,
                      },
                    });
                    this.logger.log(
                      `[CART_SAVE] ✅ Carrito guardado en Postgres exitosamente`,
                    );
                  } catch (err) {
                    this.logger.error(
                      `[CART_SAVE] ❌ FALLO guardando en Postgres: ${err.message}`,
                    );
                  }

                  this.logger.log(
                    `[CART_SAVE] === FIN GUARDADO POSTGRESQL ===`,
                  );

                  // Usamos el Punycode correcto (khb) para compatibilidad universal con móviles (Android/WhatsApp)
                  const checkoutUrl = `https://${tenantSlug || 'demo'}.xn--alvarolondoo-khb.dev/checkout?wa=${cartId}`;
                  detectedCheckoutUrl = checkoutUrl; // Guardar para retornar al processor

                  // Generar recibo determinista consultando la DB (deliveryFee)
                  const storeSettings =
                    await this.prisma.secure.storeSettings.findFirst({
                      where: { tenantId },
                    });
                  const deliveryFee = Number(storeSettings?.deliveryFee || 0);

                  let subtotal = 0;
                  let receiptText = `\n\n🧾 *Resumen de tu pedido:*\n`;

                  for (const item of foundProducts) {
                    const lineTotal = item.price * item.quantity;
                    subtotal += lineTotal;
                    receiptText += `- ${item.quantity}x ${item.title} ($${lineTotal.toLocaleString('es-CO')})\n`;
                  }

                  const total = subtotal + deliveryFee;
                  receiptText += `\n*Subtotal:* $${subtotal.toLocaleString('es-CO')}\n`;
                  receiptText += `*Domicilio:* $${deliveryFee.toLocaleString('es-CO')}\n`;
                  // Asteriscos envolviendo para hacer un markdown bold para WhatsApp de total final
                  receiptText += `\n*Total a pagar:* *$${total.toLocaleString('es-CO')}*`;

                  deterministicReceipt = receiptText;

                  toolResponseText = JSON.stringify({
                    success: true,
                    message: 'Cart created successfully.',
                    checkoutUrl,
                    itemsFound: foundProducts.map(
                      (p) => `${p.quantity}x ${p.title}`,
                    ),
                    itemsNotFound:
                      missingProducts.length > 0 ? missingProducts : undefined,
                  });
                }
              }
            } catch (err) {
              this.logger.error(
                `Error procesando createSuggestedCart: ${err.message}`,
              );
              toolResponseText = JSON.stringify({
                error: 'Internal error generating cart.',
              });
            }

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: toolResponseText,
            });
          }
        }

        // Segunda llamada a la IA con los datos de las herramientas
        const secondResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        });

        const text =
          secondResponse.choices[0].message.content ||
          'Lo siento, no pude procesar tu solicitud tras revisar los datos.';

        // Adjuntar el recibo determinista si se creó un carrito en esta interacción
        let finalText = text;
        if (deterministicReceipt) {
          finalText += deterministicReceipt;
        }

        return { text: finalText, checkoutUrl: detectedCheckoutUrl };
      }

      return {
        text:
          responseMessage.content ||
          'Lo siento, no pude procesar tu solicitud.',
      };
    } catch (error) {
      this.logger.error(
        `Error en OpenAI para tenant ${tenantId}: ${error.message}`,
        error.stack,
      );
      throw new Error('Fallo al comunicarse con OpenAI');
    }
  }
}
