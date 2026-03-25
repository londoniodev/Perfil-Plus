"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";

export async function uploadLandingHtmlAction(formData: FormData) {
    try {
        const tenantSlug = formData.get("tenantSlug") as string;
        const pageSlug = formData.get("pageSlug") as string;
        const file = formData.get("file") as File;

        if (!tenantSlug || !pageSlug || !file) {
            return { success: false, error: "Faltan campos obligatorios" };
        }

        const label = formData.get("label") as string;

        // Crear un nuevo FormData para la API (NestJS espera 'file' y campos de texto)
        const apiFormData = new FormData();
        apiFormData.append("file", file);
        apiFormData.append("tenantSlug", tenantSlug);
        apiFormData.append("pageSlug", pageSlug);
        if (label) apiFormData.append("label", label);

        // Llamar a la API
        // NOTA: No pasamos Content-Type para que el navegador/servidor maneje el Boundary
        const result = await serverFetch<any>("/storage/landing", {
            method: "POST",
            body: apiFormData,
        });

        // Revalidar el storefront del tenant
        // Usamos nuestro endpoint de revalidación interno
        try {
            const revalidateUrl = process.env.NEXT_PUBLIC_TEMPLATE_URL 
                ? `${process.env.NEXT_PUBLIC_TEMPLATE_URL}/api/revalidate`
                : `https://${tenantSlug}.alvarolondono.dev/api/revalidate`;

            await fetch(revalidateUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tag: `landings-${tenantSlug}`,
                    secret: process.env.REVALIDATION_SECRET,
                }),
            });
        } catch (e) {
            console.error("[Uploader] Error disparando revalidación:", e);
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("[Uploader Action Error]:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error desconocido al subir" };
    }
}

export async function listLandingsAction(tenantSlug: string) {
    try {
        const result = await serverFetch<any[]>(`/storage/landing/${tenantSlug}`, {
            method: "GET",
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("[List Landings Error]:", error);
        return { success: false, error: "Error conectando con el servidor" };
    }
}
