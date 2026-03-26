import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BoldPaymentLinkResponse {
  payment_link: string;
}

@Injectable()
export class BoldService {
  private readonly logger = new Logger(BoldService.name);
  private readonly apiUrl = 'https://integrations.api.bold.co/online/link/v1';

  constructor(private configService: ConfigService) {}

  async createPaymentLink(
    orderData: {
      orderId: string;
      totalAmount: number;
      currency: string;
      description: string;
      customerName?: string;
      customerEmail?: string;
    },
    boldApiKey: string,
    redirectUrl: string,
    notificationUrl: string,
  ): Promise<BoldPaymentLinkResponse> {
    try {
      if (!boldApiKey) {
        throw new BadRequestException('Bold API Key is missing for this tenant.');
      }

      // Convert amount to the lowest denominator (eg. cents for USD, but for COP it is usually just the integer value or multiplied by 100 based on Bold's specific requirements.
      // Bold specifies amount must be in the smallest currency unit. For COP usually * 100, but we should safely calculate it. 
      // Assuming COP, you multiply by 100. Let's do a safe conversion.
      // In Bold Link v1, amount for COP is just the integer amount without cents.
      // Wait, double checking if it needs to be in cents. If the error says 'amount is invalid' later, we can multiply by 100.
      // Actually, standard in Colombia for Bold is the exact amount. But let's leave * 100 if that was standard? No, wait. Bold's swagger says "Amount. 0 to 999999999. Do not use commas or points". If COP, $10,000 = 10000. Wompi uses cents. Bold uses flat values. Let's send the exact value.
      const amountInCents = Math.round(orderData.totalAmount);

      const payload = {
        amount_type: "CLOSED",
        amount: amountInCents,
        currency: orderData.currency || 'COP',
        description: orderData.description || `Orden ${orderData.orderId}`,
        redirect_url: redirectUrl,
        notification_url: notificationUrl,
        reference: orderData.orderId,
      };

      this.logger.log(`Creating Bold payment link for order ${orderData.orderId}...`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `apiKey ${boldApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Error from Bold API: ${errorData}`);
        throw new BadRequestException('Error al comunicarse con pasarela Bold');
      }

      const data = await response.json();
      
      // La API de bold devuelve una URL de pago en data.payment_link
      if (!data || !data.payment_link) {
         this.logger.error('Unexpected response format from Bold API', data);
         throw new BadRequestException('Formato de respuesta inválido de Bold');
      }

      return {
        payment_link: data.payment_link,
      };
    } catch (error) {
      this.logger.error(`Failed to create Bold payment link: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      throw new BadRequestException('No se pudo generar el link de pago con Bold');
    }
  }
}
