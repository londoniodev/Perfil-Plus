import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdjustmentType } from '@alvarosky/database';

export class CreateInventoryCountDto {
  @IsString()
  warehouseId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CountLineDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  @Min(0)
  countedStock: number;

  @IsEnum(AdjustmentType)
  @IsOptional()
  adjustmentType?: AdjustmentType;
}

export class CompleteInventoryCountDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountLineDto)
  lines: CountLineDto[];
}
