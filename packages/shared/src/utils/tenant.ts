import { TenantFeature } from "@alvarosky/types";

/**
 * Extrae y parsea limpiamente los módulos (features) activos del Tenant
 * desde sus cabeceras HTTP (inyectadas habitualmente por el Middleware).
 *
 * @param headersList - Instancia ReadonlyHeaders nativa de Next.js (devuelta por `headers()`) o un objeto Headers estándar.
 * @returns Set<TenantFeature> que garantiza búsquedas O(1) consistentes y un tipado fuerte (Single Source of Truth).
 */
export function getTenantFeatures(headersList: Headers | any): Set<TenantFeature> {
    const featuresHeader = headersList.get("x-tenant-features");
    if (!featuresHeader) return new Set();

    try {
        // En Next.js el header viaja tradicionalmente como string separado por comas: "SHOP,BLOG,LMS"
        const featuresArray = featuresHeader.split(",").map((f: string) => f.trim() as TenantFeature);
        return new Set(featuresArray);
    } catch (e) {
        console.error("[getTenantFeatures] Error parsing features header:", e);
        return new Set();
    }
}
