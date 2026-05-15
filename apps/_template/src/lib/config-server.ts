import { headers } from 'next/headers';

// ── Environment Configuration ──
export const INTERNAL_API_URL = (process.env.INTERNAL_API_URL || 'http://localhost:3001/api').replace(/\/+$/, "");
export const S3_PUBLIC_ENDPOINT = (process.env.S3_ENDPOINT || "http://localhost:9000").replace(/\/+$/, "");
export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'default_dev_secret_key';

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
