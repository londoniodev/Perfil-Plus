/**
 * SINGLE SOURCE OF TRUTH — Features disponibles para provisioning de tenants.
 * Los `value` son UPPERCASE y coinciden EXACTAMENTE con lo almacenado en Tenant.features[] en la DB.
 */
export const AVAILABLE_FEATURES = [
    { value: 'SHOP',        label: 'Tienda (E-commerce)',   description: 'Catálogo de productos, carrito y checkout' },
    { value: 'BLOG',        label: 'Blog / Noticias',       description: 'Sistema de artículos y publicaciones' },
    { value: 'LMS',         label: 'Academia (LMS)',        description: 'Cursos, lecciones y certificados' },
    { value: 'RESTAURANT',  label: 'Restaurante',           description: 'Menú digital, pedidos y comandas' },
    { value: 'HAS_DIGITAL_MENU',     label: 'Menú Digital',          description: 'Habilita la visualización del menú QR' },
    { value: 'HAS_WEB_CHECKOUT',      label: 'Checkout Web',          description: 'Habilita pedidos y pagos vía web' },
    { value: 'HAS_WHATSAPP_CHECKOUT', label: 'Checkout WhatsApp',     description: 'Habilita pedidos vía WhatsApp' },
    { value: 'HAS_POS',               label: 'Punto de Venta (POS)',  description: 'Habilita terminal presencial y comandas' },
    { value: 'POS',         label: 'Punto de Venta (Legacy)', description: 'Terminal de ventas presenciales' },
    { value: 'INVENTORY',   label: 'Inventario',            description: 'Gestión de bodegas y stock' },
    { value: 'ANALYTICS',   label: 'Analítica',             description: 'Dashboards y reportes avanzados' },
    { value: 'DASHBOARD',   label: 'Panel de Admin',        description: 'Acceso al panel de administración' },
    { value: 'SETTINGS',    label: 'Configuración',         description: 'Ajustes avanzados del tenant' },
    { value: 'PORTFOLIO',   label: 'Portafolio',            description: 'Galería de trabajos y proyectos' },
    { value: 'BOT_WHATSAPP',label: 'Bot WhatsApp (CRM)',    description: 'Automatización de mensajes por WhatsApp' },
    { value: 'LANDING',     label: 'Landing / Sitio Web',   description: 'Sitio web público con páginas dinámicas desde S3' },
] as const;

/** Tipo literal union de todos los features válidos (ej. 'SHOP' | 'BLOG' | ...) */
export type TenantFeature = typeof AVAILABLE_FEATURES[number]['value'];

/** @deprecated Usa TenantFeature en su lugar */
export type FeatureKey = TenantFeature;

/** Array plano de values para validación Zod */
export const VALID_FEATURE_VALUES = AVAILABLE_FEATURES.map(f => f.value) as unknown as readonly [TenantFeature, ...TenantFeature[]];

export interface FeatureRoute {
    label: string;
    href: string;
}

/**
 * Diccionario declarativo: Feature (uppercase, tal como está en la DB) → Ruta pública por defecto.
 * Single Source of Truth para la navegación dinámica basada en features del tenant.
 * Consumido por: _template (MarketingLayout), saas_dashboard, y cualquier app del monorepo.
 */
export const FEATURE_ROUTES = {
    SHOP:       { label: 'Tienda',  href: '/tienda' },
    BLOG:       { label: 'Blog',    href: '/blog' },
    LMS:        { label: 'Cursos',  href: '/formacion' },
    RESTAURANT: { label: 'Menú',    href: '/menu' },
    LANDING:    { label: 'Inicio',  href: '/' },
} satisfies Record<string, FeatureRoute>;
