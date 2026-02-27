// ============================================================================
// SHARED TENANT CONFIGURATION (Client & Server)
// ============================================================================

// API Base URL
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api").replace(/\/+$/, "");

/**
 * Get API headers with tenant ID
 * Use this for all API calls to ensure tenant context is passed
 * @param tenantId The dynamic tenant ID from useTenant() or headers()
 */
export function getApiHeaders(tenantId: string, additionalHeaders?: HeadersInit): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        ...additionalHeaders,
    };
}

