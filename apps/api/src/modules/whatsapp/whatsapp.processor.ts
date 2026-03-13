import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { OpenAiProvider } from './providers/openai.provider';
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

    this.logger.log(`Procesando mensaje de WhatsApp para PhoneNumberID: ${phone_number_id}`);

    try {
      // 1. Tenant Resolution: Buscar a qué tenant le pertenece este número
      // Usamos findFirst directamente sin seguridad de tenant, ya que aquí estamos
      // resolviendo el tenant justamente desde un contexto global
      const storeSetting = await this.prisma.storeSettings.findFirst({
        where: {
          waPhoneNumberId: phone_number_id,
        },
        select: {
          tenantId: true,
          tenant: {
            select: { slug: true }
          }
        },
      });

      if (!storeSetting) {
        this.logger.warn(`No se encontró tenant asociado al número de WhatsApp: ${phone_number_id} - Ignorando mensaje.`);
        return;
      }

      const { tenantId, tenant } = storeSetting as any; // Cast as any to avoid PRISMA type errors initially
      const tenantSlug = tenant?.slug || 'demo';
      this.logger.log(`Tenant resuelto: ${tenantId}`);

      // 2. Ejecución Segura (CLS): Ejecutar lógica dentro del contexto del Tenant
      await this.cls.runWith({ tenantId } as any, async () => {
        // Todas las queries a this.prisma.secure() a partir de aquí tendrán Row-Level Security!

        const message = payload.messages[0];
        const from = message.from; // Número del cliente
        
        // Dependiendo del tipo de mensaje (text, interactive, image, etc) se lee el body
        const textBody = message.type === 'text' ? message.text?.body : '[Mensaje no es de texto]';
        const messageId = message.id; // ID único del mensaje que da Meta

        this.logger.log(`[Tenant: ${tenantId}] Nuevo mensaje de ${from}: ${textBody}`);
        
        // --- PERSISTENCIA DE MENSAJES ---
        
        // 1. Upsert Conversación Activa
        // Buscar conversación abierta, o crear una si no existe
        let conversation = await this.prisma.secure.waConversation.findFirst({
          where: {
            customerPhone: from,
            status: 'OPEN',
          },
        });

        if (!conversation) {
          this.logger.log(`[Tenant: ${tenantId}] Creando nueva conversación para el cliente ${from}`);
          conversation = await this.prisma.secure.waConversation.create({
            data: {
              tenantId,
              customerPhone: from,
              status: 'OPEN',
            },
          });
        }

        // 2. Guardar el Mensaje
        // Evitar duplicados (Meta a veces reintenta el mismo mensaje)
        const existingMessage = await this.prisma.secure.waMessage.findUnique({
          where: { waMessageId: messageId },
        });

        if (existingMessage) {
          this.logger.log(`[Tenant: ${tenantId}] Mensaje duplicado de Meta ignorado (ID: ${messageId})`);
          return; // Ya fue procesado
        }

        await this.prisma.secure.waMessage.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            waMessageId: messageId,
            role: 'USER',
            content: textBody,
          },
        });

        // --- AQUÍ VA LA LÓGICA DE IA Y RESPUESTA ---

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
        const systemPrompt = await this.contextService.buildSystemPrompt(tenantId);

        // 5. Cargar Historial de Conversación Limitado (ej. últimos 10 mensajes)
        const rawHistory = await (this.prisma.secure as any).waMessage.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        const history = rawHistory.reverse().map((msg: any) => ({
          role: msg.role === 'USER' ? 'USER' : 'ASSISTANT',
          content: msg.content,
        })) as { role: 'USER' | 'ASSISTANT'; content: string }[];

        // 6. Consultar a la IA
        this.logger.log(`[Tenant: ${tenantId}] Consultando IA para el cliente ${from}...`);
        
        let aiResponse = '';
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
          this.logger.error(`[Tenant: ${tenantId}] Falló la IA, usando fallback: ${error.message}`);
          aiResponse = 'He tenido un problema procesando tu mensaje. Por favor, escríbeme en un momento.';
        }

        // 7. Guardar Mensaje del Asistente
        await (this.prisma.secure as any).waMessage.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            waMessageId: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`, // ID simulado
            role: 'ASSISTANT',
            content: aiResponse,
          },
        });

        // 8. Enviar Vía WhatsApp Meta API
        await this.metaApiService.sendTextMessage(
          tenantId,
          phone_number_id,
          from,
          aiResponse,
        );
      });
    } catch (error) {
      this.logger.error(`Error procesando webhook de WhatsApp: ${error.message}`, error.stack);
    }
  }
}
