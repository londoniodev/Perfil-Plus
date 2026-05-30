import { TenantFeature } from '@alvarosky/features';

/**
 * Fase 2: Capa Compartida (Single Source of Truth)
 * Implementación de validación de capacidades atómicas y mapeo de planes.
 */

export { TenantFeature };

/**
 * Función pura y estrictamente tipada para validar features.
 * @param tenantFeatures - Set de features activas del tenant.
 * @param requiredFeature - Feature requerida para la acción o UI.
 */
export const checkTenantFeature = (
  tenantFeatures: Set<TenantFeature>, 
  requiredFeature: TenantFeature
): boolean => {
  return tenantFeatures.has(requiredFeature);
};

/**
 * Diccionario de Mapeo Comercial a Técnico.
 * Centraliza la definición de qué capacidades otorga cada plan comercial.
 */
export const PLAN_FEATURE_MAP: Record<string, TenantFeature[]> = {
  'solo_menu_qr': ['HAS_DIGITAL_MENU'],
  'ecommerce_whatsapp': ['HAS_DIGITAL_MENU', 'HAS_WHATSAPP_CHECKOUT'],
  'ecommerce_full': ['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT'],
  'restaurant_pos': ['HAS_DIGITAL_MENU', 'HAS_WEB_CHECKOUT', 'HAS_WHATSAPP_CHECKOUT', 'HAS_POS'],
};
