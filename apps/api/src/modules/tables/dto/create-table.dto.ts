import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTableDto {
    @IsString()
    @IsNotEmpty()
    label: string;

    @IsNumber()
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    x?: number;

    @IsNumber()
    @IsOptional()
    y?: number;
}
