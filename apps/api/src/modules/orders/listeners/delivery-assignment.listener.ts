import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderStatusChangedEvent } from '../events/order.events';
// import { DeliveryService } from '../../delivery/delivery.service'; // To be implemented or injected

@Injectable()
export class DeliveryAssignmentListener {
  private readonly logger = new Logger(DeliveryAssignmentListener.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly deliveryService: DeliveryService,
  ) {}

  @OnEvent('order.status_changed', { async: true })
  async handleDeliveryAssignment(event: OrderStatusChangedEvent) {
    try {
      const { orderId, newStatus, tenantId } = event;

      // Solo asignamos delivery si la orden pasa a READY
      if (newStatus !== 'READY') return;

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order || order.orderType !== 'DELIVERY') return;

      this.logger.log(`[Delivery] Asignando conductor para orden DELIVERY ${order.orderNumber}`);
      
      // Aquí el DeliveryService tomaría la responsabilidad
      // await this.deliveryService.assignDriverToOrder(tenantId, orderId);

    } catch (error) {
      this.logger.error(`Error asignando conductor a orden ${event.orderId}: ${error.message}`, error.stack);
    }
  }
}
