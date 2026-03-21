import { TenantFeature } from "@alvarosky/types";

/**
 * Extrae y parsea limpiamente los módulos (features) activos del Tenant
 * desde sus cabeceras HTTP (inyectadas habitualmente por el Middleware).
 *
 * @param headersList - Instancia ReadonlyHeaders nativa de Next.js (devuelta por `headers()`) o un objeto Headers estándar.
 * @returns Set<TenantFeature> que garantiza búsquedas O(1) consistentes y un tipado fuerte (Single Source of Truth).
 */
export function getTenantFeatures(headersList: Headers | any): Set<TenantFeature> {
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
  
    // Sanitización estricta: trim, UPPERCASE, y eliminar vacíos
    const safeFeatures = parsedArray
      .map((f: string) => f.trim().toUpperCase())
      .filter((f: string) => f.length > 0) as TenantFeature[];

    const finalSet = new Set(safeFeatures);

    // DEBUGGING ACTIVO
    console.log("[DEBUG getTenantFeatures] Raw Header:", rawHeader);
    console.log("[DEBUG getTenantFeatures] Parsed Set:", Array.from(finalSet));

    return finalSet;
}
