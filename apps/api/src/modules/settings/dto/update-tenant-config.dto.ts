import { IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateTenantConfigDto {
    // Store Info
    @IsObject()
    @IsOptional()
    storeInfo?: Record<string, any>;

    // Payment Methods
    @IsObject()
    @IsOptional()
    paymentMethods?: Record<string, any>;

    // Shipping Methods
    @IsObject()
    @IsOptional()
    shippingMethods?: Record<string, any>;

    // Appearance
    @IsObject()
    @IsOptional()
    appearance?: Record<string, any>;

    // Social Links
    @IsObject()
    @IsOptional()
    socialLinks?: Record<string, any>;

    // Policies
    @IsObject()
    @IsOptional()
    policies?: Record<string, any>;

    // --------------------------------------------------------
    // Campos que el frontend (update-settings action) envía
    // como propiedades planas del config
    // --------------------------------------------------------

    @IsString()
    @IsOptional()
    theme?: string;

    @IsString()
    @IsOptional()
    primary_color?: string;

    @IsString()
    @IsOptional()
    api_key_openai?: string;

    @IsObject()
    @IsOptional()
    mercadopago?: Record<string, any>;

    @IsObject()
    @IsOptional()
    smtp?: Record<string, any>;

    @IsObject()
    @IsOptional()
    contact?: Record<string, any>;

    @IsObject()
    @IsOptional()
    menu?: Record<string, any>;

    // Store basics (también enviados planos por el form)
    @IsString()
    @IsOptional()
    storeName?: string;

    @IsString()
    @IsOptional()
    storeEmail?: string;

    @IsString()
    @IsOptional()
    currency?: string;

    // --- NUEVAS CONFIGURACIONES SAAS ---
    @IsBoolean()
    @IsOptional()
    orderTrackingEnabled?: boolean;
}
