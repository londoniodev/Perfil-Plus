import { IsString, IsOptional, IsBoolean, IsNumber, Min, IsUrl } from 'class-validator';

export class CreateEbookDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsUrl()
    coverImage: string;

    @IsUrl()
    fileUrl: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdateEbookDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    coverImage?: string;

    @IsOptional()
    @IsUrl()
    fileUrl?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}
