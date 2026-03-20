import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrdersGateway } from '../orders.gateway';
import { OrderCreatedEvent, OrderStatusChangedEvent } from '../events/order.events';

@Injectable()
export class OrderSseListener {
  private readonly logger = new Logger(OrderSseListener.name);

  constructor(private readonly ordersGateway: OrdersGateway) {}

  @OnEvent('order.created', { async: true })
  handleOrderCreated(event: OrderCreatedEvent) {
    try {
      const { order, dto } = event;
      this.ordersGateway.emit(event.tenantId, { 
        type: 'new_order', 
        orderId: order.id, 
        data: order 
      });
      this.logger.log(`Evento de WebSocket emitido para nueva orden (ID: ${order.id})`);
    } catch (error) {
       this.logger.error(`Error emitiendo SSE de orden creada: ${error.message}`, error.stack);
    }
  }

  @OnEvent('order.status_changed', { async: true })
  handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    try {
      this.ordersGateway.emit(event.tenantId, {
        type: 'status_changed',
        orderId: event.orderId,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        data: event.order || {},
      });
      this.logger.log(`Evento de WebSocket emitido para cambio de status de orden (ID: ${event.orderId})`);
    } catch (error) {
       this.logger.error(`Error emitiendo SSE de cambio de status: ${error.message}`, error.stack);
    }
  }
}
