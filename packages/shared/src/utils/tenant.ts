import { TenantFeature, AVAILABLE_FEATURES } from "@alvarosky/types";

/**
 * Extrae y parsea limpiamente los módulos (features) activos del Tenant
 * desde sus cabeceras HTTP (inyectadas habitualmente por el Middleware).
 *
 * @param headersList - Instancia de Headers (nativo o de Next.js `headers()`).
 * @returns Set<TenantFeature> que garantiza búsquedas O(1) y validación contra el SSOT.
 */
export function getTenantFeatures(headersList: Headers): Set<TenantFeature> {
    const rawHeader = headersList.get("x-tenant-features") || "";
    let parsedArray: string[] = [];
  
    try {
      // Intento 1: Es un JSON array válido?
      if (rawHeader.startsWith("[") && rawHeader.endsWith("]")) {
        parsedArray = JSON.parse(rawHeader);
      } else {
        // Intento 2: Es un CSV (Comma Separated Values)
        parsedArray = rawHeader.split(",");
      }
    } catch (e) {
      parsedArray = rawHeader.split(",");
    }
  
    // Sanitización estricta y validación contra el SSOT (AVAILABLE_FEATURES)
    const validFeatures = parsedArray
        .map((f: string) => f.trim().toUpperCase())
        .filter((f: string) => AVAILABLE_FEATURES.some(feat => feat.value === f)) as TenantFeature[];
  
    return new Set(validFeatures);
}
