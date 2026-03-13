import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class WhatsappProcessor {
  private readonly logger = new Logger(WhatsappProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
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
        },
      });

      if (!storeSetting) {
        this.logger.warn(`No se encontró tenant asociado al número de WhatsApp: ${phone_number_id} - Ignorando mensaje.`);
        return;
      }

      const { tenantId } = storeSetting;
      this.logger.log(`Tenant resuelto: ${tenantId}`);

      // 2. Ejecución Segura (CLS): Ejecutar lógica dentro del contexto del Tenant
      await this.cls.runWith({ tenantId } as any, async () => {
        // Todas las queries a this.prisma.secure() a partir de aquí tendrán Row-Level Security!

        const message = payload.messages[0];
        const from = message.from; // Número del cliente
        
        // Dependiendo del tipo de mensaje (text, interactive, image, etc) se lee el body
        const textBody = message.type === 'text' ? message.text?.body : '[Mensaje no es de texto]';

        this.logger.log(`[Tenant: ${tenantId}] Nuevo mensaje de ${from}: ${textBody}`);
        
        // --- AQUÍ VA LA LÓGICA DE NEGOCIO ---
        // 1. Buscar si existe el cliente (Lead o User)
        // 2. Comunicarse con IA (OpenAI / Claude)
        // 3. Crear pedido, enviar respuesta a WhatsApp
        
      });
    } catch (error) {
      this.logger.error(`Error procesando webhook de WhatsApp: ${error.message}`, error.stack);
    }
  }
}
