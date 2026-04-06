import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WhatsappOnboardingService {
  private readonly logger = new Logger(WhatsappOnboardingService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v21.0';
  private readonly appId = process.env.META_APP_ID;
  private readonly appSecret = process.env.META_APP_SECRET;

  constructor(private readonly prisma: PrismaService) {}

  async processOnboarding(code: string, tenantId: string) {
    if (!this.appId || !this.appSecret) {
      this.logger.error('META_APP_ID o META_APP_SECRET no están configurados');
      throw new BadRequestException(
        'Configuración de Meta incompleta en el servidor',
      );
    }

    try {
      // Paso 1: Intercambiar code por user_access_token
      this.logger.log(
        `[Tenant: ${tenantId}] Intercambiando código por token de acceso...`,
      );
      const tokenResponse = await axios.get(
        `${this.apiUrl}/oauth/access_token`,
        {
          params: {
            client_id: this.appId,
            client_secret: this.appSecret,
            code: code,
          },
        },
      );

      const userAccessToken = tokenResponse.data.access_token;

      // Paso 2: Intercambiar por token de larga duración (Long-lived token)
      this.logger.log(
        `[Tenant: ${tenantId}] Obteniendo token de larga duración...`,
      );
      const longLivedTokenResponse = await axios.get(
        `${this.apiUrl}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.appId,
            client_secret: this.appSecret,
            fb_exchange_token: userAccessToken,
          },
        },
      );

      const longLivedToken = longLivedTokenResponse.data.access_token;

      // Paso 3: Consultar debug_token para obtener el business_id (WABA) y validar permisos
      this.logger.log(
        `[Tenant: ${tenantId}] Validando token y obteniendo IDs...`,
      );
      const debugTokenResponse = await axios.get(`${this.apiUrl}/debug_token`, {
        params: {
          input_token: longLivedToken,
          access_token: `${this.appId}|${this.appSecret}`, // App Token
        },
      });

      const { data } = debugTokenResponse.data;

      // Obtener las WABAs vinculadas al negocio del usuario
      const wabaResponse = await axios.get(
        `${this.apiUrl}/me/whatsapp_business_accounts`,
        {
          params: { access_token: longLivedToken },
        },
      );

      const waba = wabaResponse.data.data?.[0];
      if (!waba) {
        throw new BadRequestException(
          'No se encontró ninguna cuenta de WhatsApp Business Account vinculada',
        );
      }

      const wabaId = waba.id;

      // Paso 4: Obtener el ID del número de teléfono
      this.logger.log(
        `[Tenant: ${tenantId}] Obteniendo ID del número de teléfono para WABA: ${wabaId}...`,
      );
      const phoneResponse = await axios.get(
        `${this.apiUrl}/${wabaId}/phone_numbers`,
        {
          params: { access_token: longLivedToken },
        },
      );

      const phoneNumber = phoneResponse.data.data?.[0];
      if (!phoneNumber) {
        throw new BadRequestException(
          'No se encontró ningún número de teléfono vinculado a la WABA',
        );
      }

      const waPhoneNumberId = phoneNumber.id;

      // Persistir en TenantSettings (credenciales globales de WhatsApp por tenant)
      this.logger.log(
        `[Tenant: ${tenantId}] Guardando credenciales de WhatsApp en TenantSettings: PhoneID ${waPhoneNumberId}, WabaID ${wabaId}`,
      );

      const waData = {
        waAccessToken: longLivedToken,
        waPhoneNumberId: waPhoneNumberId,
        wabaId: wabaId,
      };

      await this.prisma.tenantSettings.upsert({
        where: { tenantId },
        update: waData,
        create: { tenantId, ...waData },
      });

      return {
        success: true,
        message: 'Onboarding completado exitosamente',
        data: {
          wabaId,
          waPhoneNumberId,
        },
      };
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(
        `[Tenant: ${tenantId}] Error en WhatsApp Onboarding: ${errorMsg}`,
      );
      throw new BadRequestException(
        `Error en la integración con Meta: ${errorMsg}`,
      );
    }
  }
}
