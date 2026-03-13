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
      // 1. Obtener el token de acceso desde StoreSettings
      const settings = await this.prisma.secure.storeSettings.findFirst();

      const accessToken = (settings as any)?.waAccessToken;

      if (!accessToken) {
        this.logger.error(`[Tenant: ${tenantId}] waAccessToken no configurado. No se puede enviar el mensaje.`);
        return false;
      }

      // 2. Enviar la petición a Meta
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
}
