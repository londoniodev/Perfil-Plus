"use server";

import { getTenantId } from "./config-server";
import { serverFetch } from "./api-server";

/**
 * Revalida el storefront del tenant bajo demanda (ISR).
 * Respeta la jerarquía de red:
 * 1. Fuente de Verdad Interna (Docker): STOREFRONT_URL o INTERNAL_STOREFRONT_URL.
 * 2. Fallback Público: Basado en el slug del tenant.
 */
export async function revalidateStorefront(options: { tag?: string, path?: string, tenant?: { id: string, slug: string } } = {}) {
    try {
        const { tag, path } = options;
        let { tenant } = options;

        const revalidationSecret = process.env.REVALIDATION_SECRET;
        const internalUrl = process.env.STOREFRONT_URL || process.env.INTERNAL_STOREFRONT_URL;
        
        if (!revalidationSecret) {
            console.warn("[ISR] ⚠️ REVALIDATION_SECRET no definido. Saltando revalidación.");
            return;
        }

        // Determinar URL de destino
        let targetUrl = "";
        
        if (internalUrl) {
            targetUrl = `${internalUrl.replace(/\/+$/, "")}/api/revalidate`;
        } else {
            // Obtener tenant si no viene en opciones para el fallback público
            if (!tenant) {
                const tenantId = await getTenantId();
                if (tenantId && tenantId !== 'default') {
                    tenant = await serverFetch<any>(`/tenant/${tenantId}`).catch(() => null);
                }
            }
            if (tenant?.slug) {
                const mainDomain = process.env.MAIN_DOMAIN || "alvarolondono.dev";
                targetUrl = `https://${tenant.slug}.${mainDomain}/api/revalidate`;
            }
        }

        if (!targetUrl) {
            console.error("[ISR] ❌ No se pudo determinar la URL de revalidación.");
            return;
        }

        // Preparar payload
        const payload: Record<string, string> = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;
        
        // Tag por defecto si no hay nada específico
        if (!tag && !path) {
            const tenantId = await getTenantId();
            payload.tag = `tenant-${tenantId}-store`;
        }

        // Ejecutar revalidación (Un solo intento silencioso)
        const isInternal = !!internalUrl;
        console.log(`[ISR] 🔄 Revalidando vía ${isInternal ? 'Red Interna' : 'Dominio Público'}: ${targetUrl} [${payload.tag || payload.path}]`);

        const res = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": revalidationSecret
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(5000)
        }).catch(err => ({ ok: false, statusText: err.message }));

        if (res.ok) {
            console.log(`[ISR] ✅ Éxito en ${targetUrl}`);
        } else {
            console.error(`[ISR] ❌ Falló en ${targetUrl}: ${res.statusText || 'Error desconocido'}`);
        }

    } catch (error: any) {
        console.error(`[ISR] ❌ Error crítico orchestrador: ${error.message}`);
    }
}
