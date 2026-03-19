"use server";

import { headers } from "next/headers";
import { TENANT_ID } from "./config";

export async function revalidateStorefront(options: { tag?: string, path?: string } = {}) {
    try {
        const { tag, path } = options;
        const headersList = await headers();
        const publicHost = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
        const tenantIdFromHeader = headersList.get("x-tenant-id") || TENANT_ID;

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
        const url = `${protocol}://${publicHost}/api/revalidate`;

        const payload: { tag?: string, path?: string } = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;

        if (!tag && !path) {
            payload.tag = `tenant-${tenantIdFromHeader}-store`; 
        }

        console.log(`[Revalidate] Triggering ISR: ${url} | Tag: ${payload.tag || 'none'} | Path: ${payload.path || 'none'}`);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": revalidationSecret,
                "x-tenant-id": tenantIdFromHeader
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to revalidate storefront (${res.status}): ${errorText}`);
        } else {
            console.log(`✅ Storefront ISR triggered successfully`);
        }
    } catch (e) {
        console.error(`❌ Error triggering revalidate webhook:`, e);
    }
}
