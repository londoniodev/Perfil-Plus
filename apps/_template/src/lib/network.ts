/**
 * Utilidades para el manejo de red y URLs dinámicas en entornos Multi-Tenant.
 */

/**
 * Obtiene la URL base dinámica del tenant actual.
 * Considera el protocolo (http/https) según el entorno.
 * 
 * @param headers - Headers de la petición (Next.js headers())
 * @returns La URL base del sitio (ej: https://tienda.com)
 */
export function getDynamicUrl(headers: Headers): string {
    // Si hay una URL pública forzada en el env, la usamos
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    }

    const host = headers.get("x-forwarded-host") || headers.get("host") || "localhost:3000";
    
    // Detectar si es local para el protocolo
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
    const protocol = isLocal ? "http" : "https";

    return `${protocol}://${host}`;
}
