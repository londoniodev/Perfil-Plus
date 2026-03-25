"use server";

import { getTenantId } from "./config-server";
import { serverFetch } from "./api-server";

/**
 * Revalida el storefront del tenant bajo demanda (ISR).
 * SIGUE REGLAS ESTRICTAS DE RED EN PRODUCCIÓN:
 * 1. Fuente única de verdad: process.env.STOREFRONT_URL (Ej: http://web-storefront:3000)
 * 2. Fallback: URL pública basada en slug: https://${slug}.${MAIN_DOMAIN}
 * 3. Ejecución limpia y secuencial (sin cascadas de promesas).
 */
export async function revalidateStorefront(options: { tag?: string, path?: string, tenant?: { id: string, slug: string } } = {}) {
    let url = "";
    try {
        const { tag, path } = options;
        let { tenant } = options;

        const storefrontUrl = process.env.STOREFRONT_URL; 
        const revalidationSecret = process.env.REVALIDATION_SECRET;
        const mainDomain = process.env.MAIN_DOMAIN || "alvarolondono.dev";

        if (!revalidationSecret) {
            console.error(`[Revalidate] ❌ REVALIDATION_SECRET no configurado. Se omite actualización ISR.`);
            return;
        }


        // 1. Single Source of Truth: URL interna de Docker
        if (storefrontUrl) {
            url = `${storefrontUrl.replace(/\/+$/, "")}/api/revalidate`;
        } 
        // 2. Fallback: URL pública del tenant
        else {
            if (!tenant) {
                try {
                    const tenantId = await getTenantId();
                    if (tenantId && tenantId !== 'default') {
                        // Obtener el slug del tenant desde el API central para el fallback
                        tenant = await serverFetch<any>(`/tenant/${tenantId}`);
                    }
                } catch (e) {
                    console.error(`[Revalidate] ⚠️ No se pudo obtener el tenant para URL de fallback:`, e);
                }
            }

            if (tenant?.slug) {
                url = `https://${tenant.slug}.${mainDomain}/api/revalidate`;
            }
        }

        if (!url) {
            console.error(`[Revalidate] ❌ No se pudo determinar una URL de revalidación (STOREFRONT_URL ausente y fallback falló).`);
            return;
        }

        const payload: { tag?: string, path?: string } = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;

        // Tag de seguridad por tenant si no se especifica nada
        if (!tag && !path) {
            const tenantId = await getTenantId();
            payload.tag = `tenant-${tenantId || 'global'}-store`;
        }

        console.log(`[Revalidate] 🔄 Intentando ISR: ${url} | Tag: ${payload.tag || 'path only'}`);

        // Ejecución ÚNICA, limpia y secuencial (Anti Memory Leak)
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": revalidationSecret
            },
            body: JSON.stringify(payload),
            // Timeout preventivo para evitar bloqueos en el backend
            signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
            console.log(`✅ Storefront ISR ejecutado con éxito vía ${url}`);
        } else {
            const errBody = await res.text();
            console.error(`❌ Revalidation falló en ${url}: Status ${res.status} - ${errBody}`);
        }

    } catch (e: any) {
        // Captura silenciosa con advertencia: la revalidación es una mejora, no debe bloquear el éxito del action
        console.warn(`[Revalidate] ⚠️ Sin conexión con el storefront para ISR (${url}):`, e?.message || e);
    }
}
