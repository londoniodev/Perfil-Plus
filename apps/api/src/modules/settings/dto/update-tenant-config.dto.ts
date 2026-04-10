import { IsObject, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

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
  tenant_name?: string;

  @IsString()
  @IsOptional()
  primary_color?: string;

  @IsString()
  @IsOptional()
  secondary_color?: string;

  @IsString()
  @IsOptional()
  mp_public_key?: string;

  @IsString()
  @IsOptional()
  mp_access_token?: string;

  @IsString()
  @IsOptional()
  mp_webhook_secret?: string;

  @IsString()
  @IsOptional()
  mp_client_id?: string;

  @IsString()
  @IsOptional()
  mp_client_secret?: string;

  @IsString()
  @IsOptional()
  api_key_openai?: string;

  @IsObject()
  @IsOptional()
  mercadopago?: Record<string, any>;

  @IsObject()
  @IsOptional()
  MERCADOPAGO_CONFIG?: Record<string, any>;

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

  @IsBoolean()
  @IsOptional()
  orderTrackingEnabled?: boolean;

  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  waPhoneNumberId?: string;

  @IsString()
  @IsOptional()
  wabaId?: string;

  @IsBoolean()
  @IsOptional()
  enableBlog?: boolean;

  @IsBoolean()
  @IsOptional()
  enableStore?: boolean;

  @IsBoolean()
  @IsOptional()
  enableLMS?: boolean;

  // Social
  @IsString()
  @IsOptional()
  social_whatsapp?: string;

  @IsString()
  @IsOptional()
  social_instagram?: string;

  @IsString()
  @IsOptional()
  social_facebook?: string;

  @IsString()
  @IsOptional()
  social_twitter?: string;

  @IsString()
  @IsOptional()
  social_tiktok?: string;

  @IsString()
  @IsOptional()
  social_youtube?: string;

  // SMTP
  @IsString()
  @IsOptional()
  smtp_host?: string;

  @IsString()
  @IsOptional()
  smtp_port?: string;

  @IsString()
  @IsOptional()
  smtp_user?: string;

  @IsString()
  @IsOptional()
  smtp_pass?: string;

  @IsString()
  @IsOptional()
  tenant_slug?: string;

  @IsString()
  @IsOptional()
  layout_type?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  menuSlogan?: string;

  @IsString()
  @IsOptional()
  hero_image?: string;

  // Claves camelCase usadas por Dashboard
  @IsString()
  @IsOptional()
  mpWebhookSecret?: string;

  @IsString()
  @IsOptional()
  mpClientId?: string;

  @IsString()
  @IsOptional()
  mpClientSecret?: string;

  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsOptional()
  smtpPort?: string | number;

  @IsOptional()
  smtpSecure?: boolean;

  @IsString()
  @IsOptional()
  smtpUser?: string;

  @IsString()
  @IsOptional()
  smtpPass?: string;

  // BOLD / Multi-tenant payments
  @IsString()
  @IsOptional()
  activePaymentProvider?: string;

  @IsString()
  @IsOptional()
  boldApiKey?: string;

  @IsString()
  @IsOptional()
  boldSecretKey?: string;

  // TikTok Tracking (Pixel + CAPI)
  @IsString()
  @IsOptional()
  tiktokPixelId?: string;

  @IsString()
  @IsOptional()
  tiktokAccessToken?: string;

  // Business Hours (horarios de atención)
  @IsObject()
  @IsOptional()
  businessHours?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  costingMarginGood?: number;

  @IsNumber()
  @IsOptional()
  costingMarginLow?: number;
}
