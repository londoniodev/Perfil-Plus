import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from '../events/order.events';

@Injectable()
export class WhatsappNotificationListener {
  private readonly logger = new Logger(WhatsappNotificationListener.name);

  // constructor(private readonly notificationService: OrderNotificationService) {} // Inject WhatsApp API Service here

  @OnEvent('order.created', { async: true })
  async handleNewOrderNotification(event: OrderCreatedEvent) {
    try {
      const { order, dto } = event;
      if (!dto.customerPhone || dto.customerPhone === '0000000000') return;

      this.logger.log(
        `[WhatsApp API Job] Enviando confirmación de nueva orden a ${dto.customerPhone}`,
      );
      // Lógica de llamada externa a Meta / WhatsApp Cloud API
      // await this.notificationService.sendOrderConfirmation(order);
    } catch (error) {
      this.logger.error(
        `Error enviando WhatsApp de nueva orden: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent('order.status_changed', { async: true })
  async handleStatusChangeNotification(event: OrderStatusChangedEvent) {
    try {
      const { orderId, newStatus } = event;
      this.logger.log(
        `[WhatsApp API Job] Enviando update de status (${newStatus}) para orden ${orderId}`,
      );
      // Lógica de llamada externa a Meta / WhatsApp Cloud API
      // await this.notificationService.sendOrderStatusUpdate(orderId, newStatus);
    } catch (error) {
      this.logger.error(
        `Error enviando WhatsApp de status change: ${error.message}`,
        error.stack,
      );
    }
  }
}
