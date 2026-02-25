// ============================================================================
// SERVER-ONLY TENANT CONFIGURATION
// ============================================================================

import { headers } from 'next/headers';

/**
 * Get tenant ID from request headers (Server Components only)
 * This reads the x-tenant-id header injected by middleware
 */
export async function getTenantId(): Promise<string> {
    try {
        const headersList = await headers();
        const tenantFromHeader = headersList.get('x-tenant-id');
        if (tenantFromHeader) {
            return tenantFromHeader;
        }
    } catch {
        // headers() not available (context issue)
    }
    return process.env.NEXT_PUBLIC_TENANT_ID || 'default';
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
