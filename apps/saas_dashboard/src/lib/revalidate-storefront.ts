"use server";

import { headers } from "next/headers";
import { TENANT_ID } from "./config";

export async function revalidateStorefront(options: { tag?: string, path?: string } = {}) {
    try {
        const { tag, path } = options;
        const headersList = await headers();
        const publicHost = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
        const tenantIdFromHeader = headersList.get("x-tenant-id") || TENANT_ID;

        // Construir URL del storefront usando el host público
        // Si el host tiene puerto o es local, suele ser desarrollo (HTTP). En produccion es HTTPS.
        const hasPort = publicHost.includes(":") && !publicHost.includes(":443");
        const isInternalDocker = publicHost.includes("web-projects") || publicHost.includes("api-") || publicHost.includes("dashboard-");
        const protocol = publicHost.includes("127.0.0.1") || publicHost.includes("localhost") || hasPort || isInternalDocker ? "http" : "https";
        const url = `${protocol}://${publicHost}/api/revalidate`;

        // Configurar payload
        const payload: { tag?: string, path?: string } = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;

        if (!tag && !path) {
            payload.tag = `tenant-${tenantIdFromHeader}-store`; // Default
        }

        console.log(`[Revalidate] Fetching: ${url} with payload:`, payload);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": process.env.INTERNAL_API_KEY || "default_dev_secret_key",
                "x-tenant-id": tenantIdFromHeader // Propagar el tenant id para evitar que la tienda cargue datos erróneos
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error(`❌ Failed to revalidate storefront:`, await res.text());
        } else {
            console.log(`✅ Revalidated storefront successfully`);
        }
    } catch (e) {
        console.error(`❌ Error triggering revalidate webhook:`, e);
    }
}
