"use server";

import { headers } from "next/headers";
import { TENANT_ID } from "./config";

export async function revalidateStorefront(options: { tag?: string, path?: string } = {}) {
    try {
        const { tag, path } = options;
        const headersList = await headers();
        const host = headersList.get("host");

        if (!host) {
            console.warn("⚠️ Cannot resolve host header for storefront revalidation.");
            return;
        }

        // Construir URL del storefront (Next.js público)
        const protocol = host.includes("127.0.0.1") || host.includes("localhost") ? "http" : "https";
        const url = `${protocol}://${host}/api/revalidate`;

        // Configurar payload
        const payload: { tag?: string, path?: string } = {};
        if (tag) payload.tag = tag;
        if (path) payload.path = path;

        if (!tag && !path) {
            payload.tag = `tenant-${TENANT_ID}-store`; // Default
        }

        console.log(`[Revalidate] Fetching: ${url} with payload:`, payload);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": process.env.INTERNAL_API_KEY || "default_dev_secret_key",
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
