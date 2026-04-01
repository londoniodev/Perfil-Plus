import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { MetaApiService } from '../whatsapp/services/meta-api.service';

interface OrderCreatedPayload {
  tenantId: string;
  customerPhone: string;
  orderNumber: string;
  totalAmount: number;
  orderType: string;
  paymentMethod: string;
}

@Injectable()
export class OrderNotificationListener {
  private readonly logger = new Logger(OrderNotificationListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaApiService: MetaApiService,
    private readonly cls: ClsService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(payload: OrderCreatedPayload) {
    const {
      tenantId,
      customerPhone,
      orderNumber,
      totalAmount,
      orderType,
      paymentMethod,
    } = payload;

    this.logger.log(
      `[Tenant: ${tenantId}] Notificando orden ${orderNumber} a ${customerPhone}`,
    );

    try {
      // Buscar si este teléfono es de una conversación de WhatsApp activa
      let storeSetting;
      await this.cls.runWith({ tenantId } as any, async () => {
        storeSetting = await this.prisma.storeSettings.findFirst({
          select: { waPhoneNumberId: true },
        });
      });

      if (!storeSetting?.waPhoneNumberId) {
        this.logger.log(
          `[Tenant: ${tenantId}] Sin WhatsApp configurado, omitiendo notificación.`,
        );
        return;
      }

      // Formatear precio
      const priceFormatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(totalAmount);

      // Formatear método de pago
      const paymentLabels: Record<string, string> = {
        CASH: 'Efectivo',
        CARD: 'Tarjeta',
        TRANSFER: 'Transferencia',
        MERCADOPAGO: 'Mercado Pago',
      };
      const paymentLabel = paymentLabels[paymentMethod] || paymentMethod;

      // Formatear tipo de entrega
      const orderTypeLabels: Record<string, string> = {
        DELIVERY: 'Domicilio',
        PICKUP: 'Recoger en tienda',
        DINE_IN: 'En mesa',
        TAKE_AWAY: 'Para llevar',
      };
      const orderTypeLabel = orderTypeLabels[orderType] || orderType;

      const message = [
        `✅ *¡Pedido #${orderNumber} confirmado!*`,
        ``,
        `💰 Total: ${priceFormatted} (${paymentLabel})`,
        `📦 Entrega: ${orderTypeLabel}`,
        `🕐 Tiempo estimado: 30-45 min`,
        ``,
        `Tu pedido ya está en preparación. ¡Gracias por tu compra! 🎉`,
      ].join('\n');

      await this.metaApiService.sendTextMessage(
        tenantId,
        storeSetting.waPhoneNumberId,
        customerPhone,
        message,
      );

      this.logger.log(
        `[Tenant: ${tenantId}] Confirmación WhatsApp enviada a ${customerPhone}`,
      );
    } catch (error) {
      // Non-blocking: no queremos que un fallo de notificación afecte la orden
      this.logger.error(
        `[Tenant: ${tenantId}] Error enviando confirmación WhatsApp: ${error.message}`,
        error.stack,
      );
    }
  }
}
