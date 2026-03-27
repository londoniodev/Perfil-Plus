import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Servicio de integración con Bold - API Link de Pagos
 * Docs: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
 *
 * URL base: https://integrations.api.bold.co
 * Endpoint: POST /online/link/v1
 * Auth: x-api-key <llave_de_identidad>
 */
export interface BoldPaymentLinkResponse {
  payment_link: string;
}

@Injectable()
export class BoldService {
  private readonly logger = new Logger(BoldService.name);

  /** URL base de la API Link de Pagos de Bold */
  private readonly apiUrl = 'https://integrations.api.bold.co';

  constructor(private configService: ConfigService) {}

  /**
   * Crea un Link de Pago en Bold.
   *
   * Docs: POST /online/link/v1
   * Payload mínimo monto cerrado:
   *   { "amount_type": "CLOSE", "amount": { "currency": "COP", "total_amount": 10000, "tip_amount": 0 } }
   *
   * Response:
   *   { "payload": { "payment_link": "LNK_xxx", "url": "https://checkout.bold.co/LNK_xxx" }, "errors": [] }
   */
  async createPaymentLink(
    orderData: {
      orderId: string;
      totalAmount: number;
      currency: string;
      description: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerIdentification?: string;
    },
    boldApiKey: string,
    redirectUrl: string,
    notificationUrl: string,
    paymentMethodType?: string,
  ): Promise<BoldPaymentLinkResponse> {
    try {
      const apiKey = boldApiKey?.trim();
      if (!apiKey) {
        throw new BadRequestException('Bold API Key is missing for this tenant.');
      }

      // Bold usa el valor real en COP (no centavos). Ej: $10.000 = 10000
      const totalAmount = Math.round(orderData.totalAmount);

      // Construir reference único (Bold acepta alfanuméricos, guiones y guiones bajos, máx 60 chars)
      // Recomiendan agregar timestamp para evitar duplicados
      const reference = `${orderData.orderId}-${Date.now()}`.slice(0, 60);

      // Expiración: 30 minutos desde ahora en NANOSEGUNDOS (requerimiento Bold)
      const expirationDate = (Date.now() + 30 * 60 * 1000) * 1e6; // ms → nanosegundos

      // Payload según docs oficiales de Bold Link de Pagos
      const payload: Record<string, unknown> = {
        amount_type: 'CLOSE', // ⚠️ Es "CLOSE" no "CLOSED" — crítico
        amount: {
          currency: orderData.currency || 'COP',
          total_amount: totalAmount,
          tip_amount: 0,
          taxes: [],
        },
        reference,
        description:
          (orderData.description || `Orden ${orderData.orderId}`).slice(0, 100), // máx 100 chars
        expiration_date: expirationDate,
        callback_url: redirectUrl,
      };

      if (paymentMethodType) {
        payload.payment_methods = [paymentMethodType];
      }

      // Email del pagador (opcional)
      if (orderData.customerEmail) {
        payload.payer_email = orderData.customerEmail;
      }
      
      // Intentar auto-completar datos del pagador (útil para Nequi/Daviplata)
      if (orderData.customerPhone) {
        // Formatear: solo números (Bold suele preferir formato E164 o local limpio)
        payload.payer_phone = orderData.customerPhone.replace(/\D/g, '');
      }
      if (orderData.customerName) {
        payload.payer_name = orderData.customerName;
      }
      if (orderData.customerIdentification) {
        payload.payer_document = orderData.customerIdentification.replace(/\D/g, '');
      }

      this.logger.log(
        `Creating Bold payment link for order ${orderData.orderId}, amount: ${totalAmount} ${orderData.currency || 'COP'}`,
      );

      const response = await fetch(`${this.apiUrl}/online/link/v1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `x-api-key ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Bold API error [${response.status}]: ${errorText}`);
        throw new BadRequestException(
          `Error de Bold [${response.status}]: ${this.parseErrorMessage(errorText)}`,
        );
      }

      // Response: { "payload": { "payment_link": "LNK_xxx", "url": "https://checkout.bold.co/LNK_xxx" }, "errors": [] }
      const data = await response.json();
      const linkPayload = data?.payload;

      if (!linkPayload?.url) {
        this.logger.error('Unexpected Bold response format', data);
        throw new BadRequestException('Formato de respuesta inesperado de Bold');
      }

      this.logger.log(
        `Bold payment link created: ${linkPayload.payment_link} → ${linkPayload.url}`,
      );

      return {
        payment_link: linkPayload.url,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Failed to create Bold payment link: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw new BadRequestException(
        'No se pudo generar el link de pago con Bold',
      );
    }
  }

  /**
   * Consulta el estado de un link de pago.
   * Docs: GET /online/link/v1/{payment_link}
   */
  async getPaymentLinkStatus(
    paymentLinkId: string,
    boldApiKey: string,
  ): Promise<Record<string, unknown>> {
    const response = await fetch(
      `${this.apiUrl}/online/link/v1/${paymentLinkId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `x-api-key ${boldApiKey}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Bold status check error [${response.status}]: ${errorText}`,
      );
      throw new BadRequestException('Error al consultar estado en Bold');
    }

    const data = await response.json();
    return data?.payload || data;
  }

  /**
   * Verifica la firma HMAC-SHA256 de un webhook de Bold.
   * @param rawBody El buffer o string crudo del body
   * @param signature La firma recibida (ej. del header x-bold-signature)
   * @param secret El secreto de webhook del tenant
   */
  verifyWebhookSignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) return false;

    try {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      this.logger.error('Error verifying Bold webhook signature', error);
      return false;
    }
  }

  /** Extrae un mensaje legible de los errores JSON de Bold. */
  private parseErrorMessage(errorText: string): string {
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.errors?.length > 0) {
        return parsed.errors.map((e: any) => e.message || e).join(', ');
      }
      if (parsed?.payload?.message) {
        return parsed.payload.message;
      }
      return parsed?.message || errorText;
    } catch {
      return errorText;
    }
  }
}
