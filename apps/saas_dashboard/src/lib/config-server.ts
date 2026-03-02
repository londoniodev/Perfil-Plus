// ============================================================================
// SERVER-ONLY TENANT CONFIGURATION
// ============================================================================

import { headers } from 'next/headers';

/**
 * Get tenant ID from request headers (Server Components only)
 * This reads the x-tenant-id header injected by middleware
 */
export async function getTenantId(): Promise<string> {
    // 1. Intentar leer del header inyectado por middleware (si existiera)
    try {
        const headersList = await headers();
        const tenantFromHeader = headersList.get('x-tenant-id');
        if (tenantFromHeader) {
            return tenantFromHeader;
        }
    } catch {
        // headers() not available (static rendering or build context)
    }

    // 2. Usar la variable de entorno (siempre disponible en Next.js para NEXT_PUBLIC_*)
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (envTenantId) {
        return envTenantId;
    }

    // 3. Fallback de emergencia - esto NO debería ocurrir en producción
    console.warn('[config-server] ⚠️ NEXT_PUBLIC_TENANT_ID is NOT SET. Falling back to "default". This WILL cause errors.');
    return 'default';
}

/**
 * Get API headers for Server Components (async version)
 * Reads tenant ID from middleware-injected header
 */
export async function getServerApiHeaders(additionalHeaders?: HeadersInit): Promise<HeadersInit> {
    const tenantId = await getTenantId();
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        ...additionalHeaders,
    };
}
