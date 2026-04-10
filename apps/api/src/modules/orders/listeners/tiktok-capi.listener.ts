import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { sendTikTokServerEvent } from '@alvarosky/shared';
import { OrderCreatedEvent } from '../events/order.events';

/**
 * TikTok CAPI Listener — ÚNICO punto de disparo server-side de conversión.
 *
 * Estrategia de Deduplicación:
 * - El `order.id` se usa como `eventId` tanto aquí (server) como en el Browser Pixel (client).
 * - TikTok consolida ambos eventos en una sola conversión gracias al `eventId` compartido.
 *
 * Seguridad:
 * - El `tiktokAccessToken` se lee directamente de la DB (PrismaService) y NUNCA viaja al frontend.
 * - Este listener es async y non-blocking: un fallo de TikTok no interrumpe la creación de la orden.
 *
 * IP/UA:
 * - El controller extrae `x-client-ip` y `x-client-user-agent` del request HTTP
 *   (enviados por Next.js Server Action) y los propaga vía OrderCreatedEvent.
 * - Si no hay IP (flujo POS/Kitchen), se usa la IP del servidor como fallback.
 */
@Injectable()
export class TikTokCapiListener {
  private readonly logger = new Logger(TikTokCapiListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent) {
    const { tenantId, order, clientIp, clientUserAgent } = event;

    try {
      // Leer credenciales TikTok del tenant (acceso directo a DB — NO depende de CLS)
      const tenantSettings = await this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: {
          tiktokPixelId: true,
          tiktokAccessToken: true,
        },
      });

      // Guard clause: Sin credenciales TikTok configuradas → no intentar
      if (!tenantSettings?.tiktokPixelId || !tenantSettings?.tiktokAccessToken) {
        return;
      }

      // Leer currency del tenant (SystemSetting global)
      let tenantCurrency = 'COP';
      const currencySetting = await this.prisma.systemSetting.findUnique({
        where: {
          tenantId_key: { tenantId, key: 'currency' },
        },
        select: { value: true },
      });
      if (currencySetting?.value) {
        tenantCurrency = String(currencySetting.value);
      }

      const success = await sendTikTokServerEvent({
        pixelCode: tenantSettings.tiktokPixelId,
        accessToken: tenantSettings.tiktokAccessToken,
        eventName: 'CompletePayment',
        eventId: order.id,
        userIp: clientIp || '0.0.0.0',
        userAgent: clientUserAgent || 'server-side',
        totalAmount: Number(order.totalAmount),
        currency: tenantCurrency,
      });

      if (success) {
        this.logger.log(
          `[Tenant: ${tenantId}] TikTok CAPI event sent for order ${order.orderNumber} (eventId: ${order.id})`,
        );
      }
    } catch (error) {
      // Non-blocking: un fallo de tracking JAMÁS interrumpe el flujo de la orden
      this.logger.error(
        `[Tenant: ${tenantId}] Error sending TikTok CAPI event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
