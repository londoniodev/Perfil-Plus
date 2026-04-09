import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';

interface SessionInfo {
  wabaId?: string;
  phoneNumberId?: string;
}

@Injectable()
export class WhatsappOnboardingService {
  private readonly logger = new Logger(WhatsappOnboardingService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v21.0';
  private readonly appId = process.env.META_APP_ID;
  private readonly appSecret = process.env.META_APP_SECRET;

  constructor(private readonly prisma: PrismaService) {}

  async processOnboarding(
    code: string,
    tenantId: string,
    sessionInfo?: SessionInfo,
  ) {
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

      // Paso 3: Obtener WABA ID y Phone Number ID
      // Prioridad: IDs del sessionInfo (Embedded Signup postMessage) > fallback a Graph API
      let wabaId = sessionInfo?.wabaId || null;
      let waPhoneNumberId = sessionInfo?.phoneNumberId || null;

      if (wabaId && waPhoneNumberId) {
        this.logger.log(
          `[Tenant: ${tenantId}] Usando IDs del Embedded Signup sessionInfo: WABA=${wabaId}, Phone=${waPhoneNumberId}`,
        );
      } else {
        // Fallback: intentar obtener de debug_token (para flujos no-embedded)
        this.logger.warn(
          `[Tenant: ${tenantId}] No se recibieron IDs del sessionInfo, intentando obtener del debug_token...`,
        );

        const debugTokenResponse = await axios.get(
          `${this.apiUrl}/debug_token`,
          {
            params: {
              input_token: longLivedToken,
              access_token: `${this.appId}|${this.appSecret}`,
            },
          },
        );

        const debugData = debugTokenResponse.data?.data;
        const granularScopes = debugData?.granular_scopes || [];

        // Buscar WABA ID en los scopes granulares
        const wabaScope = granularScopes.find(
          (s: any) => s.scope === 'whatsapp_business_management',
        );
        if (wabaScope?.target_ids?.length > 0) {
          wabaId = wabaScope.target_ids[0];
          this.logger.log(
            `[Tenant: ${tenantId}] WABA ID obtenido de debug_token: ${wabaId}`,
          );
        }

        // Si tenemos WABA ID, obtener el phone number
        if (wabaId) {
          const phoneResponse = await axios.get(
            `${this.apiUrl}/${wabaId}/phone_numbers`,
            {
              params: { access_token: longLivedToken },
            },
          );

          const phoneNumber = phoneResponse.data.data?.[0];
          if (phoneNumber) {
            waPhoneNumberId = phoneNumber.id;
            this.logger.log(
              `[Tenant: ${tenantId}] Phone Number ID obtenido del Graph API: ${waPhoneNumberId}`,
            );
          }
        }
      }

      if (!wabaId || !waPhoneNumberId) {
        throw new BadRequestException(
          'No se pudieron obtener los IDs de WhatsApp Business. Asegúrate de completar el flujo de vinculación.',
        );
      }

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

      // Paso 4: Registrar el número en la Cloud API de Meta
      // Sin este paso, el número queda en estado "Pendiente" y no puede enviar/recibir mensajes.
      // El endpoint /register hace el handshake final con los servidores de WhatsApp.
      this.logger.log(
        `[Tenant: ${tenantId}] Registrando número ${waPhoneNumberId} en la Cloud API de Meta...`,
      );

      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      try {
        await axios.post(
          `${this.apiUrl}/${waPhoneNumberId}/register`,
          {
            messaging_product: 'whatsapp',
            pin,
          },
          {
            headers: {
              Authorization: `Bearer ${longLivedToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.logger.log(
          `[Tenant: ${tenantId}] ✅ Número registrado exitosamente en la Cloud API`,
        );
      } catch (registerError) {
        // No lanzar excepción — el onboarding ya se completó, solo loguear la advertencia
        const registerMsg =
          registerError.response?.data?.error?.message || registerError.message;
        this.logger.warn(
          `[Tenant: ${tenantId}] ⚠️ No se pudo registrar el número automáticamente: ${registerMsg}. ` +
            `Puede requerir registro manual vía Graph API.`,
        );
      }

      // Paso 5: Suscribir la app al WABA para recibir webhooks
      // Sin este paso, Meta NO enruta los mensajes entrantes de esta WABA al webhook.
      // Es el "eslabón perdido" del Embedded Signup: el webhook global está verificado,
      // pero cada WABA nueva necesita una suscripción explícita.
      this.logger.log(
        `[Tenant: ${tenantId}] Suscribiendo app al WABA ${wabaId} para recibir webhooks...`,
      );

      try {
        await axios.post(
          `${this.apiUrl}/${wabaId}/subscribed_apps`,
          {},
          {
            headers: {
              Authorization: `Bearer ${longLivedToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.logger.log(
          `[Tenant: ${tenantId}] ✅ App suscrita exitosamente al WABA — webhook activo`,
        );
      } catch (subscribeError) {
        const subscribeMsg =
          subscribeError.response?.data?.error?.message || subscribeError.message;
        this.logger.warn(
          `[Tenant: ${tenantId}] ⚠️ No se pudo suscribir la app al WABA: ${subscribeMsg}. ` +
            `Los mensajes entrantes podrían no llegar al webhook.`,
        );
      }

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
