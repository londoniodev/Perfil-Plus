"use server";

import { headers } from "next/headers";
import { TENANT_ID } from "./config";

export async function revalidateStorefront(options: { tag?: string, path?: string, host?: string } = {}) {
    try {
        const { tag, path, host } = options;
        const headersList = await headers();
        const fallbackHost = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
        const publicHost = host || fallbackHost;
        
        // Resolve tenant from JWT (session) to know which storefront to revalidate
        const { getTenantId } = await import("./config-server");
        const tenantId = await getTenantId();

        // El secreto DEBE ser REVALIDATION_SECRET para coincidir con el webhook de _template
        const revalidationSecret = process.env.REVALIDATION_SECRET;

        if (!revalidationSecret) {
            console.warn(`[Revalidate] REVALIDATION_SECRET is not configured in Saas Dashboard. ISR update skipped.`);
            return;
        }

        // Construir URL del storefront
        const hasPort = publicHost.includes(":") && !publicHost.includes(":443");
        const isInternalDocker = publicHost.includes("web-projects") || publicHost.includes("api-") || publicHost.includes("dashboard-");
        const protocol = publicHost.includes("127.0.0.1") || publicHost.includes("localhost") || hasPort || isInternalDocker ? "http" : "https";
        // Candidates for revalidation (Public URL, Localhost, internal Docker)
        const candidates = [
            `${protocol}://${publicHost}/api/revalidate`,
            `http://localhost:3000/api/revalidate`,
            `http://template:3000/api/revalidate`
        ];

        let success = false;
        let lastError = "";

        const payload: { tag?: string, path?: string } = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;

        if (!tag && !path) {
            payload.tag = `tenant-${tenantId}-store`; 
        }

        // Usar Set para evitar duplicaciones si publicHost es localhost
        for (const url of Array.from(new Set(candidates))) {
            try {
                console.log(`[Revalidate] Attempting ISR: ${url} | Tag: ${payload.tag || 'none'}`);
                
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-revalidate-secret": revalidationSecret
                    },
                    body: JSON.stringify(payload),
                    // Crucial: Timeout corto para los fallbacks
                    signal: AbortSignal.timeout(3000) 
                });

                if (res.ok) {
                    console.log(`✅ Storefront ISR triggered successfully via ${url}`);
                    success = true;
                    break;
                } else {
                    const errBody = await res.text();
                    lastError = `Status ${res.status}: ${errBody}`;
                    console.warn(`⚠️ Revalidate via ${url} failed: ${lastError}`);
                }
            } catch (e: any) {
                lastError = e?.message || String(e);
                console.warn(`⚠️ Revalidate via ${url} error: ${lastError}`);
            }
        }

        if (!success) {
            console.error(`❌ ALL revalidation attempts failed. Last error: ${lastError}`);
        }
    } catch (e) {
        console.error(`❌ Error triggering revalidate webhook:`, e);
    }
}
