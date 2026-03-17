import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { InventoryUnit } from '@alvarosky/database';

export class CreateInventoryItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsEnum(InventoryUnit)
  @IsOptional()
  unit?: InventoryUnit;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateInventoryItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsEnum(InventoryUnit)
  @IsOptional()
  unit?: InventoryUnit;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateWarehouseDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class StockEntryDto {
  @IsString()
  inventoryItemId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class StockExitDto {
  @IsString()
  inventoryItemId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class StockTransferDto {
  @IsString()
  inventoryItemId: string;

  @IsString()
  fromWarehouseId: string;

  @IsString()
  toWarehouseId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
