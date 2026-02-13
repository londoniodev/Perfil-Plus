import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsInt,
    Min,
    ValidateNested,
    IsArray,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModifierDto {
    @IsString()
    name: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    priceAdjustment?: number = 0;

    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number; // null = sin límite

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean = true;
}

export class CreateModifierGroupDto {
    @IsString()
    name: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    minSelect?: number = 0;

    @IsInt()
    @Min(1)
    @IsOptional()
    maxSelect?: number = 1;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateModifierDto)
    modifiers: CreateModifierDto[];
}
