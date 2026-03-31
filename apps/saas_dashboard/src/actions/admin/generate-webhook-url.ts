"use server"

import { getSessionUser } from "@/lib/auth-server"

/**
 * Genera la URL del webhook de Bold para el tenant actual.
 * Usa variables de entorno del servidor (NEXT_PUBLIC_API_URL) para construir la URL.
 * NUNCA hardcodea dominios.
 */
export async function generateBoldWebhookUrl(): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const user = await getSessionUser()
        if (!user || !user.tenantId) {
            return { success: false, error: "No se pudo obtener el tenant. Inicia sesión nuevamente." }
        }

        const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/+$/, "")
        // Asegurarnos de que termine en /api
        const apiUrl = apiBaseUrl.endsWith("/api") ? apiBaseUrl : `${apiBaseUrl}/api`

        const webhookUrl = `${apiUrl}/payments/webhook/bold?tenantId=${user.tenantId}`

        return { success: true, url: webhookUrl }
    } catch (error: any) {
        return { success: false, error: error.message || "Error generando URL del webhook" }
    }
}
