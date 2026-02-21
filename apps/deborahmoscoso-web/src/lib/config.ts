// ============================================================================
// SHARED TENANT CONFIGURATION (Client & Server)
// ============================================================================

// API Base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

// Static fallback for client components and build time
// Enforce explicit NEXT_PUBLIC_TENANT_ID in production builds
const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();

if (!envTenantId && process.env.NODE_ENV === 'production') {
    throw new Error(
        "❌ [FATAL ERROR] Missing NEXT_PUBLIC_TENANT_ID environment variable.\n" +
        "You must provide this variable as a build-time argument in Dokploy/Vercel."
    );
}

export const TENANT_ID = envTenantId || 'deborahmoscoso';

/**
 * Get API headers with tenant ID
 * Use this for all API calls to ensure tenant context is passed
 */
export function getApiHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
        ...additionalHeaders,
    };
}
