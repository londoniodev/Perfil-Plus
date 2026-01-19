import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '@prisma/client';

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
}

