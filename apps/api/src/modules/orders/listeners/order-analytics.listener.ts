import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from '../events/order.events';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class OrderAnalyticsListener {
  private readonly logger = new Logger(OrderAnalyticsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreatedEvent(event: OrderCreatedEvent) {
    try {
      const { order, dto } = event;
      const analyticsData: any = {
        orderId: order.id,
        pendingAt: order.createdAt,
      };

      if (dto.status === 'PREPARING') {
        analyticsData.preparingAt = new Date();
        analyticsData.timeToPrepare = 0;
      }

      // Important: Since this is background, CLS might not have context. We must use simple queries.
      await this.cls.runWith({ tenantId: event.tenantId } as any, async () => {
        await this.prisma.orderDeliveryAnalytics.upsert({
          where: { orderId: order.id },
          create: analyticsData,
          update: analyticsData,
        });
      });

      this.logger.log(`Analíticas creadas para orden ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(
        `Error procesando analíticas para orden ${event.order?.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('order.status_changed', { async: true })
  async handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    try {
      if (['PENDING', 'CANCELLED'].includes(event.newStatus)) return;

      await this.cls.runWith({ tenantId: event.tenantId } as any, async () => {
        const record = await this.prisma.orderDeliveryAnalytics.findUnique({
          where: { orderId: event.orderId },
        });
        if (!record) return;

        const now = new Date();
        const updates: any = {};

        switch (event.newStatus) {
          case 'PREPARING':
            if (!record.preparingAt) {
              updates.preparingAt = now;
              updates.timeToPrepare = record.pendingAt
                ? Math.max(
                    0,
                    Math.floor(
                      (now.getTime() - record.pendingAt.getTime()) / 60000,
                    ),
                  )
                : 0;
            }
            break;
          case 'READY':
            if (!record.shippedAt) {
              updates.shippedAt = now;
              updates.timeToShip = record.preparingAt
                ? Math.max(
                    0,
                    Math.floor(
                      (now.getTime() - record.preparingAt.getTime()) / 60000,
                    ),
                  )
                : 0;
            }
            break;
          case 'SERVED':
            if (!record.deliveredAt) {
              updates.deliveredAt = now;
              updates.timeToDelivery = record.pendingAt
                ? Math.max(
                    0,
                    Math.floor(
                      (now.getTime() - record.pendingAt.getTime()) / 60000,
                    ),
                  )
                : 0;
            }
            break;
          default:
            break;
        }

        if (Object.keys(updates).length > 0) {
          await this.prisma.orderDeliveryAnalytics.update({
            where: { id: record.id },
            data: updates,
          });
          this.logger.log(
            `Analíticas actualizadas para orden (ID: ${event.orderId})`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Error actualizando analíticas para orden ${event.orderId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
