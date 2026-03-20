import { Order } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';

export class OrderCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly order: Order,
    public readonly dto: CreateOrderDto,
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
