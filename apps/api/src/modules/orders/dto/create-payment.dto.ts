import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    amount: number;

    @IsString()
    method: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    itemIds?: string[];

    @IsOptional()
    @IsBoolean()
    closeOrder?: boolean;
}
