import { IsEnum } from 'class-validator';
import { OrderStatus } from '@alvarosky/database';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
