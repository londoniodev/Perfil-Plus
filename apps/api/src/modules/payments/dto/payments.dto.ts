import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsIn,
  IsUrl,
} from 'class-validator';

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
}

export class CreateCheckoutDto {
  items: CheckoutItemDto[];

  @IsOptional()
  @IsString()
  frontUrl?: string;

  @IsOptional()
  customer?: CheckoutCustomerDto;
}
