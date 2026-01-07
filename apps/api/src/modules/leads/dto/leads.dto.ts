import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class CreateLeadDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsString()
    source: string; // landing, blog, servicios, lms, ebook

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class LeadQueryDto {
    @IsOptional()
    @IsString()
    source?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;
}
