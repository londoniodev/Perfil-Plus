/**
 * Estructura de configuración de tenant almacenada en SystemSetting.TENANT_CONFIG
 * Usada por Platform y aplicaciones de tenant para leer/escribir configuración
 */
export interface TenantConfigValue {
    name?: string;
    slug?: string;
    currency?: string;
    mercadopago?: {
        publicKey?: string;
        accessToken?: string;
        webhookSecret?: string;
        clientId?: string;
        clientSecret?: string;
    };
    smtp?: {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: {
            user?: string;
            pass?: string;
        };
    };
    features?: {
        blog?: boolean;
        store?: boolean;
        lms?: boolean;
        restaurant?: boolean;
    };
    theme?: string;
    primary_color?: string;
    api_key_openai?: string;
    social?: {
        whatsapp?: string;
        instagram?: string;
        facebook?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
    };
}

/**
 * Versión aplanada de TenantConfigValue para formularios
 * Usada por el panel de configuración en Platform
 */
export interface FlattenedTenantConfig {
    tenant_name: string;
    theme: string;
    primary_color: string;
    currency: string;
    enable_blog: boolean;
    enable_store: boolean;
    enable_lms: boolean;
    enable_restaurant: boolean;
    api_key_openai: string;
    mp_public_key: string;
    mp_access_token: string;
    mp_webhook_secret: string;
    mp_client_id: string;
    mp_client_secret: string;
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_pass: string;
    social_whatsapp: string;
    social_instagram: string;
    social_facebook: string;
    social_twitter: string;
    social_youtube: string;
    social_tiktok: string;
}

/**
 * Convierte TenantConfigValue a formato aplanado para formularios
 */
export function flattenTenantConfig(config: TenantConfigValue): FlattenedTenantConfig {
    return {
        tenant_name: config.name || "",
        theme: config.theme || "",
        primary_color: config.primary_color || "#000000",
        currency: config.currency || "COP",
        enable_blog: config.features?.blog !== false,
        enable_store: config.features?.store !== false,
        enable_lms: config.features?.lms === true,
        enable_restaurant: config.features?.restaurant === true,
        api_key_openai: config.api_key_openai || "",
        mp_public_key: config.mercadopago?.publicKey || "",
        mp_access_token: config.mercadopago?.accessToken || "",
        mp_webhook_secret: config.mercadopago?.webhookSecret || "",
        mp_client_id: config.mercadopago?.clientId || "",
        mp_client_secret: config.mercadopago?.clientSecret || "",
        smtp_host: config.smtp?.host || "",
        smtp_port: config.smtp?.port || 587,
        smtp_secure: config.smtp?.secure || false,
        smtp_user: config.smtp?.auth?.user || "",
        smtp_pass: config.smtp?.auth?.pass || "",
        social_whatsapp: config.social?.whatsapp || "",
        social_instagram: config.social?.instagram || "",
        social_facebook: config.social?.facebook || "",
        social_twitter: config.social?.twitter || "",
        social_youtube: config.social?.youtube || "",
        social_tiktok: config.social?.tiktok || "",
    };
}

/**
 * Convierte formato aplanado de vuelta a TenantConfigValue
 */
export function unflattenTenantConfig(flat: FlattenedTenantConfig): TenantConfigValue {
    return {
        name: flat.tenant_name,
        theme: flat.theme,
        primary_color: flat.primary_color,
        currency: flat.currency,
        api_key_openai: flat.api_key_openai,
        mercadopago: {
            publicKey: flat.mp_public_key,
            accessToken: flat.mp_access_token,
            webhookSecret: flat.mp_webhook_secret,
            clientId: flat.mp_client_id,
            clientSecret: flat.mp_client_secret,
        },
        smtp: {
            host: flat.smtp_host,
            port: flat.smtp_port,
            secure: flat.smtp_secure,
            auth: {
                user: flat.smtp_user,
                pass: flat.smtp_pass,
            },
        },
        features: {
            blog: flat.enable_blog,
            store: flat.enable_store,
            lms: flat.enable_lms,
            restaurant: flat.enable_restaurant,
        },
        social: {
            whatsapp: flat.social_whatsapp,
            instagram: flat.social_instagram,
            facebook: flat.social_facebook,
            twitter: flat.social_twitter,
            youtube: flat.social_youtube,
            tiktok: flat.social_tiktok,
        },
    };
}
