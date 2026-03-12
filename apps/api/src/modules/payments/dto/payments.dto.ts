import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsIn,
  IsUrl,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== SUBSCRIPTION DTOs ====================
export class CreateSubscriptionDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  frontUrl?: string;
}

// ==================== CHECKOUT DTOs ====================

export class CheckoutItemDto {
  @IsString()
  variantId: string;

  @IsNumber()
  quantity: number;
}

export class CheckoutCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsString()
  identification?: string;
}

export class CreateCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsOptional()
  @IsString()
  frontUrl?: string;

  @IsOptional()
  customer?: CheckoutCustomerDto;

  @IsOptional()
  @IsString()
  existingOrderId?: string;
}
