import { IsObject, IsOptional } from 'class-validator';

export class UpdateTenantConfigDto {
    @IsObject()
    @IsOptional()
    storeInfo?: Record<string, any>;

    @IsObject()
    @IsOptional()
    paymentMethods?: Record<string, any>;

    @IsObject()
    @IsOptional()
    shippingMethods?: Record<string, any>;

    @IsObject()
    @IsOptional()
    appearance?: Record<string, any>;

    @IsObject()
    @IsOptional()
    socialLinks?: Record<string, any>;

    @IsObject()
    @IsOptional()
    policies?: Record<string, any>;
}
