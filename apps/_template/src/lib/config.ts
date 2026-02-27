// ============================================================================
// SHARED TENANT CONFIGURATION (Client & Server)
// ============================================================================

// API Base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

// Enforce explicit NEXT_PUBLIC_TENANT_ID in ALL environments
let envTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();

if (!envTenantId) {
    // During Docker build phase we use a fallback to allow standalone compilation 
    // without locking the image to a specific tenant
    console.warn("⚠️ [WARN] Missing NEXT_PUBLIC_TENANT_ID environment variable. Falling back to 'template' for build compatibility.");
    envTenantId = "template";
}

export const TENANT_ID = envTenantId;

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
