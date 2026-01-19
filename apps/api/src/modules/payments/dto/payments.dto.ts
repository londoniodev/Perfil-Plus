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

export class WebhookPaymentDto {
    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    live_mode?: string;

    @IsString()
    type: string;

    @IsOptional()
    date_created?: string;

    @IsOptional()
    user_id?: string;

    @IsOptional()
    api_version?: string;

    @IsString()
    action: string;

    data: {
        id: string;
    };
}

// ==================== EBOOK PURCHASE DTOs ====================
export class CreateEbookPurchaseDto {
    @IsString()
    ebookId: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    frontUrl?: string;
}

