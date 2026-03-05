import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, OrderStatus } from '@prisma/client';

export class OrderItemModifierDto {
  @IsString()
  modifierId: string;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class CreateOrderItemDto {
  @IsString()
  variantId: string;

  @IsInt()
  @Min(1)
  quantity: number = 1;

  @IsString()
  @IsOptional()
  notes?: string; // "Sin sal", "Alergia al maní"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  @IsOptional()
  modifiers?: OrderItemModifierDto[];
}

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType = OrderType.DINE_IN;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  tableNumber?: string; // Solo para DINE_IN

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsOptional()
  shippingData?: any; // JSON with address, city

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
