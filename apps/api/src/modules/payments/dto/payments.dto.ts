import { IsString, IsOptional, IsEmail, IsNumber, IsIn, IsUrl } from 'class-validator';

// ==================== SUBSCRIPTION DTOs ====================
export class CreateSubscriptionDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    frontUrl?: string;
}

