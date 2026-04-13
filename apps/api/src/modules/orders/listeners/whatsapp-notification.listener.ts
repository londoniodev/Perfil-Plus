import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from '../events/order.events';
import { MetaApiService } from '../../whatsapp/services/meta-api.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class WhatsappNotificationListener {
  private readonly logger = new Logger(WhatsappNotificationListener.name);

  constructor(
    private readonly metaApiService: MetaApiService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleNewOrderNotification(event: OrderCreatedEvent) {
    try {
      const { order, dto, tenantId } = event;
      if (!dto.customerPhone || dto.customerPhone === '0000000000') return;

      // Obtener datos del tenant para enviar WhatsApp
      const tenantSettings = await this.prisma.tenantSettings.findUnique({
        where: { tenantId },
      });

      const phoneNumberId = tenantSettings?.waPhoneNumberId;
      const isWaBotActive = tenantSettings?.isWaBotActive;

      if (!phoneNumberId || !isWaBotActive) {
        this.logger.log(
          `[Tenant: ${tenantId}] WhatsApp no activo. Omitiendo notificación de nueva orden.`,
        );
        return;
      }

      const orderNumber = (order as any).orderNumber || order.id.slice(-6);
      const total = (order as any).total
        ? `$${Number((order as any).total).toLocaleString('es-CO')}`
        : '';

      const confirmationMessage = `✅ *¡Pedido confirmado!*\n\n📦 Orden *#${orderNumber}*${total ? `\n💰 Total: ${total}` : ''}\n\nTu pedido ha sido recibido y pronto comenzaremos a prepararlo. ¡Gracias por tu compra! 🎉`;

      await this.metaApiService.sendTextMessage(
        tenantId,
        phoneNumberId,
        dto.customerPhone,
        confirmationMessage,
      );

      // Crear notificación en el Hub
      await this.notificationsService.create(
        tenantId,
        `📦 Nueva orden #${orderNumber}`,
        `Cliente: ${dto.customerPhone}${total ? ` — Total: ${total}` : ''}`,
        'NEW_ORDER',
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Confirmación de orden enviada a ${dto.customerPhone}`,
      );
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
      const { orderId, tenantId, newStatus, order } = event;

      // Solo notificamos estados relevantes para el cliente
      const notifiableStatuses = ['PREPARING', 'SHIPPED', 'READY', 'DELIVERED', 'IN_TRANSIT'];
      if (!notifiableStatuses.includes(newStatus)) return;

      const customerPhone = (order as any)?.customerPhone;
      if (!customerPhone || customerPhone === '0000000000') return;

      const tenantSettings = await this.prisma.tenantSettings.findUnique({
        where: { tenantId },
      });

      const phoneNumberId = tenantSettings?.waPhoneNumberId;
      const isWaBotActive = tenantSettings?.isWaBotActive;

      if (!phoneNumberId || !isWaBotActive) return;

      const orderNumber = (order as any)?.orderNumber || orderId.slice(-6);

      const statusMessages: Record<string, string> = {
        PREPARING: `👨‍🍳 *Tu pedido #${orderNumber} se está preparando*\n\n¡Ya estamos cocinando tu pedido! Te avisaremos cuando esté listo.`,
        SHIPPED: `🚀 *Tu pedido #${orderNumber} va en camino*\n\n¡Tu pedido ha salido para entrega! Estará contigo pronto.`,
        IN_TRANSIT: `🏍️ *Tu pedido #${orderNumber} está en tránsito*\n\nEl repartidor va en camino con tu pedido.`,
        READY: `✨ *Tu pedido #${orderNumber} está listo*\n\n¡Tu pedido está listo para recoger!`,
        DELIVERED: `🎉 *Tu pedido #${orderNumber} fue entregado*\n\n¡Esperamos que lo disfrutes! ¡Gracias por tu preferencia!`,
      };

      const message = statusMessages[newStatus];
      if (!message) return;

      await this.metaApiService.sendTextMessage(
        tenantId,
        phoneNumberId,
        customerPhone,
        message,
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Notificación de status ${newStatus} enviada a ${customerPhone} para orden #${orderNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando WhatsApp de status change: ${error.message}`,
        error.stack,
      );
    }
  }
}
