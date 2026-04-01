import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { OrderCreatedEvent } from '../events/order.events';

@Injectable()
export class CustomerLeadListener {
  private readonly logger = new Logger(CustomerLeadListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleCustomerLead(event: OrderCreatedEvent) {
    try {
      const { tenantId, order, dto } = event;
      const { customerPhone, customerName, orderType, shippingData } = dto;

      if (!customerPhone || customerPhone === '0000000000') return;

      // Ensure Prisma raw queries/updates work effectively without transaction context

      await this.cls.runWith({ tenantId } as any, async () => {
        // 1. Manejo del Lead
        const existingLead = await this.prisma.lead.findFirst({
          where: { phone: customerPhone, tenantId },
        });

        if (!existingLead) {
          await this.prisma.lead.create({
            data: {
              tenantId,
              phone: customerPhone,
              name: customerName || null,
              email: null,
              source: 'Menu Checkout',
              status: 'new',
            },
          });
          this.logger.log(`Nuevo Lead creado (Phone: ${customerPhone})`);
        } else if (customerName && !existingLead.name) {
          await this.prisma.lead.update({
            where: { id: existingLead.id },
            data: { name: customerName },
          });
        }

        // 2. Manejo de waCustomer
        if (orderType === 'DELIVERY' || orderType === 'TAKE_AWAY') {
          const shipping = shippingData;
          await this.prisma.waCustomer.upsert({
            where: { tenantId_phone: { tenantId, phone: customerPhone } },
            update: {
              name: customerName || undefined,
              address: shipping?.address || undefined,
              lat: shipping?.lat ? parseFloat(shipping.lat) : undefined,
              lng: shipping?.lng ? parseFloat(shipping.lng) : undefined,
            },
            create: {
              tenantId,
              phone: customerPhone,
              name: customerName || null,
              address: shipping?.address || null,
              lat: shipping?.lat ? parseFloat(shipping.lat) : null,
              lng: shipping?.lng ? parseFloat(shipping.lng) : null,
            },
          });
          this.logger.log(
            `Customer Data upsert para WhatsApp (Phone: ${customerPhone})`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Error procesando Customer Leads para orden ${event.order?.id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
