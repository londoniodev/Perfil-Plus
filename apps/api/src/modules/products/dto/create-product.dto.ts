import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '@alvarosky/database';
import { CreateModifierGroupDto } from './create-modifier-group.dto';

export class CreateProductVariantDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsOptional()
  attributes?: any;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  basePrice: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  @IsOptional()
  digitalFileUrl?: string;

  @IsString()
  @IsOptional()
  previewUrl?: string;

  @IsOptional()
  specs: any; // JSONB flexible

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  // Initial Inventory (Auto-create default variant)
  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];

  // Restaurante: Grupos de modificadores (opcional)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierGroupDto)
  @IsOptional()
  modifierGroups?: CreateModifierGroupDto[];
}
