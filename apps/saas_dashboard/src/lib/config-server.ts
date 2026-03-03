// ============================================================================
// SERVER-ONLY TENANT CONFIGURATION
// ============================================================================

import { headers } from 'next/headers';
import { cookies } from 'next/headers';

/**
 * Get tenant ID for API calls (Server Components only)
 * 
 * En saas_dashboard (multi-tenant), el tenantId del usuario viene del JWT.
 * NEXT_PUBLIC_TENANT_ID es el ID del dashboard ("admin_build"), NO del usuario.
 */
export async function getTenantId(): Promise<string> {
    // 1. Intentar extraer tenantId del JWT del usuario autenticado
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('Authentication')?.value || cookieStore.get('accessToken')?.value;

        if (token) {
            // Decodificar JWT sin verificar firma (solo lectura del payload)
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
                if (payload.tenantId) {
                    return payload.tenantId;
                }
            }
        }
    } catch {
        // Cookie/JWT no disponible
    }

    // 2. Header inyectado por middleware (si existiera)
    try {
        const headersList = await headers();
        const tenantFromHeader = headersList.get('x-tenant-id');
        if (tenantFromHeader) {
            return tenantFromHeader;
        }
    } catch {
        // headers() not available (static rendering or build context)
    }

    // 3. Fallback: env var (solo para rutas públicas sin auth, ej: login page)
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (envTenantId) {
        return envTenantId;
    }

    console.warn('[config-server] ⚠️ No tenantId found from JWT, headers, or env. Falling back to "default".');
    return 'default';
}

/**
 * Get API headers for Server Components (async version)
 * Reads tenant ID from JWT or middleware-injected header
 */
export async function getServerApiHeaders(additionalHeaders?: HeadersInit): Promise<HeadersInit> {
    const tenantId = await getTenantId();
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        ...additionalHeaders,
    };
}
