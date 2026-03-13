import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MetaApiService {
  private readonly logger = new Logger(MetaApiService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v21.0';

  constructor(private readonly prisma: PrismaService) {}

  async sendTextMessage(
    tenantId: string,
    phoneNumberId: string,
    to: string,
    text: string,
  ): Promise<boolean> {
    try {
      const settings = await this.prisma.secure.storeSettings.findFirst();
      const accessToken = (settings as any)?.waAccessToken;

      if (!accessToken) {
        this.logger.error(`[Tenant: ${tenantId}] waAccessToken no configurado. No se puede enviar el mensaje.`);
        return false;
      }

      const url = `${this.apiUrl}/${phoneNumberId}/messages`;
      
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: text,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`[Tenant: ${tenantId}] Mensaje enviado exitosamente a ${to}`);
      return true;

    } catch (error) {
       this.logger.error(
         `[Tenant: ${tenantId}] Error enviando mensaje a Meta: ${
           error.response?.data?.error?.message || error.message
         }`,
         error.stack,
       );
       return false;
    }
  }

  /**
   * Envía un mensaje interactivo con botón CTA (Call-to-Action) URL.
   * El usuario verá un botón nativo de WhatsApp que lo lleva a la URL.
   */
  async sendInteractiveCtaMessage(
    tenantId: string,
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttonText: string,
    ctaUrl: string,
  ): Promise<boolean> {
    try {
      const settings = await this.prisma.secure.storeSettings.findFirst();
      const accessToken = (settings as any)?.waAccessToken;

      if (!accessToken) {
        this.logger.error(`[Tenant: ${tenantId}] waAccessToken no configurado. No se puede enviar el mensaje interactivo.`);
        return false;
      }

      const url = `${this.apiUrl}/${phoneNumberId}/messages`;

      // Truncar buttonText a 20 chars (límite de WhatsApp)
      const safeButtonText = buttonText.substring(0, 20);

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive: {
            type: 'cta_url',
            body: {
              text: bodyText,
            },
            action: {
              name: 'cta_url',
              parameters: {
                display_text: safeButtonText,
                url: ctaUrl,
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`[Tenant: ${tenantId}] Mensaje interactivo CTA enviado a ${to}`);
      return true;

    } catch (error) {
      this.logger.error(
        `[Tenant: ${tenantId}] Error enviando mensaje interactivo CTA a Meta: ${
          error.response?.data?.error?.message || error.message
        }`,
        error.stack,
      );
      // Fallback: intentar enviar como texto plano
      this.logger.warn(`[Tenant: ${tenantId}] Intentando fallback a texto plano...`);
      return this.sendTextMessage(tenantId, phoneNumberId, to, `${bodyText}\n\n${ctaUrl}`);
    }
  }
}
