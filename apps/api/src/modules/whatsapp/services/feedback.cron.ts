import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { MetaApiService } from './meta-api.service';

@Injectable()
export class FeedbackCronService {
  private readonly logger = new Logger(FeedbackCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaApiService: MetaApiService,
  ) {}

  /**
   * Cada 5 minutos, busca órdenes DELIVERED hace >= 30 min sin feedbackSentAt
   * y envía un mensaje de satisfacción al cliente vía WhatsApp.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleFeedbackCron() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
      // SECURITY EXCEPTION: Global query — iteramos todos los tenants
      const orders = await this.prisma.unscoped.order.findMany({
        where: {
          status: 'DELIVERED',
          updatedAt: { lte: thirtyMinutesAgo },
          feedbackSentAt: null,
          customerPhone: { not: null },
        },
        select: {
          id: true,
          orderNumber: true,
          customerPhone: true,
          tenantId: true,
        },
        take: 20, // Limitar batch para no saturar
      });

      if (orders.length === 0) return;

      this.logger.log(
        `[FeedbackCron] Encontradas ${orders.length} órdenes pendientes de feedback`,
      );

      for (const order of orders) {
        try {
          if (
            !order.customerPhone ||
            order.customerPhone === '0000000000'
          ) {
            // Marcar como enviado para no reintentar
            await this.prisma.unscoped.order.update({
              where: { id: order.id },
              data: { feedbackSentAt: new Date() },
            });
            continue;
          }

          // Obtener waPhoneNumberId del tenant
          const tenantSettings =
            await this.prisma.unscoped.tenantSettings.findUnique({
              where: { tenantId: order.tenantId },
            });

          const phoneNumberId = tenantSettings?.waPhoneNumberId;
          if (!phoneNumberId) {
            this.logger.warn(
              `[FeedbackCron] Tenant ${order.tenantId} no tiene waPhoneNumberId. Omitiendo orden ${order.id}`,
            );
            // Marcar para no reintentar
            await this.prisma.unscoped.order.update({
              where: { id: order.id },
              data: { feedbackSentAt: new Date() },
            });
            continue;
          }

          const feedbackMessage = `¡Hola! 👋 ¿Cómo estuvo tu pedido *#${order.orderNumber || order.id.slice(-6)}*?\n\nQueremos saber tu opinión:\n✅ Si todo estuvo bien, responde *"Bien"*\n💡 Si tienes alguna sugerencia, ¡cuéntanos!`;

          const sent = await this.metaApiService.sendTextMessage(
            order.tenantId,
            phoneNumberId,
            order.customerPhone,
            feedbackMessage,
          );

          if (sent) {
            await this.prisma.unscoped.order.update({
              where: { id: order.id },
              data: { feedbackSentAt: new Date() },
            });
            this.logger.log(
              `[FeedbackCron] Feedback enviado para orden ${order.id} a ${order.customerPhone}`,
            );
          }
        } catch (err) {
          this.logger.error(
            `[FeedbackCron] Error procesando orden ${order.id}: ${err.message}`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        `[FeedbackCron] Error global en cron de feedback: ${err.message}`,
        err.stack,
      );
    }
  }
}
