import { Order } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';

export class OrderCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly order: Order,
    public readonly dto: CreateOrderDto,
    /** IP real del comprador (enviada por Next.js via header x-client-ip) */
    public readonly clientIp?: string,
    /** User-Agent real del navegador del comprador */
    public readonly clientUserAgent?: string,
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly order?: Order,
  ) {}
}
