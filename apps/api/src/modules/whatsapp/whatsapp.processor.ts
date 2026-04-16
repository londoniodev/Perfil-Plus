import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { OpenAiProvider } from './providers/openai.provider';
import { AiResponse } from './providers/ai-provider.interface';
import { RestaurantContextService } from './services/restaurant-context.service';
import { MetaApiService } from './services/meta-api.service';
import { UsageGuardService } from './services/usage-guard.service';

@Injectable()
export class WhatsappProcessor {
  private readonly logger = new Logger(WhatsappProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly aiProvider: OpenAiProvider, // Aquí inyectamos el proveedor de IA OpenAi
    private readonly contextService: RestaurantContextService,
    private readonly metaApiService: MetaApiService,
    private readonly usageGuard: UsageGuardService,
  ) {}

  @OnEvent('whatsapp.message.received', { async: true })
  async handleWhatsappMessage(data: { phone_number_id: string; payload: any }) {
    const { phone_number_id, payload } = data;

    this.logger.log(
      `Procesando mensaje de WhatsApp para PhoneNumberID: ${phone_number_id}`,
    );

    try {
      // 1. Tenant Resolution: Buscar a qué tenant le pertenece este número
      // Usamos findFirst directamente sin seguridad de tenant, ya que aquí estamos
      // resolviendo el tenant justamente desde un contexto global
      // SECURITY EXCEPTION: Global query to resolve tenantId from phone number before CLS context exists.
      /* eslint-disable no-restricted-syntax */
      const tenantSetting = await this.prisma.unscoped.tenantSettings.findFirst({
        /* eslint-enable no-restricted-syntax */
        where: {
          waPhoneNumberId: phone_number_id,
        },
        select: {
          tenantId: true,
          isWaBotActive: true,
          tenant: {
            select: { slug: true },
          },
        },
      });

      if (!tenantSetting) {
        this.logger.warn(
          `No se encontró tenant asociado al número de WhatsApp: ${phone_number_id} - Ignorando mensaje.`,
        );
        return;
      }

      const { tenantId, tenant, isWaBotActive } = tenantSetting as any;
      const tenantSlug = tenant?.slug || 'demo';
      this.logger.log(`Tenant resuelto: ${tenantId}`);

      // 2. Ejecución Segura (CLS): Ejecutar lógica dentro del contexto del Tenant
      await this.cls.runWith({ tenantId } as any, async () => {
        // Todas las queries a this.prisma() a partir de aquí tendrán Row-Level Security!

        const message = payload.messages[0];
        const from = message.from; // Número del cliente
        const messageId = message.id; // ID único del mensaje que da Meta

        // ━━━ UX INMEDIATO: mark_as_read (fire-and-forget) ━━━
        this.metaApiService
          .markAsRead(tenantId, phone_number_id, messageId)
          .catch(() => {});

        // ━━━ INTERCEPTOR DE TIPO DE MENSAJE ━━━
        let textBody: string;

        if (message.type === 'location' && message.location) {
          const { latitude, longitude } = message.location;
          this.logger.log(
            `[Tenant: ${tenantId}] Ubicación GPS recibida de ${from}: lat=${latitude}, lng=${longitude}`,
          );

          // Persistir coordenadas en WaCustomer (upsert para manejar cliente nuevo o existente)
          try {
            await (this.prisma as any).waCustomer.upsert({
              where: { tenantId_phone: { tenantId, phone: from } },
              update: { lat: latitude, lng: longitude },
              create: { tenantId, phone: from, lat: latitude, lng: longitude },
            });
            this.logger.log(
              `[Tenant: ${tenantId}] Coordenadas GPS guardadas para ${from}`,
            );
          } catch (gpsErr) {
            this.logger.error(
              `[Tenant: ${tenantId}] Error guardando GPS para ${from}: ${gpsErr.message}`,
            );
          }

          // Mensaje sintético para que la IA entienda qué pasó
          textBody =
            '*[Sistema: El cliente acaba de compartir su ubicación GPS exacta mediante WhatsApp. El backend ya la ha guardado exitosamente. Agradécele amablemente de forma breve y continúa con la conversación o despídete si el pedido ya terminó.]*';
        } else if (message.type === 'audio' && message.audio) {
          // ━━━ TRANSCRIPCIÓN DE AUDIO (Whisper) ━━━
          this.logger.log(
            `[Tenant: ${tenantId}] Audio recibido de ${from}. Transcribiendo con Whisper...`,
          );
          const transcription = await this.metaApiService.transcribeAudio(
            tenantId,
            message.audio.id,
          );

          if (transcription) {
            textBody = transcription;
            this.logger.log(
              `[Tenant: ${tenantId}] Transcripción exitosa: "${transcription.substring(0, 80)}..."`,
            );
          } else {
            textBody =
              '*[El cliente envió un audio pero no fue posible entenderlo. Pídele amablemente que envíe un mensaje de texto.]*';
          }
        } else if (message.type === 'text') {
          textBody = message.text?.body || '';
        } else {
          textBody = '[Mensaje no es de texto]';
        }

        this.logger.log(
          `[Tenant: ${tenantId}] Nuevo mensaje de ${from}: ${textBody.substring(0, 80)}`,
        );

        // --- PERSISTENCIA DE MENSAJES ---

        // 1. Upsert Conversación Activa
        // Buscar conversación abierta, o crear una si no existe
        let conversation = await this.prisma.waConversation.findFirst({
          where: {
            customerPhone: from,
            status: 'OPEN',
          },
        });

        if (!conversation) {
          this.logger.log(
            `[Tenant: ${tenantId}] Creando nueva conversación para el cliente ${from}`,
          );
          conversation = await this.prisma.waConversation.create({
            data: {
              tenantId,
              customerPhone: from,
              status: 'OPEN',
            },
          });
        }

        // ━━━ HANDOFF CHECK: Si el bot está deshabilitado en esta conversación, no procesar con IA ━━━
        if (!conversation.botEnabled) {
          this.logger.log(
            `[Tenant: ${tenantId}] Bot deshabilitado en conversación ${conversation.id} (handoff activo). Ignorando IA.`,
          );
          // Solo persistimos el mensaje pero no generamos respuesta
          const existingMsg = await this.prisma.waMessage.findUnique({
            where: { waMessageId: messageId },
          });
          if (!existingMsg) {
            await this.prisma.waMessage.create({
              data: {
                tenantId,
                conversationId: conversation.id,
                waMessageId: messageId,
                role: 'USER',
                content: textBody,
              },
            });
          }
          return;
        }

        // 2. Guardar el Mensaje
        // Evitar duplicados (Meta a veces reintenta el mismo mensaje)
        const existingMessage = await this.prisma.waMessage.findUnique({
          where: { waMessageId: messageId },
        });

        if (existingMessage) {
          this.logger.log(
            `[Tenant: ${tenantId}] Mensaje duplicado de Meta ignorado (ID: ${messageId})`,
          );
          return; // Ya fue procesado
        }

        await this.prisma.waMessage.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            waMessageId: messageId,
            role: 'USER',
            content: textBody,
          },
        });

        // --- AQUÍ VA LA LÓGICA DE IA Y RESPUESTA ---

        if (!isWaBotActive) {
          this.logger.log(`[Tenant: ${tenantId}] IA Desactivada globalmente. Ignorando generación de respuesta (Coexistencia).`);
          return;
        }

        // 3. Validar límites de IA mensuales
        const isAllowed = await this.usageGuard.checkAiLimit(tenantId);

        if (!isAllowed) {
          await this.metaApiService.sendTextMessage(
            tenantId,
            phone_number_id,
            from,
            'Lo sentimos, el asistente virtual no está disponible en este momento por límites de capacidad. Por favor, comunícate más tarde.',
          );
          return;
        }

        // 4. Generar Contexto del Restaurante
        const systemPrompt = await this.contextService.buildSystemPrompt(
          tenantId,
          from,
        );

        // 5. Cargar Historial de Conversación Limitado (Sliding Window: últimos 15 mensajes)
        const rawHistory = await (this.prisma as any).waMessage.findMany(
          {
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
            take: 15,
          },
        );

        const history = rawHistory.reverse().map((msg: any) => ({
          role: msg.role === 'USER' ? 'USER' : 'ASSISTANT',
          content: msg.content,
        })) as { role: 'USER' | 'ASSISTANT'; content: string }[];

        // 6. Consultar a la IA
        this.logger.log(
          `[Tenant: ${tenantId}] Consultando IA para el cliente ${from}...`,
        );

        let aiResponse: AiResponse = { text: '' };
        try {
          aiResponse = await this.aiProvider.generateResponse(
            tenantId,
            systemPrompt,
            history,
            textBody,
            from, // customerPhone
            tenantSlug,
          );
        } catch (error) {
          this.logger.error(
            `[Tenant: ${tenantId}] Falló la IA, usando fallback: ${error.message}`,
          );
          aiResponse = {
            text: 'He tenido un problema procesando tu mensaje. Por favor, escríbeme en un momento.',
          };
        }

        // ━━━ HANDOFF TRIGGERED: Si la IA detectó que el cliente quiere hablar con humano ━━━
        if (aiResponse.handoffTriggered) {
          this.logger.warn(
            `[Tenant: ${tenantId}] Handoff activado para conversación ${conversation.id}`,
          );
          // El flag ya se actualizó en el openai.provider.ts
        }

        // 7. Guardar Mensaje del Asistente
        await (this.prisma as any).waMessage.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            waMessageId: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            role: 'ASSISTANT',
            content: aiResponse.text,
          },
        });

        // 8. Enviar fotos de productos (si la IA las solicitó)
        if (aiResponse.productImages && aiResponse.productImages.length > 0) {
          const images = aiResponse.productImages;
          const chunkSize = 5;

          for (let i = 0; i < images.length; i += chunkSize) {
            const chunk = images.slice(i, i + chunkSize);
            const results = await Promise.allSettled(
              chunk.map((img) =>
                this.metaApiService.sendImageMessage(
                  tenantId,
                  phone_number_id,
                  from,
                  img.url,
                  img.caption,
                ),
              ),
            );

            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                this.logger.error(
                  `[Tenant: ${tenantId}] Error enviando imagen ${chunk[index].url} a ${from}: ${result.reason}`,
                );
              }
            });
          }
        }

        // 9. Enviar Vía WhatsApp Meta API (El texto de respuesta DEBE ir al final)
        if (aiResponse.checkoutUrl) {
          // Limpiar el texto de cualquier URL para evitar redundancia con el botón CTA
          const cleanText = aiResponse.text
            .replace(/https?:\/\/[^\s]+/g, '')
            .trim();

          // Si hay un checkoutUrl, enviar con botón interactivo CTA
          await this.metaApiService.sendInteractiveCtaMessage(
            tenantId,
            phone_number_id,
            from,
            cleanText || 'Aquí tienes tu enlace de pago:',
            'Completar Pago',
            aiResponse.checkoutUrl,
          );
        } else {
          // Enviar como texto plano normal
          await this.metaApiService.sendTextMessage(
            tenantId,
            phone_number_id,
            from,
            aiResponse.text,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Error procesando webhook de WhatsApp: ${error.message}`,
        error.stack,
      );
    }
  }
}
